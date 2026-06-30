#!/usr/bin/env node
/**
 * Configura automáticamente mascafé.com → GitHub Pages.
 *
 * 1. GoDaddy DNS (A @ + CNAME www) vía API
 * 2. Custom domain en GitHub Pages vía API
 * 3. Verificación DNS/HTTP
 *
 * Uso:
 *   npm run domain:configure
 *   npm run domain:configure -- --dry-run
 *   npm run domain:configure -- --skip-godaddy
 *   npm run domain:configure -- --skip-github
 *
 * Variables (.env.local):
 *   GODADDY_API_KEY, GODADDY_API_SECRET
 *   GITHUB_TOKEN (o GH_TOKEN)
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  DOMAIN_DISPLAY,
  DOMAIN_PUNYCODE,
  DOMAIN_URL,
  GITHUB_PAGES_SETTINGS,
  GODADDY_DNS_PANEL,
  loadSettings,
  parseArgs,
} from "./lib/domain-config.mjs";
import {
  configureGodaddyForGitHubPages,
  testGodaddyCredentials,
  getDnsRecords,
} from "./lib/godaddy-api.mjs";
import {
  configureGithubPagesDomain,
  getPagesConfig,
  testGithubCredentials,
} from "./lib/github-pages-api.mjs";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function log(step, msg) {
  console.log(`\n[${step}] ${msg}`);
}

function updateSettingsFlag() {
  const settingsPath = path.join(root, "content/settings.json");
  if (!existsSync(settingsPath)) return;
  const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  settings.dnsConfiguredAt = new Date().toISOString();
  settings.dnsConfiguredBy = "npm run domain:configure";
  writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

async function appendRegistro(nota) {
  const registroPath = path.join(root, "proyecto-mas-cafe/cuentas/REGISTRO-HECHO.md");
  if (!existsSync(registroPath)) return;
  const line = `- [x] DNS automático | ${nota} | ${new Date().toISOString().slice(0, 10)} | Cursor script\n`;
  const content = readFileSync(registroPath, "utf8");
  if (content.includes("DNS automático")) return;
  const marker = "### GoDaddy\n";
  if (content.includes(marker)) {
    writeFileSync(registroPath, content.replace(marker, `${marker}${line}`));
  }
}

async function main() {
  const opts = parseArgs();
  const settings = loadSettings();

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Configuración automática — mascafé.com");
  console.log(`  Dominio: ${DOMAIN_DISPLAY} (${DOMAIN_PUNYCODE})`);
  console.log(`  Destino: GitHub Pages → ${DOMAIN_URL}`);
  if (opts.dryRun) console.log("  MODO: dry-run (no aplica cambios)");
  console.log("═══════════════════════════════════════════════════");

  // ── GoDaddy ─────────────────────────────────────────────
  if (!opts.skipGodaddy) {
    log("1/3", "GoDaddy DNS");
    try {
      if (!opts.dryRun) await testGodaddyCredentials();
      console.log("  Credenciales GoDaddy: OK");

      if (!opts.dryRun) {
        const before = await getDnsRecords();
        const aCount = before.filter((r) => r.type === "A" && r.name === "@").length;
        const wwwCname = before.find((r) => r.type === "CNAME" && r.name === "www");
        console.log(`  DNS actual: ${aCount} registro(s) A en @, www CNAME → ${wwwCname?.data || "—"}`);
      }

      const result = await configureGodaddyForGitHubPages({ dryRun: opts.dryRun });
      if (opts.dryRun) {
        console.log("  Simulación apex:", JSON.stringify(result.apex.records, null, 2));
        console.log("  Simulación www:", JSON.stringify(result.www.records, null, 2));
      } else {
        console.log(`  ✅ A records @ actualizados (${result.apex.updated} IPs GitHub)`);
        console.log(`  ✅ CNAME www → ${result.www.target}`);
      }
    } catch (err) {
      console.error(`  ❌ GoDaddy: ${err.message}`);
      console.log(`  Manual: ${GODADDY_DNS_PANEL}`);
      if (!opts.skipGithub) console.log("  Continuando con GitHub…");
    }
  } else {
    log("1/3", "GoDaddy DNS — omitido (--skip-godaddy)");
  }

  // ── GitHub Pages ───────────────────────────────────────
  if (!opts.skipGithub) {
    log("2/3", "GitHub Pages custom domain");
    try {
      if (!opts.dryRun) await testGithubCredentials();
      console.log("  Credenciales GitHub: OK");

      const cname = settings.customDomain || DOMAIN_DISPLAY;
      const pagesBefore = !opts.dryRun ? await getPagesConfig() : null;
      if (pagesBefore) {
        console.log(`  Custom domain actual: ${pagesBefore.cname || "(ninguno)"}`);
      }

      const result = await configureGithubPagesDomain({ cname, dryRun: opts.dryRun });
      if (opts.dryRun) {
        console.log("  Simulación:", JSON.stringify(result.payload, null, 2));
      } else {
        console.log(`  ✅ Custom domain configurado: ${cname}`);
        console.log(`  Panel: ${GITHUB_PAGES_SETTINGS}`);
        console.log("  Activa «Enforce HTTPS» cuando el check DNS esté verde.");
      }
    } catch (err) {
      console.error(`  ❌ GitHub: ${err.message}`);
      console.log(`  Manual: ${GITHUB_PAGES_SETTINGS}`);
    }
  } else {
    log("2/3", "GitHub Pages — omitido (--skip-github)");
  }

  // ── Verificación ───────────────────────────────────────
  log("3/3", "Verificación");
  if (opts.dryRun) {
    console.log("  Omitida en dry-run. Ejecuta: npm run domain:verify");
  } else {
    try {
      execSync("node scripts/verify-domain.mjs", { cwd: root, stdio: "inherit" });
      updateSettingsFlag();
      await appendRegistro("npm run domain:configure");
    } catch {
      console.log("\n  ⏳ DNS propagando (normal: 10 min – 48 h).");
      console.log("  Repite: npm run domain:verify");
    }
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Listo. Cuando DNS propague:");
  console.log(`  → ${DOMAIN_URL}`);
  console.log("═══════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});

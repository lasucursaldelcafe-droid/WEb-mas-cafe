#!/usr/bin/env node
/**
 * Post-publicación automática: SEO Google + HTTPS + dominio.
 * Se ejecuta tras cada deploy y en mantenimiento programado.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { runGoogleSeoSync } from "./lib/google-seo-sync.mjs";
import { configureGodaddyForGitHubPages } from "./lib/godaddy-api.mjs";
import { isDnsReadyForGitHubPages } from "./lib/dns-check.mjs";
import { checkAuthoritativeApex } from "./lib/dns-authoritative.mjs";
import {
  configureGithubPagesDomain,
  getPagesConfig,
  getPagesHealth,
  enableGithubPagesHttps,
  isCertificateReady,
} from "./lib/github-pages-api.mjs";
import { DOMAIN_DISPLAY, DOMAIN_PUNYCODE } from "./lib/domain-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const wait = process.argv.includes("--wait");
const maxWaitMin = Number(process.argv.find((a) => a.startsWith("--max-wait="))?.split("=")[1] || 30);

loadEnvLocal();

function log(msg) {
  console.log(`  ${msg}`);
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function tryEnableHttps() {
  const pages = await getPagesConfig();
  if (!pages?.cname) {
    await configureGithubPagesDomain({ cname: DOMAIN_PUNYCODE });
    log("Custom domain reaplicado");
  }

  let config = await getPagesConfig();
  const deadline = Date.now() + maxWaitMin * 60 * 1000;
  let attempts = 0;

  while (true) {
    attempts++;
    try {
      const health = await getPagesHealth({ retries: 2, delayMs: 3000 });
      const d = health.domain;
      log(`HTTPS intento ${attempts}: valid=${d?.is_valid} eligible=${d?.is_https_eligible} cert=${config?.https_certificate?.state}`);
    } catch {
      log(`HTTPS intento ${attempts}: health pendiente`);
    }

    config = await getPagesConfig();
    if (isCertificateReady(config)) {
      try {
        await enableGithubPagesHttps();
        config = await getPagesConfig();
        log(`✅ Enforce HTTPS: ${config?.https_enforced ? "activo" : "solicitado"}`);
      } catch (err) {
        log(`○ HTTPS enforce: ${err.message}`);
      }
      break;
    }

    if (!wait || Date.now() >= deadline) break;
    await sleep(60000);
  }

  try {
    const code = execSync(
      `curl -sL -o /dev/null -w "%{http_code}" --max-time 20 "https://${DOMAIN_PUNYCODE}/"`,
      { encoding: "utf8" },
    ).trim();
    log(`https://${DOMAIN_DISPLAY}/ → HTTP ${code}`);
    return code === "200";
  } catch {
    log("○ HTTPS aún no responde");
    return false;
  }
}

async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Post-publicación automática — Más Café");
  console.log("═══════════════════════════════════════════════════\n");

  // 1. Google SEO
  console.log("▸ 1/3 Google Search Console + sitemap");
  try {
    if (process.env.GODADDY_API_KEY) {
      const { sync, pings } = await runGoogleSeoSync({ ping: true });
      if (sync.verified) log(`✅ Verificación Google (DNS): ${sync.code.slice(0, 10)}…`);
      for (const p of pings) log(`${p.ok ? "✅" : "○"} Ping ${p.name}: ${p.status}`);
    } else {
      log("○ Sin credenciales GoDaddy — omitido sync Google");
    }
  } catch (err) {
    log(`○ Google SEO: ${err.message}`);
  }

  // 2. DNS GoDaddy
  console.log("\n▸ 2/3 DNS GoDaddy");
  try {
    if (process.env.GODADDY_API_KEY) {
      await configureGodaddyForGitHubPages();
      const auth = checkAuthoritativeApex();
      log(auth.allGithub ? "✅ DNS autoritativo → GitHub" : "○ DNS propagando");
    }
  } catch (err) {
    log(`○ DNS: ${err.message}`);
  }

  // 3. HTTPS
  console.log("\n▸ 3/3 HTTPS GitHub Pages");
  if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN && !process.env.GH_PAGES_PAT) {
    log("○ Sin token GitHub — omitido HTTPS");
  } else if (!isDnsReadyForGitHubPages()) {
    log("○ DNS público pendiente — HTTPS más tarde");
  } else {
    await tryEnableHttps();
  }

  // Rebuild si settings cambió (meta verification en HTML)
  try {
  const { sync } = await runGoogleSeoSync({ ping: false });
  if (sync.changed) {
    log("\n▸ Regenerando sitio (meta Google actualizada)");
    execSync("node scripts/build-github-pages.mjs", { cwd: root, stdio: "inherit" });
  }
  } catch { /* ignore */ }

  console.log("\n✅ Post-publicación completada.\n");
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});

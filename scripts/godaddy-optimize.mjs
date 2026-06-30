#!/usr/bin/env node
/**
 * Optimización completa GoDaddy — aplica todo lo posible vía API y diagnostica bloqueos.
 *
 * Uso:
 *   npm run godaddy:optimize
 *   npm run godaddy:optimize -- --dry-run
 */
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  DOMAIN_DISPLAY,
  DOMAIN_PUNYCODE,
  DOMAIN_URL,
  GITHUB_PAGES_A_RECORDS,
  GITHUB_PAGES_CNAME,
  GITHUB_PAGES_HOST,
  GODADDY_DNS_PANEL,
  GITHUB_PAGES_SETTINGS,
} from "./lib/domain-config.mjs";
import {
  configureGodaddyForGitHubPages,
  getDnsRecords,
  testGodaddyCredentials,
  putApexARecords,
  putWwwCname,
} from "./lib/godaddy-api.mjs";
import {
  checkAuthoritativeApex,
  formatParkingWarning,
  GODADDY_FORWARDING_URL,
} from "./lib/dns-authoritative.mjs";
import { isDnsReadyForGitHubPages } from "./lib/dns-check.mjs";
import {
  configureGithubPagesDomain,
  clearGithubPagesCustomDomain,
  getPagesConfig,
  getPagesHealth,
  enableGithubPagesHttps,
  isCertificateReady,
} from "./lib/github-pages-api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

function log(icon, msg) {
  console.log(`${icon} ${msg}`);
}

function section(title) {
  console.log(`\n▸ ${title}`);
}

function curlTitle(url) {
  try {
    const html = execSync(`curl -sL --max-time 15 "${url}"`, { encoding: "utf8" });
    const m = html.match(/<title>([^<]+)<\/title>/i);
    return m ? m[1].trim() : "(sin título)";
  } catch {
    return "(sin respuesta)";
  }
}

function verifyDnsRecords(records) {
  const a = records.filter((r) => r.type === "A" && r.name === "@").map((r) => r.data);
  const www = records.find((r) => r.type === "CNAME" && r.name === "www");
  const txtAt = records.filter((r) => r.type === "TXT" && r.name === "@");

  const aOk = GITHUB_PAGES_A_RECORDS.every((ip) => a.includes(ip)) && a.length === 4;
  const wwwOk = www?.data?.replace(/\.$/, "") === GITHUB_PAGES_CNAME.replace(/\.$/, "");
  const googleOk = txtAt.some((t) => t.data?.includes("google-site-verification"));

  return { a, www: www?.data, txtAt, aOk, wwwOk, googleOk };
}

async function main() {
  loadEnvLocal();

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Optimización GoDaddy — Más Café");
  console.log(`  Dominio: ${DOMAIN_DISPLAY} (${DOMAIN_PUNYCODE})`);
  if (dryRun) console.log("  MODO: dry-run");
  console.log("═══════════════════════════════════════════════════");

  if (!process.env.GODADDY_API_KEY || !process.env.GODADDY_API_SECRET) {
    console.error("\n❌ Faltan GODADDY_API_KEY y GODADDY_API_SECRET\n");
    process.exit(1);
  }

  await testGodaddyCredentials();
  log("✓", "Credenciales GoDaddy OK");

  // ── 1. DNS sitio web (GitHub Pages) ─────────────────────
  section("1/5 DNS sitio web → GitHub Pages");
  if (dryRun) {
    log("•", "Simulación A @ + CNAME www");
    await configureGodaddyForGitHubPages({ dryRun: true });
  } else {
    await putApexARecords(DOMAIN_PUNYCODE);
    await putWwwCname(DOMAIN_PUNYCODE);
    log("✓", `4 registros A @ → GitHub Pages`);
    log("✓", `CNAME www → ${GITHUB_PAGES_HOST}`);
  }

  const records = dryRun ? [] : await getDnsRecords();
  if (!dryRun) {
    const v = verifyDnsRecords(records);
    log(v.aOk ? "✓" : "✗", `A records API: ${v.a.join(", ")}`);
    log(v.wwwOk ? "✓" : "✗", `www CNAME: ${v.www || "—"}`);
    log(v.googleOk ? "✓" : "○", "Google Search Console TXT preservado");
  }

  // ── 2. Parking / forwarding ───────────────────────────
  section("2/5 Parking y reenvío (bloqueador principal)");
  const auth = checkAuthoritativeApex();
  for (const [ns, r] of Object.entries(auth.results)) {
    log(r.githubOk && !r.hasParking ? "✓" : "✗", `${ns}: ${r.ips.join(", ") || "vacío"}`);
  }

  const parkingBlocks = auth.anyParking || !auth.allGithub;
  if (parkingBlocks) {
    console.error(formatParkingWarning());
    console.log(`  Enlace directo reenvío: ${GODADDY_FORWARDING_URL}`);
    log("!", "La API DNS está correcta pero GoDaddy IGNORA los A records por reenvío activo.");
    log("!", "Esto bloquea HTTPS y el sitio en www.mascafé.com.");
  } else {
    log("✓", "Nameservers sirven GitHub Pages (sin parking)");
  }

  // ── 3. GitHub Pages custom domain + HTTPS ───────────────
  section("3/5 GitHub Pages + HTTPS");
  if (dryRun) {
    log("•", "Omitido en dry-run");
  } else if (parkingBlocks) {
    const pages = await getPagesConfig().catch(() => null);
    if (pages?.cname) {
      await clearGithubPagesCustomDomain();
      log("✓", "Custom domain quitado temporalmente (evita errores mientras hay parking)");
    } else {
      log("○", "Custom domain ya desactivado");
    }
  } else if (isDnsReadyForGitHubPages()) {
    await configureGithubPagesDomain();
    log("✓", `Custom domain: ${DOMAIN_PUNYCODE}`);

    try {
      const health = await getPagesHealth({ retries: 2, delayMs: 3000 });
      const d = health.domain;
      log(d?.is_valid ? "✓" : "○", `Health apex valid=${d?.is_valid} https_eligible=${d?.is_https_eligible}`);

      const pages = await getPagesConfig();
      if (isCertificateReady(pages)) {
        try {
          await enableGithubPagesHttps();
          log("✓", "Enforce HTTPS activado");
        } catch (err) {
          log("○", `HTTPS: ${err.message}`);
        }
      } else {
        log("○", `Certificado SSL: ${pages?.https_certificate?.state || "pendiente"}`);
      }
    } catch (err) {
      log("○", `Health check: ${err.message}`);
    }
  } else {
    log("○", "DNS público aún propagando — custom domain pendiente");
  }

  // ── 4. Comprobación HTTP ──────────────────────────────
  section("4/5 Comprobación en vivo");
  if (!dryRun) {
    const urls = [
      `http://${DOMAIN_PUNYCODE}/`,
      `https://${DOMAIN_PUNYCODE}/`,
      `http://www.${DOMAIN_PUNYCODE}/`,
    ];
    for (const url of urls) {
      const title = curlTitle(url);
      const isMasCafe = /Más Café/i.test(title);
      const isGodaddy = /godaddy|coming soon|próximo|lander/i.test(title);
      log(isMasCafe ? "✓" : isGodaddy ? "✗" : "○", `${url} → «${title}»`);
    }
  }

  // ── 5. Correo (estado, sin activar MX sin Zoho) ───────
  section("5/5 Correo institucional");
  const mx = records.filter((r) => r.type === "MX");
  if (!mx.length) {
    log("○", "MX no configurados (correcto hasta crear buzón Zoho)");
    log("→", "Guía: proyecto-mas-cafe/entregables/CORREO-INSTITUCIONAL.md");
    log("→", "npm run email:configure -- --provider zoho (tras crear buzón)");
  } else {
    mx.forEach((r) => log("✓", `MX ${r.priority} ${r.data}`));
  }

  // ── Resumen ───────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  if (parkingBlocks) {
    console.log("  ESTADO: DNS API ✅  |  Parking GoDaddy ❌  |  HTTPS ⏳");
    console.log("");
    console.log("  Acción requerida (5 min, solo en GoDaddy):");
    console.log(`  1. ${GODADDY_DNS_PANEL}`);
    console.log("  2. Pestaña «Reenvío» → Eliminar TODAS las reglas");
    console.log("  3. Mis productos → desconectar «Websites + Marketing»");
    console.log("  4. Esperar 15–30 min");
    console.log("  5. npm run godaddy:optimize");
    console.log("");
    console.log(`  Mientras tanto el sitio funciona en:`);
    console.log(`  https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/`);
  } else {
    console.log(`  ESTADO: Todo listo → ${DOMAIN_URL}`);
    console.log(`  Panel GitHub: ${GITHUB_PAGES_SETTINGS}`);
  }
  console.log("═══════════════════════════════════════════════════\n");

  process.exit(parkingBlocks ? 1 : 0);
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});

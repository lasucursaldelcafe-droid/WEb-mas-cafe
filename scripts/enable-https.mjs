#!/usr/bin/env node
/**
 * Diagnostica HTTPS y activa Enforce HTTPS en GitHub Pages cuando el DNS es válido.
 *
 * Uso:
 *   npm run domain:enable-https
 *   npm run domain:enable-https -- --wait
 */
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { configureGodaddyForGitHubPages } from "./lib/godaddy-api.mjs";
import {
  checkAuthoritativeApex,
  formatParkingWarning,
} from "./lib/dns-authoritative.mjs";
import { isDnsReadyForGitHubPages } from "./lib/dns-check.mjs";
import {
  DOMAIN_DISPLAY,
  DOMAIN_PUNYCODE,
  GITHUB_PAGES_SETTINGS,
  parseArgs,
} from "./lib/domain-config.mjs";
import {
  enableGithubPagesHttps,
  getPagesConfig,
  getPagesHealth,
  isCertificateReady,
  configureGithubPagesDomain,
} from "./lib/github-pages-api.mjs";
import { saveSeoSiteUrl } from "./lib/seo.mjs";

loadEnvLocal();

const { wait } = parseArgs();

function log(msg) {
  console.log(`\n▸ ${msg}`);
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  HTTPS — mascafé.com");
  console.log(`  Dominio: ${DOMAIN_DISPLAY} (${DOMAIN_PUNYCODE})`);
  console.log("═══════════════════════════════════════════════════");

  log("1/4 DNS autoritativo (nameservers GoDaddy)");
  const auth = checkAuthoritativeApex();
  for (const [ns, r] of Object.entries(auth.results)) {
    console.log(`  ${ns}: ${r.ips.join(", ") || "(vacío)"}`);
    console.log(r.githubOk && !r.hasParking ? "    ✅ GitHub Pages" : "    ❌ Parking o IPs incorrectas");
  }

  if (auth.anyParking || !auth.allGithub) {
    console.error(formatParkingWarning());
    process.exit(1);
  }

  log("2/4 Reaplicar DNS GoDaddy + custom domain");
  await configureGodaddyForGitHubPages();
  if (!isDnsReadyForGitHubPages()) {
    console.log("  ⏳ DNS público aún propagando…");
    if (!wait) {
      console.log("  Repite con: npm run domain:enable-https -- --wait");
      process.exit(1);
    }
  } else {
    console.log("  ✅ DNS público OK");
  }

  await configureGithubPagesDomain();
  console.log("  ✅ Custom domain activo");

  log("3/4 Health check GitHub Pages");
  let health;
  let attempts = wait ? 30 : 3;
  for (let i = 0; i < attempts; i++) {
    health = await getPagesHealth({ retries: 1, delayMs: 2000 });
    const d = health.domain;
    const alt = health.alt_domain;
    console.log(
      `  intento ${i + 1}: apex valid=${d?.is_valid} https_eligible=${d?.is_https_eligible} | www valid=${alt?.is_valid} https_error=${alt?.https_error || "—"}`,
    );
    if (d?.is_valid && d?.is_https_eligible) break;
    if (!wait) break;
    await sleep(60000);
  }

  if (!health?.domain?.is_valid) {
    console.log("\n  ⏳ GitHub aún no valida el dominio (NotServedByPages).");
    console.log(`  Panel: ${GITHUB_PAGES_SETTINGS}`);
    process.exit(1);
  }

  log("4/4 Certificado y Enforce HTTPS");
  let pages = await getPagesConfig();
  console.log(`  Certificado: ${pages?.https_certificate?.state || "—"} — ${pages?.https_certificate?.description || ""}`);

  if (!isCertificateReady(pages) && wait) {
    for (let i = 0; i < 60; i++) {
      await sleep(60000);
      pages = await getPagesConfig();
      const state = pages?.https_certificate?.state;
      console.log(`  esperando cert… ${state}`);
      if (isCertificateReady(pages)) break;
    }
  }

  if (!isCertificateReady(pages)) {
    console.log("\n  ⏳ Certificado SSL en proceso (normal: 15 min – 48 h tras DNS correcto).");
    console.log(`  Cuando el check esté verde: ${GITHUB_PAGES_SETTINGS}`);
    console.log("  Vuelve a ejecutar: npm run domain:enable-https");
    process.exit(0);
  }

  try {
    await enableGithubPagesHttps();
    pages = await getPagesConfig();
    console.log(`  ✅ Enforce HTTPS: ${pages?.https_enforced ? "activado" : "pendiente"}`);
  } catch (err) {
    if (String(err).includes("Toggling https is disabled")) {
      console.log("\n  ⏳ GitHub aún no permite forzar HTTPS — espera al check DNS verde.");
      process.exit(0);
    }
    throw err;
  }

  try {
    const code = execSync(
      `curl -sL -o /dev/null -w "%{http_code}" --max-time 20 "https://${DOMAIN_PUNYCODE}/"`,
      { encoding: "utf8" },
    ).trim();
    console.log(`\n  HTTPS https://${DOMAIN_DISPLAY}/ → HTTP ${code}`);
    if (code === "200") {
      saveSeoSiteUrl(`https://${DOMAIN_PUNYCODE}`, { httpsReady: true });
      console.log("  ✅ settings.json → httpsReady + siteUrl HTTPS");
      console.log("\n✅ Conexión segura lista. Ejecuta: npm run build:github-pages\n");
      process.exit(0);
    }
  } catch {
    console.log("\n  ⏳ HTTPS aún propagando en CDN…\n");
  }
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});

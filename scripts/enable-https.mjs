#!/usr/bin/env node
/**
 * Diagnostica HTTPS y activa Enforce HTTPS en GitHub Pages cuando el DNS es válido.
 *
 * Uso:
 *   npm run domain:enable-https
 *   npm run domain:enable-https -- --wait
 *   npm run domain:enable-https -- --wait --max-wait=45
 *   npm run domain:enable-https -- --skip-godaddy --kickstart
 */
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { configureGodaddyForGitHubPages, pruneBlockingDnsRecords, ensureCaaLetsEncrypt } from "./lib/godaddy-api.mjs";
import {
  checkAuthoritativeApex,
  formatParkingWarning,
} from "./lib/dns-authoritative.mjs";
import { isDnsReadyForGitHubPages } from "./lib/dns-check.mjs";
import {
  DOMAIN_DISPLAY,
  DOMAIN_PUNYCODE,
  DOMAIN_WWW_PUNYCODE,
  GITHUB_PAGES_SETTINGS,
  parseArgs,
} from "./lib/domain-config.mjs";
import {
  enableGithubPagesHttps,
  getPagesConfig,
  getPagesHealth,
  isCertificateReady,
  configureGithubPagesDomain,
  kickstartSslCertificate,
  switchGithubPagesDomain,
  isCertProvisioning,
  isCertActivelyProvisioning,
  isWwwCname,
} from "./lib/github-pages-api.mjs";
import { saveSeoSiteUrl } from "./lib/seo.mjs";

loadEnvLocal();

const opts = parseArgs();
const wait = opts.wait && !opts.noWait;
const maxWaitMin = opts.maxWaitMin || (wait ? 60 : 0);

function log(msg) {
  console.log(`\n▸ ${msg}`);
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

function hasGodaddyCreds() {
  return Boolean(process.env.GODADDY_API_KEY && process.env.GODADDY_API_SECRET);
}

function skipGodaddyStep() {
  return opts.skipGodaddy || !hasGodaddyCreds();
}

async function waitForCertificate(deadlineMs) {
  let pages = await getPagesConfig();
  while (Date.now() < deadlineMs) {
    if (isCertificateReady(pages)) return pages;
    await sleep(60_000);
    pages = await getPagesConfig();
    console.log(`  esperando cert… ${pages?.https_certificate?.state || "—"}`);
  }
  return pages;
}

async function verifyHttpsUrl(host) {
  const code = execSync(
    `curl -sL -o /dev/null -w "%{http_code}" --max-time 20 "https://${host}/"`,
    { encoding: "utf8" },
  ).trim();
  console.log(`\n  HTTPS https://${host}/ → HTTP ${code}`);
  return code === "200";
}

async function finalizeHttps(pages, siteHost) {
  if (!isCertificateReady(pages)) return false;
  try {
    await enableGithubPagesHttps();
    pages = await getPagesConfig();
    console.log(`  ✅ Enforce HTTPS: ${pages?.https_enforced ? "activado" : "pendiente"}`);
  } catch (err) {
    if (String(err).includes("Toggling https is disabled")) {
      console.log("\n  ⏳ GitHub aún no permite forzar HTTPS — espera al check DNS verde.");
      return false;
    }
    throw err;
  }
  try {
    if (await verifyHttpsUrl(siteHost)) {
      saveSeoSiteUrl(`https://${siteHost}`, { httpsReady: true });
      console.log("  ✅ settings.json → httpsReady + siteUrl HTTPS");
      console.log("\n✅ Conexión segura lista. Ejecuta: npm run build:github-pages\n");
      return true;
    }
  } catch {
    console.log("\n  ⏳ HTTPS aún propagando en CDN…\n");
  }
  return false;
}

async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  HTTPS — mascafé.com");
  console.log(`  Dominio: ${DOMAIN_DISPLAY} (${DOMAIN_PUNYCODE})`);
  if (skipGodaddyStep()) console.log("  GoDaddy: omitido (solo GitHub Pages API)");
  if (opts.kickstart) console.log("  Modo: kickstart SSL si cert atascado");
  if (opts.aggressiveKickstart) console.log("  Modo: kickstart agresivo (2 ciclos, 120 s pausa)");
  if (opts.tryWww) console.log("  Modo: fallback www si apex no emite certificado");
  if (wait) console.log(`  Espera máxima: ${maxWaitMin} min`);
  console.log("═══════════════════════════════════════════════════");

  const pagesAtStart = await getPagesConfig();
  if (isCertActivelyProvisioning(pagesAtStart)) {
    console.log(
      `\n✅ Certificado en emisión (${pagesAtStart.https_certificate?.state}) para ${pagesAtStart.cname}`,
    );
    console.log("   No se modifica el dominio — espera 15–60 min y recarga https://www.mascafé.com\n");
    const host = pagesAtStart.cname || DOMAIN_WWW_PUNYCODE;
    if (await finalizeHttps(pagesAtStart, host)) process.exit(0);
    process.exit(0);
  }

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

  log("2/4 Reaplicar DNS + custom domain");
  if (!skipGodaddyStep()) {
    const pruned = await pruneBlockingDnsRecords();
    if (pruned.removed.length) {
      console.log(`  ↻ DNS limpiado: ${pruned.removed.join("; ")}`);
    }
    await configureGodaddyForGitHubPages();
    try {
      await ensureCaaLetsEncrypt();
      console.log("  ✅ CAA letsencrypt.org");
    } catch (err) {
      console.log(`  ○ CAA: ${err.message}`);
    }
  } else if (!hasGodaddyCreds()) {
    console.log("  ○ Sin GODADDY_API_* — usando DNS ya propagado");
  }

  if (!isDnsReadyForGitHubPages()) {
    console.log("  ⏳ DNS público aún propagando…");
    if (!wait) {
      console.log("  Repite con: npm run domain:enable-https -- --wait");
      process.exit(1);
    }
  } else {
    console.log("  ✅ DNS público OK");
  }

  let pagesEarly = await getPagesConfig();
  const onWww = isWwwCname(pagesEarly?.cname);
  const certProvisioning = isCertProvisioning(pagesEarly);
  const apexStuck =
    pagesEarly?.cname === DOMAIN_PUNYCODE &&
    pagesEarly?.https_certificate?.state === "new";

  if (onWww && certProvisioning) {
    console.log(
      `  ○ Dominio www preservado (${pagesEarly.cname}, cert: ${pagesEarly.https_certificate?.state})`,
    );
  } else if (opts.tryWww && apexStuck) {
    console.log("  ↻ Apex atascado — cambiando a www sin resetear…");
    await switchGithubPagesDomain(DOMAIN_WWW_PUNYCODE, { pauseMs: 30_000 });
    pagesEarly = await getPagesConfig();
    console.log(`  ✅ Custom domain → ${pagesEarly?.cname}`);
  } else {
    const cname = pagesEarly?.cname || DOMAIN_PUNYCODE;
    await configureGithubPagesDomain({ cname });
    console.log(`  ✅ Custom domain activo (${cname})`);
  }

  log("3/4 Health check GitHub Pages");
  let health;
  const healthAttempts = wait ? Math.min(maxWaitMin, 30) : 3;
  for (let i = 0; i < healthAttempts; i++) {
    try {
      health = await getPagesHealth({ retries: 1, delayMs: 2000 });
      const d = health.domain;
      const alt = health.alt_domain;
      console.log(
        `  intento ${i + 1}: apex valid=${d?.is_valid} https_eligible=${d?.is_https_eligible} | www valid=${alt?.is_valid} https_error=${alt?.https_error || "—"}`,
      );
      if (d?.is_valid && d?.is_https_eligible) break;
    } catch (err) {
      console.log(`  intento ${i + 1}: health pendiente (${err.message})`);
    }
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

  const certStuck = pages?.https_certificate?.state === "new";
  const skipKickstart = isWwwCname(pages?.cname) && isCertProvisioning(pages);
  const shouldKickstart =
    !skipKickstart &&
    (opts.kickstart || opts.aggressiveKickstart || certStuck) &&
    !isCertificateReady(pages);
  if (skipKickstart) {
    console.log("  ○ Certificado www en emisión — omitiendo kickstart");
  }
  if (shouldKickstart) {
    const kickOpts = opts.aggressiveKickstart
      ? { pauseMs: 120_000, cycles: 2 }
      : certStuck
        ? { pauseMs: 60_000, cycles: 2 }
        : {};
    console.log("  ↻ Kickstart: quitar y volver a añadir custom domain…");
    const kick = await kickstartSslCertificate(kickOpts);
    console.log(`  ↻ Resultado: ${kick.action}${kick.reason ? ` (${kick.reason})` : ""}`);
    await sleep(15000);
    pages = await getPagesConfig();
    console.log(`  Certificado tras kickstart: ${pages?.https_certificate?.state || "—"}`);
  }

  if (!isCertificateReady(pages) && health?.domain?.is_https_eligible) {
    console.log("  ↻ Apex https_eligible — intentando Enforce HTTPS…");
    try {
      await enableGithubPagesHttps();
      pages = await getPagesConfig();
      console.log(`  Enforce HTTPS: ${pages?.https_enforced ? "activado" : "rechazado"}`);
    } catch (err) {
      console.log(`  ○ Enforce HTTPS: ${err.message}`);
    }
  }

  if (!isCertificateReady(pages) && wait && maxWaitMin > 0) {
    const onWwwNow = isWwwCname(pages?.cname);
    const apexWaitMin =
      opts.tryWww && certStuck && !onWwwNow ? Math.min(5, maxWaitMin) : maxWaitMin;
    if (opts.tryWww && certStuck && !onWwwNow && apexWaitMin < maxWaitMin) {
      console.log(`  ○ Apex atascado — espera corta ${apexWaitMin} min antes de fallback www`);
    } else if (onWwwNow) {
      console.log(`  ○ Esperando certificado www: hasta ${apexWaitMin} min`);
    }
    const deadline = Date.now() + apexWaitMin * 60 * 1000;
    pages = await waitForCertificate(deadline);
  }

  let siteHost = pages?.cname || DOMAIN_PUNYCODE;

  if (!isCertificateReady(pages) && (opts.tryWww || certStuck) && !isWwwCname(pages?.cname)) {
    console.log("\n  ↻ Plan B: custom domain www (mejor emisión SSL con CNAME)…");
    const switchResult = await switchGithubPagesDomain(DOMAIN_WWW_PUNYCODE, { pauseMs: 120_000 });
    console.log(`  ↻ Dominio cambiado: ${switchResult.cname}`);
    siteHost = DOMAIN_WWW_PUNYCODE;
    await sleep(30_000);
    pages = await getPagesConfig();
    console.log(`  Certificado www: ${pages?.https_certificate?.state || "—"}`);

    if (!isCertificateReady(pages) && wait && maxWaitMin > 0) {
      const wwwWaitMin = Math.max(maxWaitMin - 5, 30);
      const wwwDeadline = Date.now() + wwwWaitMin * 60 * 1000;
      console.log(`  Espera certificado www: hasta ${wwwWaitMin} min`);
      pages = await waitForCertificate(wwwDeadline);
    }
  }

  if (await finalizeHttps(pages, siteHost)) {
    process.exit(0);
  }

  if (!isCertificateReady(pages)) {
    console.log("\n  ⏳ Certificado SSL en proceso (normal: 15 min – 48 h tras DNS correcto).");
    console.log(`  Cuando el check esté verde: ${GITHUB_PAGES_SETTINGS}`);
    console.log("  Vuelve a ejecutar: npm run domain:enable-https -- --wait --kickstart");
    if (certStuck) {
      console.log(
        "\n  Si lleva >48 h en «new»: abre ticket en https://support.github.com/contact (Pages + custom domain).",
      );
    }
    process.exit(0);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});

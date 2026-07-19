#!/usr/bin/env node
/**
 * Verifica DNS y HTTP del dominio mascafé.com → GitHub Pages.
 */
import {
  DOMAIN_DISPLAY,
  DOMAIN_PUNYCODE,
  DOMAIN_WWW,
  GITHUB_PAGES_HOST,
  parseArgs,
} from "./lib/domain-config.mjs";
import { checkApexDns, checkWwwDns } from "./lib/dns-check.mjs";

async function httpStatus(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  const { verifyOnly } = parseArgs();
  console.log("\n▸ Verificación dominio — mascafé.com\n");

  const apex = checkApexDns();
  const www = checkWwwDns();

  console.log(`DNS @ (${DOMAIN_DISPLAY}):`);
  console.log(`  Actual:   ${apex.results.join(", ") || "(vacío)"}`);
  console.log(`  Esperado: ${apex.expected.join(", ")}`);
  console.log(apex.ok ? "  ✅ OK" : "  ❌ Falta configurar A records");

  console.log(`\nDNS www:`);
  console.log(`  Actual:   ${www.results.join(", ") || "(vacío)"}`);
  console.log(`  Esperado: ${GITHUB_PAGES_HOST}`);
  console.log(www.ok ? "  ✅ OK" : "  ❌ Falta CNAME www");

  const urls = [
    { url: `http://${DOMAIN_PUNYCODE}/`, label: "HTTP apex" },
    { url: `http://www.${DOMAIN_PUNYCODE}/`, label: "HTTP www" },
    { url: `https://${DOMAIN_PUNYCODE}/`, label: "HTTPS apex" },
    { url: `https://www.${DOMAIN_PUNYCODE}/`, label: "HTTPS www" },
    { url: `https://${DOMAIN_WWW}/`, label: "HTTPS www (unicode)" },
  ];

  console.log("\nHTTP / HTTPS:");
  let httpsOk = 0;
  let httpOk = 0;
  for (const { url, label } of urls) {
    const code = await httpStatus(url);
    const icon = code === 200 ? "✅" : code > 0 ? "⚠️" : "❌";
    console.log(`  ${icon} ${label}: ${url} → ${code || "sin respuesta"}`);
    if (code === 200) {
      if (url.startsWith("https://")) httpsOk++;
      if (url.startsWith("http://")) httpOk++;
    }
  }

  const dnsOk = apex.ok && www.ok;
  console.log("\n───");
  if (dnsOk && httpsOk > 0) {
    console.log("✅ Dominio con HTTPS activo.\n");
    process.exit(0);
  }
  if (dnsOk && httpOk > 0) {
    console.log("⏳ DNS y HTTP OK. Falta certificado HTTPS (npm run domain:enable-https).\n");
    console.log("   Guía: proyecto-mas-cafe/migracion/TERMINAR-PROYECTO.md\n");
    process.exit(verifyOnly ? 0 : 0);
  }
  if (dnsOk) {
    console.log("⏳ DNS correcto. Espera propagación HTTP/HTTPS (hasta 48 h).\n");
    process.exit(verifyOnly ? 0 : 0);
  }
  console.log("❌ DNS pendiente. Ejecuta: npm run domain:configure\n");
  process.exit(verifyOnly ? 1 : 1);
}

main();

#!/usr/bin/env node
/**
 * Verifica DNS y HTTP del dominio mascafé.com → GitHub Pages.
 */
import { execSync } from "child_process";
import {
  DOMAIN_DISPLAY,
  DOMAIN_PUNYCODE,
  DOMAIN_WWW,
  GITHUB_PAGES_A_RECORDS,
  GITHUB_PAGES_HOST,
  parseArgs,
} from "./lib/domain-config.mjs";

function dig(query) {
  try {
    return execSync(`dig +short ${query}`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function httpStatus(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

function checkApexDns() {
  const results = dig(`${DOMAIN_PUNYCODE} A`);
  const ok = GITHUB_PAGES_A_RECORDS.every((ip) => results.includes(ip));
  return { results, ok, expected: GITHUB_PAGES_A_RECORDS };
}

function checkWwwDns() {
  const results = dig(`www.${DOMAIN_PUNYCODE} CNAME`);
  const normalized = results.map((r) => r.replace(/\.$/, ""));
  const ok = normalized.some(
    (r) => r === GITHUB_PAGES_HOST || r.endsWith(GITHUB_PAGES_HOST)
  );
  return { results, ok, expected: GITHUB_PAGES_HOST };
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
    `https://${DOMAIN_PUNYCODE}/`,
    `https://www.${DOMAIN_PUNYCODE}/`,
    `https://${DOMAIN_WWW}/`,
  ];

  console.log("\nHTTP:");
  let httpOk = 0;
  for (const url of urls) {
    const code = await httpStatus(url);
    const icon = code === 200 ? "✅" : code > 0 ? "⚠️" : "❌";
    console.log(`  ${icon} ${url} → HTTP ${code || "sin respuesta"}`);
    if (code === 200) httpOk++;
  }

  const dnsOk = apex.ok && www.ok;
  console.log("\n───");
  if (dnsOk && httpOk > 0) {
    console.log("✅ Dominio configurado y respondiendo.\n");
    process.exit(0);
  }
  if (dnsOk) {
    console.log("⏳ DNS correcto. HTTPS puede tardar hasta 48 h en GitHub Pages.\n");
    process.exit(verifyOnly ? 0 : 0);
  }
  console.log("❌ DNS pendiente. Ejecuta: npm run domain:configure\n");
  process.exit(verifyOnly ? 1 : 1);
}

main();

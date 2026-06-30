#!/usr/bin/env node
/**
 * Verifica registros MX/SPF del correo institucional.
 */
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { DOMAIN_DISPLAY, DOMAIN_PUNYCODE } from "./lib/domain-config.mjs";
import { getEmailDnsStatus, MAILBOXES } from "./lib/email-dns.mjs";

loadEnvLocal();

console.log(`\n▸ Verificación correo — ${DOMAIN_DISPLAY}\n`);
console.log(`  Buzón admin: ${MAILBOXES.admin}\n`);

let ok = true;

try {
  const status = await getEmailDnsStatus();
  if (!status.mx.length) {
    console.log("  ❌ Sin registros MX");
    ok = false;
  } else {
    console.log("  MX (GoDaddy API):");
    for (const r of status.mx) {
      const zoho = r.data?.includes("zoho");
      console.log(`    ${zoho ? "✅" : "•"} ${r.priority} ${r.data}`);
    }
    if (status.provider !== "zoho" && status.provider !== "improvmx") {
      console.log("  ⚠️  MX no apuntan a Zoho ni ImprovMX");
    }
  }

  const spf = status.txtAt.find((t) => t.data?.startsWith("v=spf1"));
  if (spf) console.log(`  ✅ SPF: ${spf.data}`);
  else {
    console.log("  ❌ Sin SPF en @");
    ok = false;
  }
} catch (err) {
  console.log("  ⚠️  API GoDaddy:", err.message);
}

try {
  const mxPublic = execSync(`dig +short MX ${DOMAIN_PUNYCODE}`, { encoding: "utf8" }).trim();
  if (mxPublic) {
    console.log("\n  MX públicos (dig):");
    mxPublic.split("\n").forEach((line) => console.log(`    ${line}`));
  } else {
    console.log("\n  ⏳ MX aún no propagados en DNS público");
    ok = false;
  }
} catch {
  console.log("\n  (dig no disponible)");
}

console.log(ok ? "\n✅ Correo DNS listo.\n" : "\n⏳ Pendiente configuración o propagación.\n");
process.exit(ok ? 0 : 1);

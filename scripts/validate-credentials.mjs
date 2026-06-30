#!/usr/bin/env node
/**
 * Valida secrets necesarios para automatización (GoDaddy + GitHub).
 * Sale con código 0 solo si todo está listo para domain:configure.
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { DOMAIN_PUNYCODE } from "./lib/domain-config.mjs";
import { testGodaddyCredentials } from "./lib/godaddy-api.mjs";
import { testGithubCredentials } from "./lib/github-pages-api.mjs";

loadEnvLocal();

const missing = [];
if (!process.env.GODADDY_API_KEY) missing.push("GODADDY_API_KEY");
if (!process.env.GODADDY_API_SECRET) missing.push("GODADDY_API_SECRET");
if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN && !process.env.GH_PAGES_PAT) {
  missing.push("GITHUB_TOKEN (o GH_PAGES_PAT)");
}

console.log("\n═══ Validación de credenciales — Más Café ═══\n");

if (missing.length) {
  console.log("  ✗ Faltan variables:", missing.join(", "));
  console.log("\n  Configura en GitHub Secrets o .env.local");
  console.log("  Panel: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions\n");
  process.exit(1);
}

let ok = true;

try {
  await testGithubCredentials();
  console.log("  ✓ GitHub API — acceso al repo OK");
} catch (err) {
  ok = false;
  console.log("  ✗ GitHub:", err.message);
}

try {
  await testGodaddyCredentials();
  console.log(`  ✓ GoDaddy API — dominio ${DOMAIN_PUNYCODE} OK`);
} catch (err) {
  ok = false;
  console.log("  ✗ GoDaddy:", err.message);
  console.log("    → Regenera Key + Secret en https://developer.godaddy.com/keys (Production)");
  console.log("    → Actualiza GODADDY_API_KEY y GODADDY_API_SECRET en Secrets\n");
}

if (!ok) process.exit(1);
console.log("\n✅ Credenciales listas para npm run domain:configure\n");

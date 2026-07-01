#!/usr/bin/env node
/**
 * Publica Google Wallet nativo de punta a punta:
 * validar JSON → secrets Supabase → Edge Function → GitHub Pages → pruebas.
 *
 * Uso:
 *   npm run wallet:google-publish
 *   npm run wallet:google-publish -- ./ruta/cuenta-servicio.json
 */
import { execSync } from "child_process";
import { existsSync } from "fs";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { readGoogleServiceAccount } from "./lib/read-google-sa.mjs";

loadEnvLocal();

const jsonPath = process.argv[2];

console.log("\n═══════════════════════════════════════════════════");
console.log("  Publicar Google Wallet nativo — Más Café");
console.log("═══════════════════════════════════════════════════\n");

if (jsonPath) {
  if (!existsSync(jsonPath)) {
    console.error(`✗ No existe el archivo: ${jsonPath}`);
    process.exit(1);
  }
  execSync(`node scripts/bootstrap-google-wallet-env.mjs "${jsonPath}"`, {
    stdio: "inherit",
    env: process.env,
  });
}

const sa = readGoogleServiceAccount();
if (!sa?.account?.client_email) {
  console.error("\n✗ Falta JSON de cuenta de servicio Google Cloud.");
  console.error("  1. Descarga JSON en IAM → Service accounts → Keys");
  console.error("  2. npm run wallet:google-publish -- ./archivo.json");
  console.error("  O secret GitHub GOOGLE_WALLET_SERVICE_ACCOUNT (JSON en una línea)\n");
  process.exit(1);
}

console.log(`▸ Cuenta: ${sa.account.client_email}\n`);

execSync("node scripts/automate-google-wallet.mjs --skip-pages", {
  stdio: "inherit",
  env: process.env,
});

console.log("\n▸ Republicar sitio…");
try {
  execSync("node scripts/build-github-pages.mjs", { stdio: "inherit", env: process.env });
} catch (err) {
  console.warn("  ⚠ Build local falló — dispara GitHub Pages manualmente");
}

console.log("\n▸ Pruebas…");
execSync("node scripts/test-google-wallet.mjs --strict", { stdio: "inherit", env: process.env });

console.log("\n═══════════════════════════════════════════════════");
console.log("  Prueba en Android:");
console.log("  https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/");
console.log("  Inicia sesión → Añadir a Google Wallet");
console.log("═══════════════════════════════════════════════════\n");

#!/usr/bin/env node
/**
 * Ingesta el JSON descargado de Google Cloud y activa Google Wallet de punta a punta.
 *
 * Uso:
 *   npm run wallet:google-ingest -- ./mas-cafe-c8413-xxxxx.json
 *   npm run wallet:google-ingest   (si ya existe secrets/google-wallet-sa.json)
 */
import { execSync } from "child_process";
import { existsSync } from "fs";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { findGoogleWalletSaFile } from "./lib/google-wallet-sa-path.mjs";
import { readGoogleServiceAccount } from "./lib/read-google-sa.mjs";
import { resolveGhToken } from "./lib/gh-secrets.mjs";

loadEnvLocal();

const fileArg = process.argv.slice(2).find((a) => !a.startsWith("-"));

console.log("\n═══════════════════════════════════════════════════");
console.log("  Ingestar JSON Google Wallet — Más Café");
console.log("═══════════════════════════════════════════════════\n");

if (fileArg) {
  execSync(`node scripts/bootstrap-google-wallet-env.mjs "${fileArg}"`, {
    stdio: "inherit",
    env: process.env,
  });
} else if (!findGoogleWalletSaFile() && !readGoogleServiceAccount()) {
  console.error("✗ Indica el JSON descargado de Google Cloud:");
  console.error("  npm run wallet:google-ingest -- ./archivo.json");
  console.error("\n  O ejecuta antes: npm run wallet:google-console\n");
  process.exit(1);
}

execSync("node scripts/import-google-service-account.mjs", {
  stdio: "inherit",
  env: process.env,
});

console.log("\n▸ Republicar sitio…");
execSync("node scripts/build-github-pages.mjs", {
  stdio: "inherit",
  env: { ...process.env, CI_SKIP_INFORME_SOURCE: "1" },
});

const ghToken = resolveGhToken();
if (ghToken) {
  try {
    execSync(
      'gh workflow run "Publicar HTML en GitHub Pages" --repo lasucursaldelcafe-droid/WEb-mas-cafe',
      { env: { ...process.env, GH_TOKEN: ghToken }, stdio: "pipe" },
    );
    console.log("  ✓ GitHub Pages disparado");
  } catch {
    console.log("  ○ Publica manualmente: push a main o Actions → Publicar HTML");
  }
}

console.log("\n▸ Prueba estricta…");
try {
  execSync("node scripts/test-google-wallet.mjs --strict", {
    stdio: "inherit",
    env: process.env,
  });
} catch {
  console.error("\n⚠ Revisa Pay Console → Usuarios autorizados y que la API Wallet esté activa\n");
  process.exit(1);
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Listo — prueba en Android:");
console.log("  https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/");
console.log("  Login → Añadir a Google Wallet");
console.log("═══════════════════════════════════════════════════\n");

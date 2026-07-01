#!/usr/bin/env node
/**
 * Escribe en .env.local las líneas necesarias para automatizar Google Wallet.
 * Solo pega el JSON en secrets/google-wallet-sa.json y ejecuta npm run wallet:google-auto.
 */
import { mkdirSync, existsSync, copyFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { upsertEnvLocal } from "./lib/upsert-env-local.mjs";
import {
  loadGoogleWalletConfig,
  applyGoogleWalletConfigToEnv,
} from "./lib/google-wallet-config.mjs";
import {
  DEFAULT_GOOGLE_WALLET_SA_PATH,
  findGoogleWalletSaFile,
} from "./lib/google-wallet-sa-path.mjs";
import { resolveGoogleWalletServiceAccount } from "./lib/google-wallet-api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

loadEnvLocal();
applyGoogleWalletConfigToEnv();

const cfg = loadGoogleWalletConfig();
const secretsDir = path.join(repoRoot, "secrets");
mkdirSync(secretsDir, { recursive: true });

const cliPath = process.argv[2];
if (cliPath && existsSync(cliPath)) {
  copyFileSync(cliPath, DEFAULT_GOOGLE_WALLET_SA_PATH);
  console.log(`✓ JSON copiado a secrets/google-wallet-sa.json`);
}

const updates = {
  GOOGLE_APPLICATION_CREDENTIALS: "secrets/google-wallet-sa.json",
};

if (cfg.merchantId) updates.GOOGLE_PAY_MERCHANT_ID = cfg.merchantId;
if (cfg.issuerId) updates.GOOGLE_WALLET_ISSUER_ID = cfg.issuerId;

upsertEnvLocal(updates);

console.log("\n✓ .env.local actualizado con líneas Google Wallet:");
for (const [k, v] of Object.entries(updates)) {
  console.log(`  ${k}=${v}`);
}

const saFile = findGoogleWalletSaFile();
const sa = resolveGoogleWalletServiceAccount();

if (sa?.client_email) {
  console.log(`\n✓ Cuenta de servicio detectada: ${sa.client_email}`);
  console.log("  Ejecuta: npm run wallet:google-auto\n");
} else if (saFile) {
  console.log("\n⚠ secrets/google-wallet-sa.json existe pero no es JSON válido");
} else {
  console.log("\n○ Falta el JSON de Google Cloud:");
  console.log("  1. Descarga en https://console.cloud.google.com/iam-admin/serviceaccounts");
  console.log("  2. Guárdalo como secrets/google-wallet-sa.json");
  console.log("  O: npm run wallet:google-bootstrap -- ./ruta/cuenta-servicio.json");
  console.log("  3. npm run wallet:google-auto\n");
}

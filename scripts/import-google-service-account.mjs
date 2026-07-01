#!/usr/bin/env node
/**
 * Importa JSON de cuenta de servicio Google Cloud a Supabase + GitHub.
 *
 * Uso:
 *   npm run wallet:google-import-sa -- path/to/service-account.json
 *   GOOGLE_APPLICATION_CREDENTIALS=./sa.json npm run wallet:google-import-sa
 */
import { readFileSync, existsSync, copyFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { resolveIssuerIdFromConfig, resolveMerchantIdFromConfig, applyGoogleWalletConfigToEnv } from "./lib/google-wallet-config.mjs";
import { deployGoogleWalletSecrets } from "./lib/google-wallet-deploy.mjs";
import { isNumericIssuerId } from "./lib/google-wallet-credentials.mjs";
import { DEFAULT_GOOGLE_WALLET_SA_PATH } from "./lib/google-wallet-sa-path.mjs";
import { resolveCredentialsPath } from "./lib/read-google-sa.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadEnvLocal();
applyGoogleWalletConfigToEnv();

const fileArg = process.argv.slice(2).find((a) => !a.startsWith("-"));
const credPath =
  (fileArg && resolveCredentialsPath(fileArg)) ||
  resolveCredentialsPath(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
  fileArg;

if (!credPath || !existsSync(credPath)) {
  console.error("✗ Indica la ruta al JSON de cuenta de servicio Google Cloud");
  console.error("  npm run wallet:google-import-sa -- ./mi-cuenta-servicio.json");
  console.error("  O guarda el archivo en secrets/google-wallet-sa.json y npm run wallet:google-auto");
  process.exit(1);
}

copyFileSync(credPath, DEFAULT_GOOGLE_WALLET_SA_PATH);
console.log(`✓ Copiado a secrets/google-wallet-sa.json`);

let sa;
try {
  sa = JSON.parse(readFileSync(DEFAULT_GOOGLE_WALLET_SA_PATH, "utf8"));
} catch {
  console.error("✗ El archivo no es JSON válido");
  process.exit(1);
}

if (!sa.client_email || !sa.private_key) {
  console.error("✗ JSON incompleto — faltan client_email o private_key");
  process.exit(1);
}

const issuerId = resolveIssuerIdFromConfig();
const merchantId = resolveMerchantIdFromConfig();

if (!issuerId || !isNumericIssuerId(issuerId)) {
  console.error("✗ Falta GOOGLE_WALLET_ISSUER_ID numérico en .env.local o content/google-wallet.json");
  process.exit(1);
}

console.log(`\n✓ Cuenta de servicio: ${sa.client_email}`);
console.log(`  Issuer ID: ${issuerId}`);
console.log(`  Merchant ID: ${merchantId || "—"}\n`);

const deploy = await deployGoogleWalletSecrets({
  issuerId,
  serviceAccount: sa,
  merchantId,
  dryRun: false,
});

if (deploy.supabase) console.log("✓ Secrets en Supabase");
if (deploy.github) console.log("✓ Secrets en GitHub (GOOGLE_WALLET_SERVICE_ACCOUNT)");
if (deploy.function) console.log("✓ Edge Function wallet desplegada");

console.log("\nSiguiente: autoriza el email en Pay Console → Usuarios autorizados");
console.log(`  ${sa.client_email}\n`);

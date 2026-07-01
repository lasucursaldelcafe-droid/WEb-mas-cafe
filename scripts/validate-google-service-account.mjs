#!/usr/bin/env node
/**
 * Valida que FIREBASE_SERVICE_ACCOUNT / GOOGLE_WALLET_SERVICE_ACCOUNT sea JSON GCP válido.
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { readGoogleServiceAccount } from "./lib/read-google-sa.mjs";

loadEnvLocal();

const saInfo = readGoogleServiceAccount();
if (!saInfo?.account) {
  console.error("✗ No hay cuenta de servicio");
  console.error("  Coloca el JSON en secrets/google-wallet-sa.json");
  console.error("  O: GOOGLE_APPLICATION_CREDENTIALS / GOOGLE_WALLET_SERVICE_ACCOUNT");
  process.exit(1);
}

const parsed = saInfo.account;

console.log(`✓ Cuenta de servicio válida: ${parsed.client_email}`);
console.log(`  Fuente: ${saInfo.source}`);
console.log(`  Proyecto: ${parsed.project_id || "—"}`);

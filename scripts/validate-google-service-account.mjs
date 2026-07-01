#!/usr/bin/env node
/**
 * Valida que FIREBASE_SERVICE_ACCOUNT / GOOGLE_WALLET_SERVICE_ACCOUNT sea JSON GCP válido.
 */
import { readFileSync, existsSync } from "fs";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

loadEnvLocal();

function loadSa() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (credPath && existsSync(credPath)) {
    return { source: credPath, raw: readFileSync(credPath, "utf8") };
  }
  const raw =
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (raw) return { source: "env", raw };
  return null;
}

const item = loadSa();
if (!item) {
  console.error("✗ No hay cuenta de servicio en GOOGLE_APPLICATION_CREDENTIALS ni env JSON");
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(item.raw);
} catch (err) {
  console.error("✗ El secret no es JSON válido de Google Cloud");
  console.error(`  Fuente: ${item.source}`);
  console.error(`  Inicio del contenido: ${item.raw.slice(0, 40).replace(/\n/g, " ")}…`);
  console.error("\n  Debe ser el archivo .json descargado de:");
  console.error("  https://console.cloud.google.com/iam-admin/serviceaccounts");
  console.error("\n  Actualiza GitHub Secret FIREBASE_SERVICE_ACCOUNT o GOOGLE_WALLET_SERVICE_ACCOUNT");
  process.exit(1);
}

if (!parsed.client_email || !parsed.private_key) {
  console.error("✗ JSON incompleto — faltan client_email o private_key");
  process.exit(1);
}

console.log(`✓ Cuenta de servicio válida: ${parsed.client_email}`);
console.log(`  Proyecto: ${parsed.project_id || "—"}`);

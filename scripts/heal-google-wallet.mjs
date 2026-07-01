#!/usr/bin/env node
/**
 * Diagnóstico + reintento de provisión Google Wallet.
 * Sale 0 si configured=true; 2 si falta JSON/token; 1 en otros errores.
 *
 * Uso: npm run wallet:google-heal
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { applyGoogleWalletConfigToEnv } from "./lib/google-wallet-config.mjs";
import { readGoogleServiceAccount } from "./lib/read-google-sa.mjs";
import { findGoogleWalletSaFile } from "./lib/google-wallet-sa-path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

loadEnvLocal();
applyGoogleWalletConfigToEnv();

function len(key) {
  return process.env[key]?.trim().length ?? 0;
}

function checkLiveStatus() {
  const url = `${process.env.SUPABASE_URL?.replace(/\/$/, "")}/functions/v1/wallet`;
  if (!url.includes("supabase")) return null;
  try {
    const out = execSync(
      `curl -sS "${url}" -H "Content-Type: application/json" -d '{"action":"getGoogleWalletStatus"}'`,
      { encoding: "utf8", timeout: 15_000 },
    );
    return JSON.parse(out);
  } catch {
    return null;
  }
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Heal Google Wallet — Más Café");
console.log("═══════════════════════════════════════════════════\n");

const sa = readGoogleServiceAccount();
const saFile = findGoogleWalletSaFile();
const live = checkLiveStatus();

console.log("▸ Estado en vivo (Supabase Edge Function)");
if (live) {
  console.log(`  issuerConfigured: ${live.issuerConfigured}`);
  console.log(`  configured:       ${live.configured}`);
  console.log(`  classId:          ${live.classId || "—"}`);
} else {
  console.log("  ○ No se pudo consultar getGoogleWalletStatus");
}

console.log("\n▸ Credenciales locales / env");
console.log(`  secrets/google-wallet-sa.json: ${saFile ? "✓" : "✗"}`);
console.log(`  JSON parseable en env:         ${sa ? `✓ ${sa.account.client_email}` : "✗"}`);
console.log(`  GOOGLE_WALLET_SERVICE_ACCOUNT: ${len("GOOGLE_WALLET_SERVICE_ACCOUNT")} chars`);
console.log(`  FIREBASE_SERVICE_ACCOUNT:      ${len("FIREBASE_SERVICE_ACCOUNT")} chars`);
console.log(`  FIREBASE_TOKEN:                ${len("FIREBASE_TOKEN")} chars`);

if (live?.configured) {
  console.log("\n✓ Google Wallet ya está configurado (configured=true)\n");
  process.exit(0);
}

const hasSa =
  sa?.account?.private_key ||
  len("GOOGLE_WALLET_SERVICE_ACCOUNT") > 80 ||
  saFile;

const hasIamToken = len("FIREBASE_TOKEN") > 50;

if (!hasSa && !hasIamToken) {
  console.error("\n✗ Bloqueado: falta JSON de cuenta de servicio GCP");
  console.error("  Opción A — Actions → Ingestar JSON Google Wallet → pegar JSON");
  console.error("  Opción B — npm run wallet:google-ingest -- ./archivo.json");
  console.error("  Opción C — Renovar FIREBASE_TOKEN: npx firebase login:ci → secret GitHub\n");
  process.exit(2);
}

console.log("\n▸ Intentando provisión automática…\n");
try {
  execSync("node scripts/provision-google-wallet-sa.mjs", {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
  process.exit(0);
} catch {
  process.exit(1);
}

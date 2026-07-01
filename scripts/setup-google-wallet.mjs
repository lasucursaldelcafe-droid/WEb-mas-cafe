#!/usr/bin/env node
/**
 * Configura Google Wallet (tarjeta loyalty nativa en Android).
 *
 * Requiere en .env.local:
 *   GOOGLE_WALLET_ISSUER_ID          — Google Pay & Wallet Console
 *   GOOGLE_WALLET_SERVICE_ACCOUNT    — JSON cuenta de servicio (o FIREBASE_SERVICE_ACCOUNT)
 *   SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF  — subir secrets a Edge Function
 *
 * Uso: npm run wallet:google-setup
 */
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  setupGoogleWalletClass,
  printGoogleWalletInstructions,
  resolveIssuerId,
  resolveGoogleWalletServiceAccount,
  GOOGLE_WALLET_LINKS,
} from "./lib/google-wallet-api.mjs";
import { projectRefFromUrl } from "./lib/supabase-management-api.mjs";
import { SUPABASE_URL } from "./wallet/supabase-shared.mjs";

loadEnvLocal();

const REPO = "lasucursaldelcafe-droid/WEb-mas-cafe";
const dryRun = process.argv.includes("--dry-run");

console.log("\n═══════════════════════════════════════════════════");
console.log("  Google Wallet — tarjeta de fidelización Más Café");
if (dryRun) console.log("  MODO: dry-run");
console.log("═══════════════════════════════════════════════════\n");

const issuerId = resolveIssuerId();
const sa = resolveGoogleWalletServiceAccount();

if (!issuerId) {
  console.error("✗ Falta GOOGLE_WALLET_ISSUER_ID en .env.local\n");
  printGoogleWalletInstructions("", sa?.client_email || "");
  console.log("\n  Obtén el Issuer ID en:");
  console.log(`  ${GOOGLE_WALLET_LINKS.businessConsole}\n`);
  process.exit(1);
}

if (!sa?.client_email) {
  console.error("✗ Falta cuenta de servicio Google\n");
  console.error("  Añade GOOGLE_WALLET_SERVICE_ACCOUNT (JSON) o FIREBASE_SERVICE_ACCOUNT");
  console.error(`  Crear clave: ${GOOGLE_WALLET_LINKS.serviceAccounts}\n`);
  process.exit(1);
}

console.log(`▸ Issuer ID: ${issuerId}`);
console.log(`▸ Service account: ${sa.client_email}\n`);

if (dryRun) {
  printGoogleWalletInstructions(issuerId, sa.client_email);
  process.exit(0);
}

console.log("▸ 1/3 Crear clase LoyaltyClass en Google Wallet API…");
const result = await setupGoogleWalletClass();
if (!result.ok) {
  console.error(`  ✗ ${result.error || "Error creando clase"}`);
  printGoogleWalletInstructions(issuerId, sa.client_email);
  process.exit(1);
}

if (result.loyalty?.created) {
  console.log(`  ✓ Clase creada: ${result.classId}`);
} else if (result.loyalty?.exists) {
  console.log(`  ✓ Clase ya existe: ${result.classId}`);
} else {
  console.log(`  ✓ Clase: ${result.classId}`);
}

const projectRef =
  process.env.SUPABASE_PROJECT_REF?.trim() || projectRefFromUrl(SUPABASE_URL);
const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

console.log("\n▸ 2/3 Secrets en Supabase Edge Function…");
if (!accessToken || !projectRef) {
  console.warn("  ⚠ Sin SUPABASE_ACCESS_TOKEN — configura secrets manualmente:");
  console.warn("    npx supabase secrets set GOOGLE_WALLET_ISSUER_ID=... GOOGLE_WALLET_SERVICE_ACCOUNT='...'");
} else {
  const saJson = JSON.stringify(sa).replace(/'/g, "'\\''");
  execSync(
    `npx supabase secrets set GOOGLE_WALLET_ISSUER_ID="${issuerId}" GOOGLE_WALLET_SERVICE_ACCOUNT='${saJson}' --project-ref ${projectRef}`,
    { stdio: "inherit", env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken } },
  );
  console.log("  ✓ Secrets en Supabase");
}

const ghToken = process.env.GITHUB_TOKEN || process.env.GH_PAGES_PAT;
console.log("\n▸ 3/3 Secrets en GitHub (CI)…");
if (!ghToken) {
  console.warn("  ⚠ Sin GITHUB_TOKEN — omitiendo GitHub secrets");
} else {
  execSync(`gh secret set GOOGLE_WALLET_ISSUER_ID --repo ${REPO}`, {
    input: issuerId,
    env: { ...process.env, GH_TOKEN: ghToken },
  });
  execSync(`gh secret set GOOGLE_WALLET_SERVICE_ACCOUNT --repo ${REPO}`, {
    input: JSON.stringify(sa),
    env: { ...process.env, GH_TOKEN: ghToken },
  });
  console.log("  ✓ Secrets en GitHub");
}

printGoogleWalletInstructions(issuerId, sa.client_email);

console.log("\n▸ Redeploy Edge Function…");
if (accessToken && projectRef) {
  execSync(`npx supabase functions deploy wallet --no-verify-jwt --project-ref ${projectRef}`, {
    stdio: "inherit",
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken },
  });
  console.log("  ✓ Function wallet desplegada");
} else {
  console.log("  Ejecuta: npm run wallet:setup");
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Google Wallet configurado");
console.log("  Cliente: /wallet/ → pestaña QR → «Añadir a Google Wallet»");
console.log("═══════════════════════════════════════════════════\n");

#!/usr/bin/env node
/**
 * Automatiza el trámite completo de Google Wallet + credenciales Google Cloud.
 *
 * Uso:
 *   npm run wallet:google-auto
 *   npm run wallet:google-auto -- --dry-run
 *   npm run wallet:google-auto -- --write-env \
 *     --merchant-id BCR... \
 *     --api-key AIza... \
 *     --issuer-id 3388000000022883204
 *
 * Variables en .env.local (recomendado — no pegar secretos en el chat):
 *   GOOGLE_PAY_MERCHANT_ID       — BCR… (Google Pay, NO es Issuer ID)
 *   GOOGLE_WALLET_ISSUER_ID      — numérico (Wallet API)
 *   GOOGLE_WALLET_SERVICE_ACCOUNT — JSON cuenta de servicio
 *   GOOGLE_API_KEY               — opcional (Maps, etc.)
 *   ANDROID_KEYSTORE_PATH        — opcional (keytool)
 *   SUPABASE_ACCESS_TOKEN, GITHUB_TOKEN
 */
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { upsertEnvLocal } from "./lib/upsert-env-local.mjs";
import { resolveIssuerIdFromConfig, resolveMerchantIdFromConfig, applyGoogleWalletConfigToEnv } from "./lib/google-wallet-config.mjs";
import {
  extractKeystoreFingerprints,
  printKeystoreInstructions,
  resolveKeystoreConfig,
} from "./lib/google-keystore.mjs";
import {
  isNumericIssuerId,
  normalizeWalletEnv,
  resolveApiKey,
  resolveMerchantId,
  validateGoogleApiKey,
  printCredentialGuide,
} from "./lib/google-wallet-credentials.mjs";
import {
  setupGoogleWalletClass,
  printGoogleWalletInstructions,
  resolveIssuerId,
  resolveGoogleWalletServiceAccount,
  googleCloudConsoleLinks,
} from "./lib/google-wallet-api.mjs";
import { deployGoogleWalletSecrets, deployGoogleWalletIdsOnly, deployWalletFunction, triggerPagesPublish } from "./lib/google-wallet-deploy.mjs";
import { DEFAULT_GOOGLE_WALLET_SA_PATH } from "./lib/google-wallet-sa-path.mjs";

loadEnvLocal();
applyGoogleWalletConfigToEnv();

// Escribe líneas estándar en .env.local (IDs + ruta al JSON)
const envBootstrap = {
  GOOGLE_APPLICATION_CREDENTIALS: "secrets/google-wallet-sa.json",
};
if (resolveMerchantIdFromConfig()) envBootstrap.GOOGLE_PAY_MERCHANT_ID = resolveMerchantIdFromConfig();
if (resolveIssuerIdFromConfig()) envBootstrap.GOOGLE_WALLET_ISSUER_ID = resolveIssuerIdFromConfig();
upsertEnvLocal(envBootstrap);

function parseCli(argv) {
  const out = {
    dryRun: argv.includes("--dry-run"),
    writeEnv: argv.includes("--write-env"),
    skipDeploy: argv.includes("--skip-deploy"),
    skipPages: argv.includes("--skip-pages"),
    idsOnly: argv.includes("--ids-only"),
    merchantId: "",
    issuerId: "",
    apiKey: "",
    keystore: "",
    storepass: "",
    alias: "",
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === "--merchant-id" && next) out.merchantId = next;
    if (a === "--issuer-id" && next) out.issuerId = next;
    if (a === "--api-key" && next) out.apiKey = next;
    if (a === "--keystore" && next) out.keystore = next;
    if (a === "--storepass" && next) out.storepass = next;
    if (a === "--alias" && next) out.alias = next;
  }
  return out;
}

const cli = parseCli(process.argv.slice(2));

if (cli.merchantId) process.env.GOOGLE_PAY_MERCHANT_ID = cli.merchantId;
if (cli.issuerId) process.env.GOOGLE_WALLET_ISSUER_ID = cli.issuerId;
if (cli.apiKey) process.env.GOOGLE_API_KEY = cli.apiKey;
if (cli.keystore) process.env.ANDROID_KEYSTORE_PATH = cli.keystore;
if (cli.storepass) process.env.ANDROID_KEYSTORE_PASSWORD = cli.storepass;
if (cli.alias) process.env.ANDROID_KEY_ALIAS = cli.alias;

normalizeWalletEnv();

console.log("\n═══════════════════════════════════════════════════");
console.log("  Automatizar Google Wallet — Más Café");
if (cli.dryRun) console.log("  MODO: dry-run");
console.log("═══════════════════════════════════════════════════\n");

const links = googleCloudConsoleLinks();

// ── 1/7 Guardar .env.local ─────────────────────────────────────
console.log("▸ 1/7 Variables locales…");
const envUpdates = {};
const merchantId = resolveMerchantIdFromConfig() || resolveMerchantId();
const issuerId = resolveIssuerIdFromConfig() || resolveIssuerId();
const apiKey = resolveApiKey();
const sa = resolveGoogleWalletServiceAccount();

if (merchantId) envUpdates.GOOGLE_PAY_MERCHANT_ID = merchantId;
if (issuerId && isNumericIssuerId(issuerId)) envUpdates.GOOGLE_WALLET_ISSUER_ID = issuerId;
if (apiKey) envUpdates.GOOGLE_API_KEY = apiKey;

if (cli.writeEnv && Object.keys(envUpdates).length) {
  upsertEnvLocal(envUpdates);
  console.log(`  ✓ .env.local actualizado (${Object.keys(envUpdates).join(", ")})`);
} else if (Object.keys(envUpdates).length) {
  console.log(`  ○ Variables en memoria — usa --write-env para guardar en .env.local`);
} else {
  console.log("  ○ Sin variables nuevas");
}

// ── 2/7 Validar credenciales ───────────────────────────────────
console.log("\n▸ 2/7 Validar credenciales…");
const apiKeyCheck = await validateGoogleApiKey(apiKey);
printCredentialGuide({
  merchantId,
  issuerId: issuerId && isNumericIssuerId(issuerId) ? issuerId : "",
  apiKeyOk: apiKeyCheck,
});

if (!issuerId || !isNumericIssuerId(issuerId)) {
  console.error("\n✗ Falta GOOGLE_WALLET_ISSUER_ID numérico para crear pases.");
  console.error("  BCR… es Merchant ID de Google Pay, no Issuer ID de Wallet API.");
  console.error("\n  Ejecuta con Issuer ID cuando lo tengas:");
  console.error("  npm run wallet:google-auto -- --write-env --issuer-id TU_ID_NUMERICO\n");
  console.error(`  Consola: ${links.businessConsole}`);
  process.exit(1);
}

if (!sa?.client_email) {
  if (cli.idsOnly) {
    console.warn("\n⚠ Sin cuenta de servicio — modo --ids-only (clase ya en Pay Console)");
    console.warn("  Se desplegarán Issuer/Merchant ID; el botón Wallet requiere JSON GCP válido.\n");
  } else {
    console.error("\n✗ Falta cuenta de servicio Google Cloud (JSON)");
    console.error(`  Coloca el archivo en: ${DEFAULT_GOOGLE_WALLET_SA_PATH}`);
    console.error("  O: npm run wallet:google-bootstrap -- ./cuenta-servicio.json");
    console.error(`  Crear en: ${links.serviceAccounts}`);
    console.error("\n  Si la LoyaltyClass ya existe en Pay Console:");
    console.error("  npm run wallet:google-auto -- --ids-only\n");
    process.exit(1);
  }
}

// ── 3/7 Keystore / keytool ───────────────────────────────────────
console.log("\n▸ 3/7 Huellas keystore (keytool)…");
const ksConfig = resolveKeystoreConfig();
const fingerprints = ksConfig
  ? extractKeystoreFingerprints(ksConfig)
  : { ok: false, error: "Sin ANDROID_KEYSTORE_PATH (opcional para web)" };
if (!cli.idsOnly) printKeystoreInstructions(fingerprints);
else console.log("  ○ omitido (--ids-only)");

// ── 4/7 Google Wallet API + LoyaltyClass ─────────────────────────
console.log("\n▸ 4/7 Google Wallet API + clase loyalty…");
let walletSetup = { ok: false };
if (cli.idsOnly) {
  const cfg = (await import("./lib/google-wallet-config.mjs")).loadGoogleWalletConfig();
  walletSetup = { ok: true, classId: cfg.classId || `${issuerId}.mas_cafe_loyalty`, loyalty: { verified: true } };
  console.log(`  ✓ Clase existente en Pay Console: ${walletSetup.classId}`);
} else if (!cli.dryRun) {
  walletSetup = await setupGoogleWalletClass();
  if (walletSetup.ok) {
    console.log(`  ✓ Proyecto Cloud: ${walletSetup.projectId}`);
    console.log(`  ✓ Clase: ${walletSetup.classId}`);
    if (walletSetup.loyalty?.created) console.log("  ✓ LoyaltyClass creada");
    else if (walletSetup.loyalty?.verified || walletSetup.loyalty?.exists) {
      console.log("  ✓ LoyaltyClass verificada en Pay Console");
    }
  } else {
    console.error(`  ✗ ${walletSetup.error || "Error en Wallet API"}`);
    printGoogleWalletInstructions(issuerId, sa.client_email);
    process.exit(1);
  }
} else {
  console.log("  (dry-run) omitido");
}

// ── 5/7 Secrets Supabase + GitHub ────────────────────────────────
console.log("\n▸ 5/7 Secrets + Edge Function…");
let deploy;
if (cli.idsOnly || !sa?.client_email) {
  deploy = await deployGoogleWalletIdsOnly({
    issuerId,
    merchantId,
    dryRun: cli.dryRun || cli.skipDeploy,
  });
  if (deploy.supabase) console.log("  ✓ Issuer/Merchant ID en Supabase");
  if (deploy.github) console.log("  ✓ Issuer/Merchant ID en GitHub");
} else {
  deploy = await deployGoogleWalletSecrets({
    issuerId,
    serviceAccount: sa,
    merchantId,
    apiKey,
    dryRun: cli.dryRun || cli.skipDeploy,
  });
  if (deploy.supabase) console.log("  ✓ Secrets en Supabase");
  if (deploy.github) console.log("  ✓ Secrets en GitHub");
}

if (!cli.dryRun && !cli.skipDeploy) {
  if (await deployWalletFunction(false)) console.log("  ✓ Edge Function wallet desplegada");
} else if (deploy.function) {
  console.log("  ✓ Edge Function wallet desplegada");
} else if (!cli.dryRun && !cli.skipDeploy) {
  console.warn("  ⚠ Edge Function omitida (falta SUPABASE_ACCESS_TOKEN)");
}

// ── 6/7 Republicar sitio ─────────────────────────────────────────
console.log("\n▸ 6/7 Republicar GitHub Pages…");
if (cli.skipPages || cli.dryRun) {
  console.log("  ○ omitido");
} else if (triggerPagesPublish(false)) {
  console.log("  ✓ Workflow disparado");
} else {
  console.log("  ○ ejecuta: npm run build:github-pages");
}

// ── 7/7 Diagnóstico ──────────────────────────────────────────────
console.log("\n▸ 7/7 Verificación…");
if (!cli.dryRun) {
  try {
    execSync("node scripts/wallet-diagnose.mjs", { stdio: "inherit", env: process.env });
  } catch {
    console.warn("  ⚠ Diagnóstico con advertencias");
  }
}

printGoogleWalletInstructions(issuerId, sa?.client_email || "");

console.log("\n═══════════════════════════════════════════════════");
console.log("  Resumen");
console.log(`  Merchant ID (Pay):  ${merchantId || "—"}`);
console.log(`  Issuer ID (Wallet): ${issuerId}`);
console.log(`  Service account:    ${sa?.client_email || "— (pendiente JSON GCP)"}`);
if (fingerprints.ok && fingerprints.sha1) {
  console.log(`  SHA-1 keystore:     ${fingerprints.sha1}`);
}
console.log("\n  Cliente: /wallet/ → QR → Añadir a Google Wallet");
console.log("  ⚠ Rota GOOGLE_API_KEY si la compartiste en chat público");
console.log("═══════════════════════════════════════════════════\n");

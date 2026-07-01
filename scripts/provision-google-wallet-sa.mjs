#!/usr/bin/env node
/**
 * Provisiona cuenta de servicio Google Wallet:
 * 1. Repara/parsea FIREBASE_SERVICE_ACCOUNT o GOOGLE_WALLET_SERVICE_ACCOUNT
 * 2. Si no hay JSON válido, crea clave nueva vía IAM API (requiere FIREBASE_TOKEN)
 * 3. Despliega a Supabase + GitHub y verifica configured=true
 *
 * Uso (CI o local con .env.local):
 *   node scripts/provision-google-wallet-sa.mjs
 *   FIREBASE_TOKEN=... node scripts/provision-google-wallet-sa.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { applyGoogleWalletConfigToEnv, resolveIssuerIdFromConfig, resolveMerchantIdFromConfig } from "./lib/google-wallet-config.mjs";
import { DEFAULT_GOOGLE_WALLET_SA_PATH } from "./lib/google-wallet-sa-path.mjs";
import { deployGoogleWalletSecrets } from "./lib/google-wallet-deploy.mjs";
import { setupGoogleWalletClass } from "./lib/google-wallet-api.mjs";
import { isNumericIssuerId } from "./lib/google-wallet-credentials.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

const FIREBASE_CLIENT_ID =
  process.env.FIREBASE_CLIENT_ID ||
  "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com";
const FIREBASE_CLIENT_SECRET = process.env.FIREBASE_CLIENT_SECRET || "j9iVZfS8kkCEFUPaAeJV0sAi";
const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim() || "mas-cafe-c8413";
const SA_EMAIL =
  process.env.GOOGLE_WALLET_SA_EMAIL?.trim() ||
  `firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com`;

loadEnvLocal();
applyGoogleWalletConfigToEnv();

function log(step, msg) {
  console.log(`  ✓ [${step}] ${msg}`);
}

function warn(step, msg) {
  console.log(`  ○ [${step}] ${msg}`);
}

function fail(step, msg) {
  console.error(`  ✗ [${step}] ${msg}`);
}

/** Intenta parsear JSON de cuenta de servicio desde texto crudo. */
function tryParseServiceAccount(raw) {
  if (!raw?.trim()) return null;
  let text = raw.trim();

  const attempts = [text];

  if (text.startsWith("{") && text.endsWith("}")) {
    attempts.push(text.replace(/\\n/g, "\n"));
  }

  if (!text.startsWith("{")) {
    try {
      const decoded = Buffer.from(text, "base64").toString("utf8");
      if (decoded.includes("private_key")) attempts.push(decoded);
    } catch {
      /* noop */
    }
  }

  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    attempts.push(text.slice(1, -1));
  }

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed?.client_email && parsed?.private_key) return parsed;
    } catch {
      /* next */
    }
  }
  return null;
}

function resolveRawServiceAccountEnv() {
  for (const key of [
    "GOOGLE_WALLET_SERVICE_ACCOUNT",
    "FIREBASE_SERVICE_ACCOUNT",
  ]) {
    const raw = process.env[key]?.trim();
    if (!raw) continue;
    const parsed = tryParseServiceAccount(raw);
    if (parsed) return { account: parsed, source: key };
    warn("parse", `${key} presente pero no es JSON válido (${raw.slice(0, 40)}…)`);
  }
  return null;
}

async function refreshFirebaseAccessToken(refreshToken) {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: FIREBASE_CLIENT_ID,
    client_secret: FIREBASE_CLIENT_SECRET,
    grant_type: "refresh_token",
    scope: CLOUD_PLATFORM_SCOPE,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || `OAuth ${res.status}`);
  }
  if (!data.access_token) throw new Error("Sin access_token en respuesta OAuth");
  return data.access_token;
}

async function createServiceAccountKey(accessToken) {
  const name = `projects/${PROJECT_ID}/serviceAccounts/${SA_EMAIL}`;
  const url = `https://iam.googleapis.com/v1/${name}/keys`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyAlgorithm: "KEY_ALG_RSA_2048",
      privateKeyType: "TYPE_GOOGLE_CREDENTIALS_FILE",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error?.message || `IAM keys.create HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }

  if (!data.privateKeyData) {
    throw new Error("IAM no devolvió privateKeyData");
  }

  const jsonText = Buffer.from(data.privateKeyData, "base64").toString("utf8");
  const parsed = tryParseServiceAccount(jsonText);
  if (!parsed) throw new Error("privateKeyData no es JSON de cuenta de servicio");
  return parsed;
}

async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Provisionar Google Wallet SA — Más Café");
  console.log("═══════════════════════════════════════════════════\n");

  const issuerId = resolveIssuerIdFromConfig();
  const merchantId = resolveMerchantIdFromConfig();

  if (!issuerId || !isNumericIssuerId(issuerId)) {
    fail("config", "Falta GOOGLE_WALLET_ISSUER_ID numérico");
    process.exit(1);
  }

  let sa = resolveRawServiceAccountEnv()?.account ?? null;
  let source = sa ? "env secret" : "";

  if (!sa) {
    const firebaseToken = process.env.FIREBASE_TOKEN?.trim();
    if (!firebaseToken) {
      fail("auth", "Sin JSON válido ni FIREBASE_TOKEN para crear clave IAM");
      process.exit(1);
    }

    warn("iam", "Creando clave nueva en GCP (IAM API)…");
    try {
      const accessToken = await refreshFirebaseAccessToken(firebaseToken);
      log("oauth", "Access token obtenido desde FIREBASE_TOKEN");
      sa = await createServiceAccountKey(accessToken);
      source = "IAM generateKey";
      log("iam", `Clave creada para ${sa.client_email}`);
    } catch (err) {
      fail("iam", err.message);
      console.error(
        "\n  Si falla por permisos: inicia sesión en GCP con rol Owner/iam.serviceAccountKeyAdmin",
        "\n  o descarga el JSON manualmente y ejecuta: npm run wallet:google-ingest -- ./archivo.json\n",
      );
      process.exit(1);
    }
  } else {
    log("parse", `Cuenta desde ${source}: ${sa.client_email}`);
  }

  mkdirSync(path.dirname(DEFAULT_GOOGLE_WALLET_SA_PATH), { recursive: true });
  writeFileSync(DEFAULT_GOOGLE_WALLET_SA_PATH, `${JSON.stringify(sa, null, 2)}\n`, "utf8");
  log("file", `Guardado en secrets/google-wallet-sa.json`);

  try {
    const setup = await setupGoogleWalletClass();
    if (setup.ok) log("wallet-api", `Clase loyalty: ${setup.classId}`);
    else warn("wallet-api", setup.error?.slice(0, 120) || "setup clase falló");
  } catch (err) {
    warn("wallet-api", err.message);
  }

  console.log("\n▸ Desplegar secrets Supabase + GitHub…");
  const deploy = await deployGoogleWalletSecrets({
    issuerId,
    serviceAccount: sa,
    merchantId,
    dryRun: false,
  });

  if (deploy.supabase) log("supabase", "GOOGLE_WALLET_SERVICE_ACCOUNT en Edge Function");
  else warn("supabase", "Omitido — falta SUPABASE_ACCESS_TOKEN o PROJECT_REF");

  if (deploy.github) log("github", "Secret GOOGLE_WALLET_SERVICE_ACCOUNT actualizado");
  else warn("github", "GitHub secret omitido (token sin permiso admin)");

  if (deploy.function) log("function", "Edge Function wallet redesplegada");

  console.log("\n▸ Verificación estricta…");
  try {
    execSync("node scripts/test-google-wallet.mjs --strict", {
      cwd: repoRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        GOOGLE_WALLET_SERVICE_ACCOUNT: JSON.stringify(sa),
        GOOGLE_APPLICATION_CREDENTIALS: DEFAULT_GOOGLE_WALLET_SA_PATH,
      },
    });
  } catch {
    fail("verify", "test-google-wallet --strict falló");
    process.exit(1);
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Google Wallet configurado — prueba en Android:");
  console.log("  https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/");
  console.log("═══════════════════════════════════════════════════\n");
}

await main();

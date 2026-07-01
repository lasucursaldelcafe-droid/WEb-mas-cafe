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
import { generateKeyPairSync } from "crypto";
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

  try {
    const once = JSON.parse(text);
    if (typeof once === "string") attempts.push(once);
    if (once && typeof once === "object" && once.client_email && once.private_key) return once;
  } catch {
    /* continue */
  }

  if (text.startsWith("{") && text.endsWith("}")) {
    attempts.push(text.replace(/\\n/g, "\n"));
    attempts.push(text.replace(/\r\n/g, "\n"));
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

  const emailMatch = text.match(/"client_email"\s*:\s*"([^"]+)"/);
  const keyMatch = text.match(/"private_key"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
  if (emailMatch && keyMatch) {
    attempts.push(
      JSON.stringify({
        type: "service_account",
        project_id: PROJECT_ID,
        client_email: emailMatch[1],
        private_key: keyMatch[1].replace(/\\n/g, "\n"),
      }),
    );
  }

  for (const candidate of attempts) {
    try {
      const parsed = typeof candidate === "string" ? JSON.parse(candidate) : candidate;
      if (parsed?.client_email && parsed?.private_key) {
        if (!parsed.private_key.includes("BEGIN PRIVATE KEY")) {
          parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
        }
        return parsed;
      }
    } catch {
      /* next */
    }
  }
  return null;
}

function normalizeFirebaseToken(raw) {
  if (!raw?.trim()) return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) return trimmed;
  return trimmed.replace(/\r?\n/g, "").replace(/\s+/g, "");
}

function resolveRawServiceAccountEnv() {
  for (const key of [
    "GOOGLE_WALLET_SERVICE_ACCOUNT",
    "FIREBASE_SERVICE_ACCOUNT",
    "FIREBASE_TOKEN",
  ]) {
    const raw = process.env[key]?.trim();
    if (!raw) continue;
    console.log(`  ○ [parse] ${key} longitud=${raw.length}`);
    if (key === "FIREBASE_SERVICE_ACCOUNT" && raw.length < 80 && raw.includes("@")) {
      warn("parse", `${key} parece ser solo email — necesitas el JSON completo con private_key`);
      continue;
    }
    const parsed = tryParseServiceAccount(raw);
    if (parsed) return { account: parsed, source: key };
    if (key !== "FIREBASE_TOKEN") {
      warn("parse", `${key} presente pero no es JSON válido`);
    }
  }
  return null;
}

async function refreshFirebaseAccessToken(refreshToken) {
  const attempts = [
    { scope: CLOUD_PLATFORM_SCOPE },
    { scope: "" },
  ];

  let lastErr = "OAuth falló";
  for (const { scope } of attempts) {
    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: FIREBASE_CLIENT_ID,
      client_secret: FIREBASE_CLIENT_SECRET,
      grant_type: "refresh_token",
    });
    if (scope) body.set("scope", scope);

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (res.ok && data.access_token) return data.access_token;
    lastErr = data.error_description || data.error || `OAuth ${res.status}`;
    if (data.error === "invalid_scope") continue;
  }
  throw new Error(lastErr);
}

async function probeAccessToken(token) {
  const clean = normalizeFirebaseToken(token);
  if (!clean || clean.startsWith("{")) return false;
  const url = `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/serviceAccounts/${encodeURIComponent(SA_EMAIL)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${clean}` },
  });
  return res.ok;
}

async function testFirebaseCliToken(token) {
  const clean = normalizeFirebaseToken(token);
  if (!clean || clean.startsWith("{")) return false;
  try {
    execSync(`npx firebase projects:list --token "${clean.replace(/"/g, '\\"')}" --json`, {
      stdio: "pipe",
      timeout: 30_000,
    });
    return true;
  } catch {
    return false;
  }
}

async function resolveGoogleAccessToken(firebaseTokenRaw) {
  const firebaseToken = normalizeFirebaseToken(firebaseTokenRaw);
  if (!firebaseToken) {
    throw new Error("FIREBASE_TOKEN vacío");
  }

  if (firebaseToken.startsWith("{")) {
    throw new Error("FIREBASE_TOKEN contiene JSON — muévelo a GOOGLE_WALLET_SERVICE_ACCOUNT");
  }

  if (await testFirebaseCliToken(firebaseToken)) {
    log("firebase-cli", "FIREBASE_TOKEN válido para Firebase CLI");
  } else {
    warn("firebase-cli", "FIREBASE_TOKEN no pasa firebase projects:list (¿expirado?)");
  }

  try {
    const access = await refreshFirebaseAccessToken(firebaseToken);
    log("oauth", "Access token desde refresh FIREBASE_TOKEN");
    return access;
  } catch (refreshErr) {
    warn("oauth", `Refresh falló: ${refreshErr.message}`);
  }

  if (await probeAccessToken(firebaseToken)) {
    log("oauth", "FIREBASE_TOKEN ya es access token válido (IAM)");
    return firebaseToken;
  }

  try {
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const auth = require("firebase-tools/lib/auth");
    const scopes = require("firebase-tools/lib/scopes");
    const tokens = await auth.refreshTokens(firebaseToken, [scopes.CLOUD_PLATFORM]);
    if (tokens?.access_token) {
      log("oauth", "Access token vía firebase-tools");
      return tokens.access_token;
    }
  } catch (err) {
    warn("oauth", `firebase-tools: ${err.message || err}`);
  }

  throw new Error(
    "FIREBASE_TOKEN inválido o expirado — ejecuta: npx firebase login:ci y actualiza el secret en GitHub",
  );
}

function buildServiceAccountFromParts(privateKeyPem, privateKeyId) {
  return {
    type: "service_account",
    project_id: PROJECT_ID,
    private_key_id: privateKeyId,
    private_key: privateKeyPem,
    client_email: SA_EMAIL,
    client_id: "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(SA_EMAIL)}`,
    universe_domain: "googleapis.com",
  };
}

async function uploadServiceAccountPublicKey(accessToken) {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const resource = `projects/${PROJECT_ID}/serviceAccounts/${SA_EMAIL}`;
  const url = `https://iam.googleapis.com/v1/${encodeURI(resource)}/keys`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publicKeyData: Buffer.from(publicKey).toString("base64"),
      publicKeyType: "TYPE_X509_PEM_FILE",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `IAM keys.upload HTTP ${res.status}`);
  }

  const keyId = String(data.name || "").split("/").pop();
  if (!keyId) throw new Error("IAM upload sin key id");
  return buildServiceAccountFromParts(privateKey, keyId);
}

async function provisionServiceAccountKey(accessToken) {
  try {
    return await createServiceAccountKey(accessToken);
  } catch (createErr) {
    warn("iam", `generateKey: ${createErr.message}`);
    warn("iam", "Intentando upload de clave pública generada localmente…");
    return uploadServiceAccountPublicKey(accessToken);
  }
}

async function createServiceAccountKey(accessToken) {
  const resource = `projects/${PROJECT_ID}/serviceAccounts/${SA_EMAIL}`;
  const url = `https://iam.googleapis.com/v1/${encodeURI(resource)}/keys`;

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
      const accessToken = await resolveGoogleAccessToken(firebaseToken);
      sa = await provisionServiceAccountKey(accessToken);
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

/**
 * Google Wallet API — setup de clase loyalty + secrets.
 */
import { createSign } from "crypto";
import { loadEnvLocal } from "./load-env-local.mjs";
import { DOMAIN_PUNYCODE, GITHUB_PAGES_HOST } from "./domain-config.mjs";
import { resolveServiceAccountJson, getAccessToken, FIREBASE_PROJECT } from "./firebase-setup-api.mjs";

export const GOOGLE_WALLET_LINKS = {
  businessConsole: "https://pay.google.com/business/console",
  walletApi: `https://console.cloud.google.com/apis/library/walletobjects.googleapis.com?project=${FIREBASE_PROJECT}`,
  serviceAccounts: `https://console.cloud.google.com/iam-admin/serviceaccounts?project=${FIREBASE_PROJECT}`,
  credentials: `https://console.cloud.google.com/apis/credentials?project=${FIREBASE_PROJECT}`,
};

export const CLASS_SUFFIX = "mas_cafe_loyalty";
export const LOGO_URI =
  "https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/images/brand/horizontal-azul.png";

const WALLET_SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";

export function resolveGoogleWalletServiceAccount() {
  loadEnvLocal();
  if (process.env.GOOGLE_WALLET_SERVICE_ACCOUNT?.trim()) {
    return JSON.parse(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT);
  }
  return resolveServiceAccountJson();
}

export function resolveIssuerId() {
  loadEnvLocal();
  return process.env.GOOGLE_WALLET_ISSUER_ID?.trim() || "";
}

export function classId(issuerId) {
  return `${issuerId}.${CLASS_SUFFIX}`;
}

function signJwt(payload, privateKey) {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const unsigned = `${header}.${body}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const signature = sign.sign(privateKey, "base64url");
  return `${unsigned}.${signature}`;
}

async function getWalletAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    {
      iss: credentials.client_email,
      sub: credentials.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: WALLET_SCOPE,
    },
    credentials.private_key,
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "OAuth falló");
  return data.access_token;
}

export async function enableWalletApi(token, projectId = FIREBASE_PROJECT) {
  const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/walletobjects.googleapis.com:enable`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (res.ok || res.status === 409) return { ok: true };
  const text = await res.text();
  return { ok: false, error: text };
}

export async function getLoyaltyClass(token, issuerId, brandName = "Más Café") {
  const id = classId(issuerId);
  const res = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (res.ok) return { exists: true, data: await res.json() };
  if (res.status !== 404) {
    return { exists: false, error: await res.text() };
  }

  const payload = {
    id,
    issuerName: brandName,
    reviewStatus: "UNDER_REVIEW",
    programName: "Programa de fidelización",
    programLogo: {
      sourceUri: { uri: LOGO_URI },
      contentDescription: { defaultValue: { language: "es", value: brandName } },
    },
    hexBackgroundColor: "#073954",
  };

  const create = await fetch(
    "https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!create.ok) {
    return { exists: false, error: await create.text() };
  }
  return { exists: false, created: true, data: await create.json() };
}

export async function setupGoogleWalletClass(options = {}) {
  const issuerId = resolveIssuerId();
  if (!issuerId) {
    return {
      ok: false,
      error: "Falta GOOGLE_WALLET_ISSUER_ID en .env.local",
      links: GOOGLE_WALLET_LINKS,
    };
  }

  const credentials = resolveGoogleWalletServiceAccount();
  if (!credentials?.client_email) {
    return {
      ok: false,
      error: "Falta GOOGLE_WALLET_SERVICE_ACCOUNT o FIREBASE_SERVICE_ACCOUNT",
      links: GOOGLE_WALLET_LINKS,
    };
  }

  const platformToken = await getAccessToken(credentials);
  await enableWalletApi(platformToken);

  const walletToken = await getWalletAccessToken(credentials);
  const brandName = options.brandName || "Más Café";
  const loyalty = await getLoyaltyClass(walletToken, issuerId, brandName);

  return {
    ok: !loyalty.error,
    issuerId,
    classId: classId(issuerId),
    serviceAccountEmail: credentials.client_email,
    loyalty,
    origins: [
      `https://${DOMAIN_PUNYCODE}`,
      `http://${DOMAIN_PUNYCODE}`,
      `https://${GITHUB_PAGES_HOST}`,
    ],
    links: GOOGLE_WALLET_LINKS,
    error: loyalty.error,
  };
}

export function printGoogleWalletInstructions(issuerId, serviceAccountEmail) {
  console.log("\n── Pasos manuales en Google Pay & Wallet Console ──");
  console.log(`  1. Abrir: ${GOOGLE_WALLET_LINKS.businessConsole}`);
  console.log("  2. Crear cuenta emisor (si no existe) y copiar Issuer ID");
  console.log(`  3. En «Usuarios autorizados» añadir: ${serviceAccountEmail}`);
  console.log("  4. Esperar aprobación del emisor (puede tardar 24–48 h)");
  console.log(`  5. GOOGLE_WALLET_ISSUER_ID=${issuerId || "<tu issuer id>"}`);
}

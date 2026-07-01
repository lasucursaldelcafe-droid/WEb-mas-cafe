/**
 * Google Wallet API — setup de clase loyalty (independiente de Firebase).
 * Backend wallet: Supabase Edge Functions.
 */
import { readFileSync } from "fs";
import { createSign } from "crypto";
import { loadEnvLocal } from "./load-env-local.mjs";
import { DOMAIN_PUNYCODE, GITHUB_PAGES_HOST } from "./domain-config.mjs";
import { applyGoogleWalletSaPathToEnv } from "./google-wallet-sa-path.mjs";

export const CLASS_SUFFIX = "mas_cafe_loyalty";
export const LOGO_URI =
  "https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/images/brand/horizontal-azul.png";

const WALLET_SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
const PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

export function resolveGoogleCloudProjectId() {
  loadEnvLocal();
  const explicit = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
  if (explicit) return explicit;
  const sa = resolveGoogleWalletServiceAccount();
  return sa?.project_id?.trim() || "";
}

export function googleCloudConsoleLinks(projectId = resolveGoogleCloudProjectId()) {
  const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
  return {
    businessConsole: "https://pay.google.com/business/console",
    createProject: "https://console.cloud.google.com/projectcreate",
    walletApi: `https://console.cloud.google.com/apis/library/walletobjects.googleapis.com${q}`,
    serviceAccounts: `https://console.cloud.google.com/iam-admin/serviceaccounts${q}`,
    credentials: `https://console.cloud.google.com/apis/credentials${q}`,
    billing: projectId
      ? `https://console.cloud.google.com/billing/linkedaccount?project=${encodeURIComponent(projectId)}`
      : "https://console.cloud.google.com/billing",
  };
}

/** @deprecated usa googleCloudConsoleLinks() */
export const GOOGLE_WALLET_LINKS = googleCloudConsoleLinks();

export function resolveGoogleWalletServiceAccount() {
  loadEnvLocal();
  applyGoogleWalletSaPathToEnv();
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (credPath) {
    try {
      const parsed = JSON.parse(readFileSync(credPath, "utf8"));
      if (parsed?.client_email) return parsed;
    } catch {
      /* continuar */
    }
  }
  const raw =
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.client_email) return parsed;
    } catch {
      return null;
    }
  }
  return null;
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

async function fetchGoogleAccessToken(credentials, scope) {
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    {
      iss: credentials.client_email,
      sub: credentials.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope,
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
  if (!res.ok) throw new Error(data.error_description || data.error || "OAuth Google falló");
  return data.access_token;
}

async function getWalletAccessToken(credentials) {
  return fetchGoogleAccessToken(credentials, WALLET_SCOPE);
}

async function getPlatformAccessToken(credentials) {
  return fetchGoogleAccessToken(credentials, PLATFORM_SCOPE);
}

export async function enableWalletApi(token, projectId) {
  const pid = projectId || resolveGoogleCloudProjectId();
  if (!pid) {
    return { ok: false, error: "Falta GOOGLE_CLOUD_PROJECT_ID o project_id en el JSON de la cuenta de servicio" };
  }
  const url = `https://serviceusage.googleapis.com/v1/projects/${pid}/services/walletobjects.googleapis.com:enable`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (res.ok || res.status === 409) return { ok: true, projectId: pid };
  const text = await res.text();
  return { ok: false, error: text, projectId: pid };
}

export async function getLoyaltyClass(token, issuerId, brandName = "Más Café") {
  const id = classId(issuerId);
  const res = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (res.ok) {
    const data = await res.json();
    return { exists: true, verified: true, data };
  }
  if (res.status !== 404) {
    return { exists: false, error: await res.text() };
  }

  const cfg = (await import("./google-wallet-config.mjs")).loadGoogleWalletConfig();

  const payload = {
    id,
    issuerName: cfg.brandName || brandName,
    reviewStatus: "UNDER_REVIEW",
    programName: cfg.programName || "Programa de fidelización",
    programLogo: {
      sourceUri: { uri: cfg.logoUri || LOGO_URI },
      contentDescription: {
        defaultValue: { language: "es", value: cfg.brandName || brandName },
      },
    },
    hexBackgroundColor: cfg.hexBackgroundColor || "#073954",
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
  const links = googleCloudConsoleLinks();
  if (!issuerId) {
    return {
      ok: false,
      error: "Falta GOOGLE_WALLET_ISSUER_ID en .env.local",
      links,
    };
  }

  const credentials = resolveGoogleWalletServiceAccount();
  if (!credentials?.client_email) {
    return {
      ok: false,
      error:
        "Falta GOOGLE_WALLET_SERVICE_ACCOUNT o FIREBASE_SERVICE_ACCOUNT (JSON cuenta de servicio Google Cloud)",
      links,
    };
  }

  const projectId = credentials.project_id || resolveGoogleCloudProjectId();
  const platformToken = await getPlatformAccessToken(credentials);
  const apiEnable = await enableWalletApi(platformToken, projectId);
  if (!apiEnable.ok) {
    return { ok: false, error: apiEnable.error, links, projectId };
  }

  const walletToken = await getWalletAccessToken(credentials);
  const brandName = options.brandName || "Más Café";
  const loyalty = await getLoyaltyClass(walletToken, issuerId, brandName);

  return {
    ok: !loyalty.error,
    issuerId,
    projectId: apiEnable.projectId || projectId,
    classId: classId(issuerId),
    serviceAccountEmail: credentials.client_email,
    loyalty,
    origins: [
      `https://${DOMAIN_PUNYCODE}`,
      `http://${DOMAIN_PUNYCODE}`,
      `https://${GITHUB_PAGES_HOST}`,
    ],
    links: googleCloudConsoleLinks(projectId),
    error: loyalty.error,
  };
}

export function printGoogleWalletInstructions(issuerId, serviceAccountEmail) {
  const links = googleCloudConsoleLinks();
  console.log("\n── Pasos en Google Pay & Wallet Console ──");
  console.log(`  1. Abrir: ${links.businessConsole}`);
  console.log("  2. Crear cuenta emisor (si no existe) y copiar Issuer ID");
  console.log(`  3. En «Usuarios autorizados» añadir: ${serviceAccountEmail || "<email service account>"}`);
  console.log("  4. Esperar aprobación del emisor (puede tardar 24–48 h)");
  console.log(`  5. GOOGLE_WALLET_ISSUER_ID=${issuerId || "<tu issuer id>"}`);
  console.log("\n── Google Cloud (sin Firebase) ──");
  console.log(`  • Crear proyecto: ${links.createProject}`);
  console.log(`  • Cuenta de servicio: ${links.serviceAccounts}`);
  console.log(`  • Activar Wallet API: ${links.walletApi}`);
}

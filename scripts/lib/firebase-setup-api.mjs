/**
 * Cliente HTTP autenticado para APIs de Google Cloud / Firebase (setup wallet).
 */
import { readFileSync, writeFileSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { loadEnvLocal } from "./load-env-local.mjs";
import { DOMAIN_PUNYCODE, GITHUB_PAGES_HOST } from "./domain-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FIREBASE_PROJECT = process.env.FIREBASE_PROJECT || "mas-cafe-c8413";

export const REQUIRED_APIS = [
  "firebase.googleapis.com",
  "identitytoolkit.googleapis.com",
  "firestore.googleapis.com",
  "cloudfunctions.googleapis.com",
  "cloudbuild.googleapis.com",
  "artifactregistry.googleapis.com",
  "run.googleapis.com",
  "eventarc.googleapis.com",
];

export function authorizedDomains() {
  const domains = new Set([
    "localhost",
    `${FIREBASE_PROJECT}.firebaseapp.com`,
    `${FIREBASE_PROJECT}.web.app`,
    DOMAIN_PUNYCODE,
    `www.${DOMAIN_PUNYCODE}`,
    GITHUB_PAGES_HOST,
  ]);
  return [...domains];
}

export function resolveServiceAccountJson() {
  loadEnvLocal();
  if (process.env.FIREBASE_SERVICE_ACCOUNT?.trim()) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"));
  }
  return null;
}

export function writeTempServiceAccount(credentials) {
  const dir = mkdtempSync(path.join(tmpdir(), "firebase-sa-"));
  const file = path.join(dir, "sa.json");
  writeFileSync(file, JSON.stringify(credentials), "utf8");
  process.env.GOOGLE_APPLICATION_CREDENTIALS = file;
  return file;
}

async function importFromFunctions(pkg) {
  const modPath = path.join(__dirname, "../../functions/node_modules", pkg);
  return import(pathToFileURL(path.join(modPath, "build/index.js")).href).catch(() =>
    import(pathToFileURL(path.join(modPath, "index.js")).href)
  );
}

async function loadGoogleAuth(credentials) {
  let GoogleAuth;
  try {
    const mod = await importFromFunctions("google-auth-library");
    GoogleAuth = mod.GoogleAuth || mod.default?.GoogleAuth;
  } catch {
    throw new Error(
      "google-auth-library no instalado. Ejecuta primero: npm ci --prefix functions"
    );
  }
  return new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
}

export async function getAccessToken(credentials) {
  const auth = await loadGoogleAuth(credentials);
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token?.token) throw new Error("No se pudo obtener access token de la cuenta de servicio");
  return token.token;
}

async function apiFetch(token, url, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json, text };
}

export async function enableApis(token, projectId = FIREBASE_PROJECT) {
  const results = [];
  for (const service of REQUIRED_APIS) {
    const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/${service}:enable`;
    const res = await apiFetch(token, url, { method: "POST", body: {} });
    results.push({
      service,
      ok: res.ok || res.status === 409,
      status: res.status,
      detail: res.json?.error?.message || "ok",
    });
  }
  return results;
}

export async function initializeIdentityPlatform(token, projectId = FIREBASE_PROJECT) {
  const url = `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/identityPlatform:initializeAuth`;
  const res = await apiFetch(token, url, { method: "POST", body: {} });
  return res.ok || res.status === 409 || res.json?.error?.status === "ALREADY_EXISTS";
}

export async function getAuthConfig(token, projectId = FIREBASE_PROJECT) {
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;
  const res = await apiFetch(token, url);
  if (!res.ok) return null;
  return res.json;
}

export async function configureAuthProviders(token, projectId = FIREBASE_PROJECT) {
  await initializeIdentityPlatform(token, projectId);

  const domains = authorizedDomains();
  const existing = (await getAuthConfig(token, projectId)) || {};
  const mergedDomains = [...new Set([...(existing.authorizedDomains || []), ...domains])];

  const patchUrl =
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config` +
    "?updateMask=signIn.email.enabled,signIn.email.passwordRequired,authorizedDomains";

  const patchRes = await apiFetch(token, patchUrl, {
    method: "PATCH",
    body: {
      name: `projects/${projectId}/config`,
      signIn: {
        email: { enabled: true, passwordRequired: true },
      },
      authorizedDomains: mergedDomains,
    },
  });

  if (!patchRes.ok) {
    throw new Error(
      `Auth config: HTTP ${patchRes.status} — ${patchRes.json?.error?.message || patchRes.text}`
    );
  }

  const googleUrl =
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/defaultSupportedIdpConfigs/google.com`;
  const googleGet = await apiFetch(token, googleUrl);
  if (googleGet.status === 404) {
    const createUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/defaultSupportedIdpConfigs?IdpId=google.com`;
    await apiFetch(token, createUrl, {
      method: "POST",
      body: { enabled: true, name: `projects/${projectId}/defaultSupportedIdpConfigs/google.com` },
    });
  } else {
    await apiFetch(token, `${googleUrl}?updateMask=enabled`, {
      method: "PATCH",
      body: {
        name: `projects/${projectId}/defaultSupportedIdpConfigs/google.com`,
        enabled: true,
      },
    });
  }

  return { authorizedDomains: mergedDomains };
}

export async function ensureFirestoreDatabase(token, projectId = FIREBASE_PROJECT) {
  const listUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases`;
  const list = await apiFetch(token, listUrl);
  if (list.ok && list.json?.databases?.some((d) => d.name?.endsWith("/databases/(default)"))) {
    return { created: false, location: list.json.databases[0].locationId };
  }

  const createUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases?databaseId=(default)`;
  const create = await apiFetch(token, createUrl, {
    method: "POST",
    body: {
      locationId: "nam5",
      type: "FIRESTORE_NATIVE",
    },
  });

  if (create.ok || create.status === 409) {
    return { created: true, location: "nam5" };
  }

  throw new Error(
    `Firestore: HTTP ${create.status} — ${create.json?.error?.message || create.text}`
  );
}

export async function seedProgramInFirestore(credentials) {
  let admin;
  try {
    admin = await importFromFunctions("firebase-admin");
  } catch {
    throw new Error("firebase-admin no instalado. Ejecuta: npm ci --prefix functions");
  }
  const adminMod = admin.default || admin;
  if (!adminMod.apps.length) {
    adminMod.initializeApp({
      credential: adminMod.credential.cert(credentials),
      projectId: FIREBASE_PROJECT,
    });
  }
  const db = adminMod.firestore();
  const ref = db.doc("program/settings");
  const snap = await ref.get();
  if (snap.exists) return { seeded: false };

  const program = JSON.parse(
    readFileSync(
      path.join(__dirname, "../../content/wallet-program.json"),
      "utf8"
    )
  );
  const crypto = await import("crypto");
  const pin = program.defaultStaffPin || "123456";
  const data = {
    enabled: program.enabled !== false,
    pointsPerThousandCop: program.pointsPerThousandCop,
    minPurchaseCop: program.minPurchaseCop,
    maxPointsPerDay: program.maxPointsPerDay,
    brandName: program.brandName,
    tiers: program.tiers,
    rewards: program.rewards,
    staffPinHash: crypto.createHash("sha256").update(String(pin)).digest("hex"),
    initializedAt: adminMod.firestore.FieldValue.serverTimestamp(),
    setupBy: "automated-setup",
  };
  await ref.set(data);
  return { seeded: true, defaultStaffPin: pin };
}

/**
 * Lee la cuenta de servicio Google Wallet desde archivo o variables de entorno.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./load-env-local.mjs";
import { findGoogleWalletSaFile } from "./google-wallet-sa-path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.join(__dirname, "../..");

function parseServiceAccountJson(raw) {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.client_email && parsed?.private_key) return parsed;
    return null;
  } catch {
    return null;
  }
}

/** Resuelve ruta relativa al repo (ej. secrets/google-wallet-sa.json). */
export function resolveCredentialsPath(credPath) {
  if (!credPath?.trim()) return null;
  const trimmed = credPath.trim();
  if (path.isAbsolute(trimmed) && existsSync(trimmed)) return trimmed;
  const fromRepo = path.join(repoRoot, trimmed);
  if (existsSync(fromRepo)) return fromRepo;
  if (existsSync(trimmed)) return path.resolve(trimmed);
  return null;
}

export function readGoogleServiceAccount(processEnv = process.env) {
  loadEnvLocal();

  const fromFile = findGoogleWalletSaFile();
  if (fromFile) {
    const parsed = parseServiceAccountJson(readFileSync(fromFile, "utf8"));
    if (parsed) return { account: parsed, source: fromFile };
  }

  const credPath = resolveCredentialsPath(processEnv.GOOGLE_APPLICATION_CREDENTIALS);
  if (credPath) {
    const parsed = parseServiceAccountJson(readFileSync(credPath, "utf8"));
    if (parsed) return { account: parsed, source: credPath };
  }

  const b64 = processEnv.GOOGLE_WALLET_SERVICE_ACCOUNT_B64?.trim();
  if (b64) {
    const parsed = parseServiceAccountJson(Buffer.from(b64, "base64").toString("utf8"));
    if (parsed) return { account: parsed, source: "GOOGLE_WALLET_SERVICE_ACCOUNT_B64" };
  }

  for (const key of [
    "GOOGLE_WALLET_SERVICE_ACCOUNT",
    "FIREBASE_SERVICE_ACCOUNT",
  ]) {
    const parsed = parseServiceAccountJson(processEnv[key]);
    if (parsed) return { account: parsed, source: key };
  }

  return null;
}

/**
 * Rutas estándar para la cuenta de servicio Google Wallet (gitignored).
 */
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "../..");

/** Ruta recomendada: coloca aquí el JSON descargado de Google Cloud. */
export const DEFAULT_GOOGLE_WALLET_SA_PATH = path.join(
  repoRoot,
  "secrets",
  "google-wallet-sa.json",
);

export const GOOGLE_WALLET_SA_CANDIDATE_PATHS = [
  DEFAULT_GOOGLE_WALLET_SA_PATH,
  path.join(repoRoot, "secrets", "gcp-service-account.json"),
  path.join(repoRoot, "proyecto-mas-cafe", "cuentas", "google-wallet-sa.json"),
];

export function findGoogleWalletSaFile() {
  for (const p of GOOGLE_WALLET_SA_CANDIDATE_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

/** Si existe el JSON en secrets/, expone GOOGLE_APPLICATION_CREDENTIALS. */
export function applyGoogleWalletSaPathToEnv(processEnv = process.env) {
  if (processEnv.GOOGLE_APPLICATION_CREDENTIALS?.trim()) return null;
  const found = findGoogleWalletSaFile();
  if (found) {
    processEnv.GOOGLE_APPLICATION_CREDENTIALS = found;
    return found;
  }
  return null;
}

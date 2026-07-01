/**
 * Carga variables desde .env.local (gitignored) sin dependencias.
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { applyGoogleWalletSaPathToEnv } from "./google-wallet-sa-path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

export function loadEnvLocal(envPath = path.join(root, ".env.local")) {
  if (!existsSync(envPath)) {
    applyGoogleWalletSaPathToEnv();
    return;
  }
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
  applyGoogleWalletSaPathToEnv();
}

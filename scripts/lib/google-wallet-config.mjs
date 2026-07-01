/**
 * Configuración pública Google Wallet (IDs + branding Más Café).
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./load-env-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "../../content/google-wallet.json");

let cached = null;

export function loadGoogleWalletConfig() {
  if (cached) return cached;
  if (!existsSync(configPath)) return {};
  cached = JSON.parse(readFileSync(configPath, "utf8"));
  return cached;
}

export function resolveMerchantIdFromConfig() {
  loadEnvLocal();
  return (
    process.env.GOOGLE_PAY_MERCHANT_ID?.trim() ||
    loadGoogleWalletConfig().merchantId ||
    ""
  );
}

export function resolveIssuerIdFromConfig() {
  loadEnvLocal();
  return (
    process.env.GOOGLE_WALLET_ISSUER_ID?.trim() ||
    loadGoogleWalletConfig().issuerId ||
    ""
  );
}

export function applyGoogleWalletConfigToEnv() {
  const cfg = loadGoogleWalletConfig();
  if (cfg.merchantId && !process.env.GOOGLE_PAY_MERCHANT_ID) {
    process.env.GOOGLE_PAY_MERCHANT_ID = cfg.merchantId;
  }
  if (cfg.issuerId && !process.env.GOOGLE_WALLET_ISSUER_ID) {
    process.env.GOOGLE_WALLET_ISSUER_ID = cfg.issuerId;
  }
}

/**
 * Validación de credenciales Google Pay / Wallet / API Key.
 */
import { loadEnvLocal } from "./load-env-local.mjs";

const MERCHANT_RE = /^BCR[A-Z0-9]+$/i;
const ISSUER_NUMERIC_RE = /^\d{10,20}$/;

export function isMerchantId(value) {
  return MERCHANT_RE.test(String(value || "").trim());
}

export function isNumericIssuerId(value) {
  return ISSUER_NUMERIC_RE.test(String(value || "").trim());
}

export function resolveMerchantId() {
  loadEnvLocal();
  return process.env.GOOGLE_PAY_MERCHANT_ID?.trim() || "";
}

export function resolveApiKey() {
  loadEnvLocal();
  return process.env.GOOGLE_API_KEY?.trim() || process.env.GOOGLE_MAPS_API_KEY?.trim() || "";
}

/** Normaliza env: BCR en ISSUER_ID → MERCHANT_ID */
export function normalizeWalletEnv(processEnv = process.env) {
  const issuer = processEnv.GOOGLE_WALLET_ISSUER_ID?.trim() || "";
  const merchant = processEnv.GOOGLE_PAY_MERCHANT_ID?.trim() || "";

  if (issuer && isMerchantId(issuer)) {
    if (!merchant) processEnv.GOOGLE_PAY_MERCHANT_ID = issuer;
    delete processEnv.GOOGLE_WALLET_ISSUER_ID;
    return {
      movedMerchantFromIssuer: true,
      merchantId: issuer,
      issuerId: "",
    };
  }

  return {
    movedMerchantFromIssuer: false,
    merchantId: merchant,
    issuerId: issuer,
  };
}

export async function validateGoogleApiKey(apiKey) {
  if (!apiKey) return { ok: false, skip: true, reason: "Sin GOOGLE_API_KEY" };
  if (!apiKey.startsWith("AIza")) {
    return { ok: false, reason: "Formato de API key inválido (debe empezar por AIza)" };
  }

  try {
    const res = await fetch(`https://www.googleapis.com/discovery/v1/apis?key=${encodeURIComponent(apiKey)}`);
    if (res.ok) {
      return { ok: true, reason: "API key responde en Google Discovery API" };
    }
    const text = await res.text();
    return { ok: false, reason: `HTTP ${res.status}: ${text.slice(0, 120)}` };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

export function printCredentialGuide({ merchantId, issuerId, apiKeyOk }) {
  console.log("\n── Credenciales detectadas ──");
  if (merchantId) {
    console.log(`  Merchant ID (Google Pay): ${merchantId}`);
    console.log("  ℹ BCR… es para pagos — NO sustituye al Issuer ID de Wallet API");
  } else {
    console.log("  Merchant ID: (no configurado)");
  }

  if (issuerId && isNumericIssuerId(issuerId)) {
    console.log(`  Issuer ID (Wallet API):   ${issuerId} ✓`);
  } else {
    console.log("  Issuer ID (Wallet API):   ✗ FALTA — debe ser numérico (ej. 3388000000022883204)");
    console.log("  Obtenerlo en:");
    console.log("  https://pay.google.com/business/console");
    console.log("  → Google Wallet API → Build your first pass → Issuer ID arriba");
  }

  if (apiKeyOk?.ok) {
    console.log("  API Key:                  ✓ válida (Maps u otras APIs)");
  } else if (apiKeyOk && !apiKeyOk.skip) {
    console.log(`  API Key:                  ⚠ ${apiKeyOk.reason}`);
  }

  console.log("\n  Nota: la wallet web usa cuenta de servicio (JWT), no la API key.");
  console.log("  La API key sirve para Maps u otros servicios Google en el sitio.");
}

#!/usr/bin/env node
/**
 * Prueba Google Wallet nativo (JWT + botón en /wallet/).
 *
 * Uso:
 *   npm run test:google-wallet
 *   npm run test:google-wallet -- --strict   # falla si configured=false en Supabase
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { readGoogleServiceAccount } from "./lib/read-google-sa.mjs";
import { resolveIssuerIdFromConfig } from "./lib/google-wallet-config.mjs";
import { setupGoogleWalletClass } from "./lib/google-wallet-api.mjs";
import { SUPABASE_URL, SUPABASE_ANON_KEY, WALLET_CONFIGURED } from "./wallet/supabase-shared.mjs";

loadEnvLocal();

const strict = process.argv.includes("--strict");
let failed = 0;

function pass(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  failed += 1;
}

function warn(label, detail = "") {
  console.log(`  ○ ${label}${detail ? ` — ${detail}` : ""}`);
}

console.log("\n═══ Pruebas Google Wallet nativo ═══\n");

const issuerId = resolveIssuerIdFromConfig();
if (issuerId) pass("Issuer ID local", issuerId);
else fail("Issuer ID local", "content/google-wallet.json o GOOGLE_WALLET_ISSUER_ID");

const saInfo = readGoogleServiceAccount();
if (saInfo?.account?.client_email) {
  pass("Cuenta de servicio", `${saInfo.account.client_email} (${saInfo.source})`);
} else {
  fail(
    "Cuenta de servicio",
    "secrets/google-wallet-sa.json o GOOGLE_WALLET_SERVICE_ACCOUNT en GitHub",
  );
}

if (saInfo?.account) {
  try {
    const setup = await setupGoogleWalletClass();
    if (setup.ok) {
      pass("Wallet API + clase", setup.classId);
    } else {
      fail("Wallet API + clase", setup.error?.slice(0, 120) || "error");
    }
  } catch (err) {
    fail("Wallet API + clase", err.message);
  }
}

if (WALLET_CONFIGURED) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: "getGoogleWalletStatus" }),
    });
    const data = await res.json();
    if (data.issuerConfigured) pass("Supabase issuer", data.classId || "OK");
    else fail("Supabase issuer", "GOOGLE_WALLET_ISSUER_ID no en Edge Function");

    if (data.configured) {
      pass("Supabase JWT", "botón «Añadir a Google Wallet» activo");
    } else {
      const msg = "GOOGLE_WALLET_SERVICE_ACCOUNT no desplegado en Supabase";
      if (strict) fail("Supabase JWT", msg);
      else warn("Supabase JWT", msg);
    }
  } catch (err) {
    fail("API getGoogleWalletStatus", err.message);
  }
} else {
  fail("Supabase", "SUPABASE_URL / clave pública faltante");
}

console.log("\n── Rutas para probar en Android ──");
console.log("  1. https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/");
console.log("  2. http://xn--mascaf-gva.com/wallet/");
console.log("  → Iniciar sesión → pestaña QR o tarjeta → «Añadir a Google Wallet»");
console.log("\n── Si configured=false ──");
console.log("  npm run wallet:google-bootstrap -- ./tu-cuenta-servicio.json");
console.log("  npm run wallet:google-publish");
console.log("  O secret GitHub: GOOGLE_WALLET_SERVICE_ACCOUNT = JSON completo\n");

console.log(
  `${failed ? "❌" : "✅"} ${failed ? `${failed} prueba(s) fallaron` : "Listo para probar en móvil"}\n`,
);
process.exit(failed ? 1 : 0);

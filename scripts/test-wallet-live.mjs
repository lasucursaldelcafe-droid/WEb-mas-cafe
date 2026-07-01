#!/usr/bin/env node
/**
 * Pruebas de wallet publicada (API Supabase + HTML).
 * Uso:
 *   npm run test:wallet
 *   npm run test:wallet -- --local
 *   npm run test:wallet -- --url https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { SUPABASE_URL, SUPABASE_ANON_KEY, WALLET_CONFIGURED } from "./wallet/supabase-shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

loadEnvLocal();

const args = process.argv.slice(2);
const localOnly = args.includes("--local");
const urlArg = args.find((a) => a.startsWith("http"));
const baseUrl =
  urlArg ||
  (localOnly
    ? null
    : "https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/");

let failed = 0;

function pass(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  failed += 1;
}

console.log("\n═══ Pruebas wallet ═══\n");

if (!WALLET_CONFIGURED) {
  fail("env", "SUPABASE_URL o clave pública faltante en .env.local");
} else {
  pass("env", SUPABASE_URL);
}

try {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action: "getProgramStatus" }),
  });
  if (!res.ok) {
    fail("API getProgramStatus", `HTTP ${res.status}`);
  } else {
    const data = await res.json();
    if (data.enabled && data.brandName) {
      pass("API getProgramStatus", data.brandName);
    } else {
      fail("API getProgramStatus", "respuesta inesperada");
    }
  }
} catch (err) {
  fail("API getProgramStatus", err.message);
}

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
  if (data.issuerConfigured) {
    pass("Google Wallet issuer", data.classId || "issuer OK");
  } else {
    fail("Google Wallet issuer", "falta GOOGLE_WALLET_ISSUER_ID en Supabase");
  }
  if (data.configured) {
    pass("Google Wallet JWT", "listo para botón save");
  } else {
    console.log("  ○ Google Wallet JWT — pendiente JSON GCP (QR web operativo)");
  }
} catch (err) {
  fail("API getGoogleWalletStatus", err.message);
}

const localHtml = path.join(root, "gh-pages-site/wallet/index.html");
if (existsSync(localHtml)) {
  const html = readFileSync(localHtml, "utf8");
  if (html.includes("data-save-card")) pass("HTML guardar tarjeta", "gh-pages-site");
  else fail("HTML guardar tarjeta", "falta data-save-card en build local");
  if (html.includes("SUPABASE_URL")) pass("HTML Supabase boot", "gh-pages-site");
  else fail("HTML Supabase boot", "sin SUPABASE_URL");
} else if (localOnly) {
  fail("build local", "ejecuta npm run build:github-pages");
}

if (baseUrl && !localOnly) {
  try {
    const res = await fetch(baseUrl);
    const html = await res.text();
    if (res.ok) pass("HTTP wallet live", baseUrl);
    else fail("HTTP wallet live", `HTTP ${res.status}`);
    if (html.includes("data-save-card")) pass("HTML guardar tarjeta en vivo");
    else fail("HTML guardar tarjeta en vivo");
    if (html.includes("SUPABASE_URL")) pass("HTML Supabase en vivo");
    else fail("HTML Supabase en vivo");
  } catch (err) {
    fail("HTTP wallet live", err.message);
  }

  const cajaUrl = baseUrl.replace(/wallet\/?$/, "caja/");
  try {
    const code = (await fetch(cajaUrl, { method: "HEAD", redirect: "follow" })).status;
    if (code === 200) pass("HTTP caja live", cajaUrl);
    else fail("HTTP caja live", `HTTP ${code}`);
  } catch (err) {
    fail("HTTP caja live", err.message);
  }
}

console.log(`\n${failed ? "❌" : "✅"} ${failed ? `${failed} prueba(s) fallaron` : "Todas las pruebas pasaron"}\n`);
process.exit(failed ? 1 : 0);

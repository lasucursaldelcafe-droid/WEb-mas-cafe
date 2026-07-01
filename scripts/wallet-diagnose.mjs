#!/usr/bin/env node
/**
 * Diagnóstico rápido de configuración Supabase para la wallet.
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { resolveIssuerIdFromConfig } from "./lib/google-wallet-config.mjs";
import { resolveGoogleWalletServiceAccount } from "./lib/google-wallet-api.mjs";
import { findGoogleWalletSaFile } from "./lib/google-wallet-sa-path.mjs";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  WALLET_CONFIGURED,
  SUPABASE_LINKS,
} from "./wallet/supabase-shared.mjs";
import { projectRefFromUrl } from "./lib/supabase-management-api.mjs";

loadEnvLocal();

const serviceRole =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const projectRef =
  process.env.SUPABASE_PROJECT_REF?.trim() || projectRefFromUrl(SUPABASE_URL);

console.log("\n═══════════════════════════════════════════════════");
console.log("  Diagnóstico — Wallet Supabase");
console.log("═══════════════════════════════════════════════════\n");

const checks = [];

function add(id, ok, msg, fix) {
  checks.push({ id, ok, msg, fix });
  console.log(`  ${ok ? "✓" : "✗"} [${id}] ${msg}`);
  if (fix && !ok) console.log(`      → ${fix}`);
}

add(
  "url",
  Boolean(SUPABASE_URL),
  SUPABASE_URL ? `URL: ${SUPABASE_URL}` : "Falta SUPABASE_URL",
  SUPABASE_LINKS.newProject,
);

add(
  "anon",
  Boolean(SUPABASE_ANON_KEY),
  SUPABASE_ANON_KEY ? "Clave anon configurada" : "Falta SUPABASE_ANON_KEY",
  "Supabase → Settings → API → anon public",
);

add(
  "service_role",
  Boolean(serviceRole),
  serviceRole ? "Service role (CI) configurada" : "Falta SUPABASE_SERVICE_ROLE_KEY (solo CI)",
  SUPABASE_LINKS.githubSecrets,
);

add(
  "cli",
  Boolean(accessToken && projectRef),
  accessToken && projectRef
    ? `CLI listo (ref: ${projectRef})`
    : "Falta SUPABASE_ACCESS_TOKEN o SUPABASE_PROJECT_REF para deploy automático",
  "https://supabase.com/dashboard/account/tokens",
);

if (WALLET_CONFIGURED) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: "getProgramStatus" }),
    });
    if (res.ok) {
      add("backend", true, "Edge Function wallet responde", null);
    } else {
      const text = await res.text();
      add(
        "backend",
        false,
        `Edge Function HTTP ${res.status}`,
        `npm run wallet:setup — ${text.slice(0, 120)}`,
      );
    }
  } catch (err) {
    add("backend", false, err.message, "npm run wallet:setup");
  }
} else {
  add("backend", false, "Backend no configurado en build", SUPABASE_LINKS.githubSecrets);
}

const gwIssuer = resolveIssuerIdFromConfig();
const gwSaObj = resolveGoogleWalletServiceAccount();
const gwSaFile = findGoogleWalletSaFile();
const gwSaReady = Boolean(gwIssuer && gwSaObj?.client_email);
add(
  "google_wallet_env",
  gwSaReady,
  gwSaReady
    ? `Google Wallet env OK (issuer ${gwIssuer})`
    : gwIssuer && gwSaFile
      ? "JSON en secrets/ inválido o incompleto"
      : gwIssuer
        ? "Falta secrets/google-wallet-sa.json"
        : "Google Wallet sin configurar en .env.local",
  gwSaReady
    ? ""
    : "npm run wallet:google-bootstrap — luego npm run wallet:google-auto",
);

if (WALLET_CONFIGURED && gwSaReady) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: "getGoogleWalletStatus" }),
    });
    if (res.ok) {
      const data = await res.json();
      add(
        "google_wallet_backend",
        data.configured === true,
        data.configured
          ? "Google Wallet activo en Edge Function"
          : "Secrets Google Wallet no desplegados en Supabase",
        "npm run wallet:google-auto",
      );
    }
  } catch {
    add("google_wallet_backend", false, "No se pudo verificar Google Wallet", "npm run wallet:google-auto");
  }
}

console.log("\n── Enlaces ──");
console.log(`  Nuevo proyecto:  ${SUPABASE_LINKS.newProject}`);
console.log(`  GitHub Secrets:  ${SUPABASE_LINKS.githubSecrets}`);
console.log(`  Workflow deploy: ${SUPABASE_LINKS.workflow}`);

console.log("\n── Por qué Firebase no servía ──");
console.log("  Cloud Functions requieren plan Blaze (facturación).");
console.log("  Supabase plan gratuito incluye Auth + Postgres + Edge Functions.");

const blockers = checks.filter(
  (c) =>
    !c.ok &&
    c.id !== "service_role" &&
    c.id !== "cli" &&
    !c.id.startsWith("google_wallet"),
);
console.log("\n═══════════════════════════════════════════════════");
if (blockers.length === 0) {
  console.log("  Listo — npm run wallet:setup");
  process.exit(0);
} else {
  console.log("  Corrige los ✗ y vuelve a publicar en GitHub Pages");
  process.exit(1);
}

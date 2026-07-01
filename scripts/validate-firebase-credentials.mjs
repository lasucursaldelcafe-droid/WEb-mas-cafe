#!/usr/bin/env node
/**
 * @deprecated Valida credenciales Supabase para la wallet (reemplaza validate-firebase).
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  WALLET_CONFIGURED,
  SUPABASE_LINKS,
} from "./wallet/supabase-shared.mjs";

loadEnvLocal();

console.log("\n═══ Validación Supabase — Wallet ═══\n");
console.warn("  (validate-firebase-credentials.mjs está obsoleto — usa Supabase)\n");

let ok = true;

if (!SUPABASE_URL) {
  ok = false;
  console.log("  ✗ Falta SUPABASE_URL");
} else {
  console.log(`  ✓ SUPABASE_URL — ${SUPABASE_URL}`);
}

if (!SUPABASE_ANON_KEY) {
  ok = false;
  console.log("  ✗ Falta SUPABASE_PUBLISHABLE_KEY o SUPABASE_ANON_KEY");
} else {
  console.log("  ✓ Clave pública (anon/publishable) configurada");
}

if (!process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
  console.log("  ⚠ SUPABASE_ACCESS_TOKEN — necesario para deploy automático (CI)");
} else {
  console.log("  ✓ SUPABASE_ACCESS_TOKEN configurado");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.log("  ⚠ SUPABASE_SECRET_KEY / SERVICE_ROLE — necesario para seed programa");
} else {
  console.log("  ✓ Clave service_role / secret configurada");
}

if (!WALLET_CONFIGURED) {
  ok = false;
  console.log("\n  ✗ Wallet no configurada para el build (falta URL o clave pública)");
}

console.log(`\n  Panel secrets: ${SUPABASE_LINKS.githubSecrets}`);
console.log(`  Workflow deploy: ${SUPABASE_LINKS.workflow}\n`);

if (!ok) process.exit(1);
console.log("✅ Supabase listo para wallet\n");

#!/usr/bin/env node
/**
 * Setup autónomo de Supabase para la wallet (plan gratuito — sin Blaze).
 *
 * Requiere:
 *   SUPABASE_ACCESS_TOKEN  — token personal https://supabase.com/dashboard/account/tokens
 *   SUPABASE_PROJECT_REF   — ref del proyecto (ej. abcdefghijklmnop)
 *   SUPABASE_URL           — https://xxx.supabase.co
 *   SUPABASE_ANON_KEY      — clave anon (Settings → API)
 *   SUPABASE_SERVICE_ROLE_KEY — clave service_role (solo CI, nunca en frontend)
 *
 * Uso:
 *   npm run wallet:setup
 *   npm run wallet:setup:dry
 */
import { execSync } from "child_process";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  WALLET_CONFIGURED,
  SUPABASE_LINKS,
  readProgramDefaults,
} from "./wallet/supabase-shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

loadEnvLocal();

const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const projectRef = process.env.SUPABASE_PROJECT_REF?.trim();
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

function log(step, msg) {
  console.log(`  ${dryRun ? "○" : "✓"} [${step}] ${msg}`);
}

function run(cmd, label) {
  console.log(`\n▸ ${label}\n`);
  if (dryRun) {
    console.log(`  (dry-run) ${cmd}`);
    return;
  }
  execSync(cmd, { cwd: root, stdio: "inherit", env: process.env });
}

function hashPin(pin) {
  return createHash("sha256").update(String(pin)).digest("hex");
}

async function seedProgramViaApi() {
  if (!serviceRole || !SUPABASE_URL) return { seeded: false, reason: "Sin service role" };

  const program = readProgramDefaults() || {};
  const pin = program.defaultStaffPin || "123456";

  const payload = {
    id: 1,
    enabled: program.enabled !== false,
    points_per_thousand_cop: program.pointsPerThousandCop ?? 1,
    min_purchase_cop: program.minPurchaseCop ?? 15000,
    max_points_per_day: program.maxPointsPerDay ?? 500,
    brand_name: program.brandName || "Más Café",
    tiers: program.tiers || [],
    rewards: program.rewards || [],
    staff_pin_hash: hashPin(pin),
    initialized_at: new Date().toISOString(),
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/program_settings`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return { seeded: false, reason: text };
  }

  return { seeded: true, defaultStaffPin: pin };
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Setup autónomo — Wallet Supabase (plan gratuito)");
if (dryRun) console.log("  MODO: dry-run");
console.log("═══════════════════════════════════════════════════\n");

run("node scripts/wallet/sync-program.mjs", "Sincronizar programa (referencia local)");

if (!WALLET_CONFIGURED) {
  console.error("✗ Faltan SUPABASE_URL y SUPABASE_ANON_KEY.\n");
  console.error("  1. Crear proyecto gratis: " + SUPABASE_LINKS.newProject);
  console.error("  2. Copiar URL + anon key en GitHub Secrets");
  console.error("  3. " + SUPABASE_LINKS.githubSecrets);
  process.exit(1);
}

log("config", `Supabase URL: ${SUPABASE_URL}`);

if (!accessToken || !projectRef) {
  console.warn("\n⚠ Sin SUPABASE_ACCESS_TOKEN o SUPABASE_PROJECT_REF — omitiendo CLI deploy.");
  console.warn("  Añade ambos secrets para migraciones + Edge Function automáticas.\n");
  console.warn("  Token: https://supabase.com/dashboard/account/tokens\n");

  if (!dryRun && serviceRole) {
    log("seed", "Sembrando programa vía API REST…");
    const seed = await seedProgramViaApi();
    console.log(
      seed.seeded
        ? `      Programa listo · PIN caja: ${seed.defaultStaffPin}`
        : `      Seed omitido: ${seed.reason}`,
    );
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Configura secrets de CLI y vuelve a ejecutar wallet:setup");
  console.log("  Cliente: /wallet/  ·  Caja: /caja/");
  console.log("═══════════════════════════════════════════════════\n");
  process.exit(0);
}

log("1/4", "Vinculando proyecto Supabase CLI…");
run(`npx supabase link --project-ref ${projectRef}`, "supabase link");

log("2/4", "Aplicando migraciones SQL…");
run("npx supabase db push", "supabase db push");

log("3/4", "Desplegando Edge Function wallet…");
run("npx supabase functions deploy wallet --no-verify-jwt", "supabase functions deploy");

if (serviceRole && !dryRun) {
  log("4/4", "Sembrando programa de fidelización…");
  const seed = await seedProgramViaApi();
  console.log(
    seed.seeded
      ? `      Programa listo · PIN caja inicial: ${seed.defaultStaffPin}`
      : `      ${seed.reason || "Programa ya existía"}`,
  );
} else {
  log("4/4", "Seed — requiere SUPABASE_SERVICE_ROLE_KEY");
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Wallet Supabase lista");
console.log("  Activa Auth (email + Google) en el panel Supabase");
console.log("  Cliente:  /wallet/");
console.log("  Caja:     /caja/  (PIN inicial 123456)");
console.log("═══════════════════════════════════════════════════\n");

#!/usr/bin/env node
/**
 * Ejecuta el pipeline completo sin intervención manual:
 * 1. Validar credenciales (GoDaddy + GitHub)
 * 2. Build GitHub Pages + verificar enlaces
 * 3. Configurar dominio (GoDaddy DNS + GitHub Pages custom domain)
 * 4. Setup wallet Supabase + Google Wallet JWT (si hay credenciales GCP)
 * 5. Verificar dominio
 *
 * Uso (agente / CI):
 *   npm run setup:autonomous
 *   npm run setup:autonomous -- --dry-run
 *   npm run setup:autonomous -- --skip-wallet
 *   npm run setup:autonomous -- --skip-firebase   # alias legacy de --skip-wallet
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { parseArgs } from "./lib/domain-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function run(cmd, label) {
  console.log(`\n▸ ${label}\n`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

loadEnvLocal();
const rawArgs = process.argv.slice(2);
const skipWallet =
  rawArgs.includes("--skip-wallet") || rawArgs.includes("--skip-firebase");
const opts = {
  ...parseArgs(),
  skipWallet,
};

console.log("\n═══════════════════════════════════════════════════");
console.log("  Setup autónomo — Más Café");
if (opts.dryRun) console.log("  MODO: dry-run");
if (skipWallet) console.log("  Wallet Supabase: omitida (--skip-wallet)");
console.log("═══════════════════════════════════════════════════");

if (!opts.skipGodaddy && !opts.dryRun) {
  run("node scripts/validate-credentials.mjs", "1/5 Validar credenciales");
} else {
  console.log("\n▸ 1/5 Validar credenciales — omitido (dry-run o skip-godaddy)\n");
}

run("node scripts/build-github-pages.mjs", "2/5 Build sitio + informe + wallet");
run("npm run verify:links", "3/5 Verificar enlaces internos");

const domainArgs = [
  opts.dryRun ? "--dry-run" : "",
  opts.skipGodaddy ? "--skip-godaddy" : "",
  opts.skipGithub ? "--skip-github" : "",
]
  .filter(Boolean)
  .join(" ");

run(`node scripts/configure-domain.mjs ${domainArgs}`, "4/5 Configurar dominio");

if (!opts.dryRun && !opts.skipWallet) {
  try {
    run(
      "node scripts/setup-supabase-wallet.mjs",
      "5/6 Setup wallet Supabase (Auth + Postgres + Edge Functions)",
    );
  } catch {
    console.log(
      "\n⚠ Setup Supabase omitido o falló — configura SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF y claves API en Secrets.\n" +
        "  Guía: proyecto-mas-cafe/cuentas/ENLACES-CONFIGURACION.md\n" +
        "  Workflow: Deploy wallet Supabase\n",
    );
  }
  try {
    run("node scripts/heal-google-wallet.mjs", "6/6 Google Wallet (JWT + configured)");
  } catch {
    console.log(
      "\n⚠ Google Wallet JWT pendiente — falta JSON GCP o FIREBASE_TOKEN válido.\n" +
        "  Actions → Ingestar JSON Google Wallet | npm run wallet:google-ingest -- ./archivo.json\n",
    );
  }
} else {
  console.log("\n▸ 5/6 Setup wallet Supabase — omitido (dry-run o --skip-wallet)\n");
}

if (!opts.dryRun) {
  try {
    run("node scripts/verify-domain.mjs", "Verificación final DNS/HTTP");
  } catch {
    console.log("\n⏳ DNS puede tardar en propagar. Repite: npm run domain:verify\n");
  }
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Setup autónomo completado");
console.log("═══════════════════════════════════════════════════\n");

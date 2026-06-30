#!/usr/bin/env node
/**
 * Ejecuta el pipeline completo sin intervención manual:
 * 1. Validar credenciales
 * 2. Build GitHub Pages + verificar enlaces
 * 3. Configurar dominio (GoDaddy DNS + GitHub Pages custom domain)
 * 4. Verificar dominio
 *
 * Uso (agente / CI):
 *   npm run setup:autonomous
 *   npm run setup:autonomous -- --dry-run
 *   npm run setup:autonomous -- --skip-godaddy
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
const opts = parseArgs();

console.log("\n═══════════════════════════════════════════════════");
console.log("  Setup autónomo — Más Café");
if (opts.dryRun) console.log("  MODO: dry-run");
console.log("═══════════════════════════════════════════════════");

if (!opts.skipGodaddy && !opts.dryRun) {
  run("node scripts/validate-credentials.mjs", "1/4 Validar credenciales");
} else {
  console.log("\n▸ 1/4 Validar credenciales — omitido (dry-run o skip-godaddy)\n");
}

run("node scripts/build-github-pages.mjs", "2/4 Build sitio + informe + wallet");
run("npm run verify:links", "3/4 Verificar enlaces internos");

const domainArgs = [
  opts.dryRun ? "--dry-run" : "",
  opts.skipGodaddy ? "--skip-godaddy" : "",
  opts.skipGithub ? "--skip-github" : "",
]
  .filter(Boolean)
  .join(" ");

run(`node scripts/configure-domain.mjs ${domainArgs}`, "4/4 Configurar dominio");

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

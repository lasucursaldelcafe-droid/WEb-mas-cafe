#!/usr/bin/env node
/**
 * Publica la wallet completa: Supabase + GitHub Pages + verificación.
 * Uso: npm run wallet:publish
 */
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { applyGoogleWalletConfigToEnv } from "./lib/google-wallet-config.mjs";
import { resolveGhToken } from "./lib/gh-secrets.mjs";

loadEnvLocal();
applyGoogleWalletConfigToEnv();

const skipPages = process.argv.includes("--skip-pages");
const skipGoogle = process.argv.includes("--skip-google");

console.log("\n═══════════════════════════════════════════════════");
console.log("  Publicar wallet — Más Café");
console.log("═══════════════════════════════════════════════════\n");

console.log("▸ 1/5 Supabase (setup + Edge Function)…");
execSync("node scripts/setup-supabase-wallet.mjs", { stdio: "inherit", env: process.env });

if (!skipGoogle) {
  console.log("\n▸ 2/5 Google Wallet (IDs + función)…");
  try {
    execSync("node scripts/automate-google-wallet.mjs --ids-only --skip-pages", {
      stdio: "inherit",
      env: { ...process.env, SKIP_GITHUB_SECRETS: "1" },
    });
  } catch {
    console.warn("  ⚠ Google Wallet parcial — continúa con QR web");
  }
} else {
  console.log("\n▸ 2/5 Google Wallet omitido");
}

console.log("\n▸ 3/5 Build GitHub Pages…");
execSync("node scripts/build-github-pages.mjs", { stdio: "inherit", env: process.env });

if (!skipPages) {
  console.log("\n▸ 4/5 Disparar publicación en GitHub…");
  const ghToken = resolveGhToken();
  if (ghToken) {
    try {
      execSync(
        'gh workflow run "Publicar HTML en GitHub Pages" --repo lasucursaldelcafe-droid/WEb-mas-cafe',
        { env: { ...process.env, GH_TOKEN: ghToken }, stdio: "inherit" },
      );
      console.log("  ✓ Workflow disparado — espera ~1 min");
    } catch (err) {
      console.warn(`  ⚠ No se pudo disparar workflow: ${err.message}`);
    }
  } else {
    console.warn("  ⚠ Sin GH_PAGES_PAT — publica manualmente en GitHub Actions");
  }
} else {
  console.log("\n▸ 4/5 Publicación remota omitida");
}

console.log("\n▸ 5/5 Pruebas locales + API…");
execSync("node scripts/test-wallet-live.mjs --local", { stdio: "inherit", env: process.env });

console.log("\n═══════════════════════════════════════════════════");
console.log("  Wallet publicada (flujo completado)");
console.log("  Live: https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/");
console.log("  Caja: https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/caja/");
console.log("═══════════════════════════════════════════════════\n");

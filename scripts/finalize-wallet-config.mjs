#!/usr/bin/env node
/**
 * Finaliza configuración wallet: Auth Supabase, HTTPS dominio, verificación.
 * Uso: npm run wallet:finalize
 */
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  projectRefFromUrl,
  configureSupabaseAuth,
  getProjectStatus,
} from "./lib/supabase-management-api.mjs";
import { SUPABASE_URL } from "./wallet/supabase-shared.mjs";
import { DOMAIN_PUNYCODE } from "./lib/domain-config.mjs";

loadEnvLocal();

const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const projectRef =
  process.env.SUPABASE_PROJECT_REF?.trim() || projectRefFromUrl(SUPABASE_URL);

console.log("\n═══════════════════════════════════════════════════");
console.log("  Finalizar configuración — Wallet Más Café");
console.log("═══════════════════════════════════════════════════\n");

if (!accessToken || !projectRef) {
  console.error("✗ Falta SUPABASE_ACCESS_TOKEN o URL en .env.local");
  process.exit(1);
}

console.log("▸ 1/4 Auth Supabase (email + redirects)…");
const project = await getProjectStatus(accessToken, projectRef);
if (!project.ok) {
  console.error(`  ✗ ${project.json?.message || project.text}`);
  process.exit(1);
}

const auth = await configureSupabaseAuth(accessToken, projectRef);
console.log(auth.ok ? "  ✓ Auth configurado" : `  ⚠ Auth: ${auth.error}`);

console.log("\n▸ 2/4 HTTPS en mascafé.com…");
try {
  execSync("node scripts/enable-https.mjs --wait", {
    stdio: "inherit",
    env: process.env,
  });
} catch {
  console.warn("  ⚠ HTTPS aún propagando — el cron maintain-domain reintentará");
}

console.log("\n▸ 3/4 Republicar GitHub Pages (wallet + caja)…");
try {
  execSync('gh workflow run "Publicar HTML en GitHub Pages" --repo lasucursaldelcafe-droid/WEb-mas-cafe', {
    env: {
      ...process.env,
      GH_TOKEN: process.env.GITHUB_TOKEN || process.env.GH_PAGES_PAT,
    },
    stdio: "pipe",
  });
  console.log("  ✓ Workflow disparado");
} catch (err) {
  console.warn(`  ⚠ ${err.message}`);
}

console.log("\n▸ 4/4 Verificación…");
execSync("node scripts/wallet-diagnose.mjs", { stdio: "inherit", env: process.env });

const urls = [
  `http://${DOMAIN_PUNYCODE}/wallet/`,
  `http://${DOMAIN_PUNYCODE}/caja/`,
  "https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/",
];

console.log("\n── URLs operativas ──");
for (const url of urls) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const hasBackend = url.includes("/wallet/")
      ? (await (await fetch(url)).text()).includes("SUPABASE_URL")
      : true;
    console.log(
      `  ${res.ok ? "✓" : "✗"} ${url} → HTTP ${res.status}${hasBackend ? " · backend OK" : ""}`,
    );
  } catch (e) {
    console.log(`  ✗ ${url} → ${e.message}`);
  }
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Wallet lista · PIN caja: 123456");
console.log("  Login: email/contraseña (Google: activar en Supabase si lo necesitan)");
console.log("═══════════════════════════════════════════════════\n");

#!/usr/bin/env node
/**
 * Conecta Supabase con GitHub + despliega wallet.
 *
 * 1. Lee credenciales de .env.local
 * 2. Sube secrets a GitHub (gh secret set)
 * 3. Configura Auth redirects en Supabase (Management API)
 * 4. Ejecuta migraciones + Edge Function + seed
 * 5. Dispara workflows de deploy
 *
 * Variables en .env.local:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_ACCESS_TOKEN
 *   SUPABASE_PROJECT_REF   (opcional — se deduce de la URL)
 *   GITHUB_TOKEN           (PAT con repo + secrets)
 *
 * Uso: npm run wallet:connect
 */
import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  projectRefFromUrl,
  configureSupabaseAuth,
  getProjectStatus,
} from "./lib/supabase-management-api.mjs";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  WALLET_CONFIGURED,
} from "./wallet/supabase-shared.mjs";

loadEnvLocal();

const REPO = "lasucursaldelcafe-droid/WEb-mas-cafe";

const required = [
  "SUPABASE_URL",
  "SUPABASE_ACCESS_TOKEN",
];

const missing = required.filter((k) => !process.env[k]?.trim());

const publishable =
  process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim();
const secret =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!publishable) missing.push("SUPABASE_PUBLISHABLE_KEY (o SUPABASE_ANON_KEY)");
if (!secret) missing.push("SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY)");

console.log("\n═══════════════════════════════════════════════════");
console.log("  Conectar wallet Supabase → GitHub + deploy");
console.log("═══════════════════════════════════════════════════\n");

if (missing.length) {
  console.error("✗ Faltan variables en .env.local:\n");
  for (const k of missing) console.error(`    ${k}=`);
  if (!publishable) missing.push("SUPABASE_PUBLISHABLE_KEY (o SUPABASE_ANON_KEY)");
  if (!secret) missing.push("SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY)");
  console.error("\n  Obtén los valores en:");
  console.error("  Supabase → Settings → API (Project URL, publishable, secret)");
  console.error("  Supabase → Account → Access Tokens");
  console.error("\n  Plantilla: copia .env.example → .env.local y rellena.\n");
  process.exit(1);
}

let projectRef = process.env.SUPABASE_PROJECT_REF?.trim();
if (!projectRef) {
  projectRef = projectRefFromUrl(SUPABASE_URL);
  if (projectRef) {
    process.env.SUPABASE_PROJECT_REF = projectRef;
    console.log(`  • PROJECT_REF deducido de URL: ${projectRef}`);
  } else {
    console.error("✗ No se pudo deducir SUPABASE_PROJECT_REF — añádelo a .env.local");
    process.exit(1);
  }
}

const ghToken = process.env.GITHUB_TOKEN || process.env.GH_PAGES_PAT;
if (!ghToken) {
  console.warn("⚠ Sin GITHUB_TOKEN — omitiendo subida de secrets a GitHub");
} else {
  console.log("\n▸ Subiendo secrets a GitHub…\n");
  const secrets = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: publishable,
    SUPABASE_PUBLISHABLE_KEY: publishable,
    SUPABASE_SERVICE_ROLE_KEY: secret,
    SUPABASE_SECRET_KEY: secret,
    SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
    SUPABASE_PROJECT_REF: projectRef,
  };

  if (process.env.GOOGLE_WALLET_ISSUER_ID?.trim()) {
    secrets.GOOGLE_WALLET_ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID.trim();
  }
  if (process.env.GOOGLE_WALLET_SERVICE_ACCOUNT?.trim()) {
    secrets.GOOGLE_WALLET_SERVICE_ACCOUNT = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT.trim();
  }

  for (const [name, value] of Object.entries(secrets)) {
    try {
      execSync(`gh secret set ${name} --repo ${REPO}`, {
        input: value,
        env: { ...process.env, GH_TOKEN: ghToken, GITHUB_TOKEN: ghToken },
        stdio: ["pipe", "pipe", "pipe"],
      });
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.stderr?.toString() || err.message}`);
      process.exit(1);
    }
  }
}

console.log("\n▸ Configurando Auth en Supabase (redirects + email)…\n");
const accessToken = process.env.SUPABASE_ACCESS_TOKEN.trim();
const project = await getProjectStatus(accessToken, projectRef);
if (!project.ok) {
  console.error(`  ✗ Proyecto ${projectRef}: ${project.json?.message || project.text}`);
  process.exit(1);
}
console.log(`  ✓ Proyecto: ${project.json?.name || projectRef}`);

const auth = await configureSupabaseAuth(accessToken, projectRef);
if (auth.ok) {
  console.log(`  ✓ Site URL: ${auth.siteUrl}`);
  console.log(`  ✓ Redirects: ${auth.allowList.split(",").length} URLs`);
} else {
  console.warn(`  ⚠ Auth config HTTP ${auth.status}: ${auth.error}`);
  console.warn("    Activa Email manualmente en Supabase → Authentication → Providers");
}

console.log("\n▸ Google Sign-In (manual, 2 minutos):");
console.log("  Supabase → Authentication → Providers → Google → Enable");
console.log(`  Redirect: https://${projectRef}.supabase.co/auth/v1/callback`);
console.log("  (Usa el Client ID/Secret de Google Cloud Console si lo pides)\n");

console.log("▸ Deploy backend (migraciones + Edge Function)…\n");
process.env.SUPABASE_ACCESS_TOKEN = accessToken;
process.env.SUPABASE_PROJECT_REF = projectRef;

try {
  execSync("node scripts/setup-supabase-wallet.mjs", {
    stdio: "inherit",
    env: process.env,
  });
} catch {
  console.error("\n✗ Setup local falló — revisa npm run wallet:diagnose\n");
  process.exit(1);
}

if (ghToken) {
  console.log("\n▸ Disparando workflows GitHub…\n");
  for (const workflow of ["Deploy wallet Supabase", "Publicar HTML en GitHub Pages"]) {
    try {
      execSync(`gh workflow run ${JSON.stringify(workflow)} --repo ${REPO}`, {
        env: { ...process.env, GH_TOKEN: ghToken, GITHUB_TOKEN: ghToken },
        stdio: "pipe",
      });
      console.log(`  ✓ ${workflow}`);
    } catch (err) {
      console.warn(`  ⚠ ${workflow}: ${err.message}`);
    }
  }
}

console.log("\n▸ Verificación…\n");
execSync("node scripts/wallet-diagnose.mjs", { stdio: "inherit", env: process.env });

console.log("\n═══════════════════════════════════════════════════");
console.log("  Wallet conectada");
console.log("  Cliente: https://xn--mascaf-gva.com/wallet/");
console.log("  Caja:    https://xn--mascaf-gva.com/caja/");
console.log("  PIN:     123456");
console.log("═══════════════════════════════════════════════════\n");

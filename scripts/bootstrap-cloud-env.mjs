#!/usr/bin/env node
/**
 * Materializa .env.local desde variables de entorno (Cursor Secrets / CI).
 * No imprime valores secretos.
 *
 * Uso:
 *   node scripts/bootstrap-cloud-env.mjs
 *   npm run env:bootstrap
 */
import { existsSync } from "fs";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { upsertEnvLocal } from "./lib/upsert-env-local.mjs";

loadEnvLocal();

const SECRET_KEYS = [
  "GODADDY_API_KEY",
  "GODADDY_API_SECRET",
  "GH_PAGES_PAT",
  "GITHUB_TOKEN",
  "ADMIN_PUBLISH_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_PROJECT_REF",
];

function pickEnv(key) {
  const val = process.env[key]?.trim();
  return val || null;
}

function main() {
  const updates = {};
  const present = [];
  const missing = [];

  for (const key of SECRET_KEYS) {
    const val = pickEnv(key);
    if (val) {
      updates[key] = val;
      present.push(key);
    } else {
      missing.push(key);
    }
  }

  // GH_PAGES_PAT y GITHUB_TOKEN son intercambiables para scripts de dominio
  if (!updates.GITHUB_TOKEN && updates.GH_PAGES_PAT) {
    updates.GITHUB_TOKEN = updates.GH_PAGES_PAT;
    present.push("GITHUB_TOKEN (desde GH_PAGES_PAT)");
  }
  if (!updates.GH_PAGES_PAT && updates.GITHUB_TOKEN) {
    updates.GH_PAGES_PAT = updates.GITHUB_TOKEN;
    present.push("GH_PAGES_PAT (desde GITHUB_TOKEN)");
  }

  const domainKeys = ["GODADDY_API_KEY", "GODADDY_API_SECRET", "GH_PAGES_PAT"];
  const domainReady = domainKeys.every((k) => updates[k]);

  if (Object.keys(updates).length) {
    upsertEnvLocal(updates);
    console.log(`\n✅ .env.local actualizado (${present.length} variables)\n`);
    for (const k of present) console.log(`  • ${k}`);
  } else if (!existsSync(".env.local")) {
    console.log("\n○ Sin secrets en el entorno — .env.local no creado\n");
  } else {
    console.log("\n○ Sin secrets nuevos en el entorno — .env.local sin cambios\n");
  }

  if (missing.length) {
    console.log("Faltan en Cursor Secrets / entorno (opcional según tarea):");
    for (const k of missing) console.log(`  • ${k}`);
    console.log(
      "\nAñádelas en: cursor.com → Cloud Agents → Secrets (mismos nombres que GitHub Actions).\n",
    );
  }

  if (domainReady) {
    console.log("✅ Credenciales de dominio listas → npm run domain:enable-https:cloud\n");
    process.exit(0);
  }

  console.log(
    "ℹ️  Dominio/HTTPS: npm run domain:enable-https:cloud delega a GitHub Actions si faltan credenciales locales.\n",
  );
  process.exit(0);
}

main();

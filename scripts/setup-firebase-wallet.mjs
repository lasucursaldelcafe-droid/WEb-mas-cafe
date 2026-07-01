#!/usr/bin/env node
/**
 * @deprecated La wallet usa Supabase (plan gratuito). Este script redirige a setup-supabase-wallet.
 *
 * Firebase Cloud Functions requiere plan Blaze (facturación). No lo uses para wallet.
 *
 * Uso correcto:
 *   npm run wallet:setup
 *   npm run deploy:wallet
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

console.warn("\n⚠  setup-firebase-wallet.mjs está obsoleto.");
console.warn("   La wallet corre en Supabase (Auth + Postgres + Edge Functions).");
console.warn("   Ejecutando: npm run wallet:setup\n");

const extra = process.argv.slice(2).join(" ");
execSync(`node scripts/setup-supabase-wallet.mjs ${extra}`, {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

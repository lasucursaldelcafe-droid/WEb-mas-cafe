/** Configuración Supabase — wallet (plan gratuito, sin Blaze) */
import { loadEnvLocal } from "../lib/load-env-local.mjs";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadEnvLocal();

function readProgramDefaults() {
  try {
    return JSON.parse(
      readFileSync(path.join(__dirname, "../../content/wallet-program.json"), "utf8"),
    );
  } catch {
    return null;
  }
}

/** URL del proyecto Supabase — GitHub Secret SUPABASE_URL o .env.local */
export const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).replace(/\/$/, "");

/** Clave pública — anon legacy o publishable (sb_publishable_…) */
export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

/** Clave servidor — service_role legacy o secret (sb_secret_…) */
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  "";

export const WALLET_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const SUPABASE_LINKS = {
  dashboard: SUPABASE_URL ? `${SUPABASE_URL.replace(".supabase.co", "")}` : "https://supabase.com/dashboard",
  newProject: "https://supabase.com/dashboard/new/new-project",
  authProviders: SUPABASE_URL
    ? `${SUPABASE_URL.replace("https://", "https://supabase.com/dashboard/project/").split(".supabase.co")[0]}/auth/providers`
    : "https://supabase.com/dashboard",
  githubSecrets:
    "https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions",
  workflow:
    "https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/deploy-supabase-wallet.yml",
};

export { readProgramDefaults };

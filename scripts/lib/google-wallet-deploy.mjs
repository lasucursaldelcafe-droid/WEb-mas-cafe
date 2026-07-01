/**
 * Deploy compartido: secrets Supabase/GitHub + Edge Function wallet.
 */
import { execSync } from "child_process";
import { projectRefFromUrl } from "./supabase-management-api.mjs";
import { SUPABASE_URL } from "../wallet/supabase-shared.mjs";
import { setGhSecret, resolveGhToken } from "./gh-secrets.mjs";

/** Solo Issuer/Merchant ID (sin cuenta de servicio — botón Wallet sigue desactivado). */
export async function deployGoogleWalletIdsOnly({ issuerId, merchantId, dryRun = false }) {
  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim() || projectRefFromUrl(SUPABASE_URL);
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

  const results = { supabase: false, github: false };

  if (dryRun) {
    console.log("  (dry-run) IDs omitidos");
    return results;
  }

  if (accessToken && projectRef && issuerId) {
    let cmd = `npx supabase secrets set GOOGLE_WALLET_ISSUER_ID="${issuerId}"`;
    if (merchantId) cmd += ` GOOGLE_PAY_MERCHANT_ID="${merchantId}"`;
    cmd += ` --project-ref ${projectRef}`;
    execSync(cmd, {
      stdio: "inherit",
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken },
    });
    results.supabase = true;
  }

  if (issuerId) {
    const r1 = setGhSecret("GOOGLE_WALLET_ISSUER_ID", issuerId);
    const r2 = merchantId ? setGhSecret("GOOGLE_PAY_MERCHANT_ID", merchantId) : { ok: true };
    if (r1.ok || r2.ok) results.github = true;
  }

  return results;
}

export async function deployWalletFunction(dryRun = false) {
  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim() || projectRefFromUrl(SUPABASE_URL);
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (dryRun || !accessToken || !projectRef) return false;

  execSync(`npx supabase functions deploy wallet --no-verify-jwt --project-ref ${projectRef}`, {
    stdio: "inherit",
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken },
  });
  return true;
}

export async function deployGoogleWalletSecrets({
  issuerId,
  serviceAccount,
  merchantId,
  apiKey,
  dryRun = false,
}) {
  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim() || projectRefFromUrl(SUPABASE_URL);
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

  const results = { supabase: false, github: false, function: false };

  if (dryRun) {
    console.log("  (dry-run) secrets + deploy omitidos");
    return results;
  }

  if (accessToken && projectRef && issuerId && serviceAccount) {
    const saJson = JSON.stringify(serviceAccount).replace(/'/g, "'\\''");
    let secretCmd = `npx supabase secrets set GOOGLE_WALLET_ISSUER_ID="${issuerId}" GOOGLE_WALLET_SERVICE_ACCOUNT='${saJson}'`;
    if (merchantId) secretCmd += ` GOOGLE_PAY_MERCHANT_ID="${merchantId}"`;
    secretCmd += ` --project-ref ${projectRef}`;
    execSync(secretCmd, {
      stdio: "inherit",
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken },
    });
    results.supabase = true;
  }

  if (issuerId && serviceAccount) {
    const r1 = setGhSecret("GOOGLE_WALLET_ISSUER_ID", issuerId);
    const r2 = setGhSecret("GOOGLE_WALLET_SERVICE_ACCOUNT", JSON.stringify(serviceAccount));
    const r3 = merchantId ? setGhSecret("GOOGLE_PAY_MERCHANT_ID", merchantId) : { ok: true };
    const r4 = apiKey ? setGhSecret("GOOGLE_API_KEY", apiKey) : { ok: true };
    if (r1.ok || r2.ok || r3.ok || r4.ok) results.github = true;
  }

  if (await deployWalletFunction(dryRun)) {
    results.function = true;
  }

  return results;
}

export function triggerPagesPublish(dryRun = false) {
  if (dryRun) return false;
  const ghToken = resolveGhToken();
  if (!ghToken) return false;
  try {
    execSync('gh workflow run "Publicar HTML en GitHub Pages" --repo lasucursaldelcafe-droid/WEb-mas-cafe', {
      env: { ...process.env, GH_TOKEN: ghToken },
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

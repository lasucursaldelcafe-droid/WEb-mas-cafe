/**
 * Deploy compartido: secrets Supabase/GitHub + Edge Function wallet.
 */
import { execSync } from "child_process";
import { projectRefFromUrl } from "./supabase-management-api.mjs";
import { SUPABASE_URL } from "../wallet/supabase-shared.mjs";

const REPO = "lasucursaldelcafe-droid/WEb-mas-cafe";

/** Solo Issuer/Merchant ID (sin cuenta de servicio — botón Wallet sigue desactivado). */
export async function deployGoogleWalletIdsOnly({ issuerId, merchantId, dryRun = false }) {
  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim() || projectRefFromUrl(SUPABASE_URL);
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const ghToken = process.env.GITHUB_TOKEN || process.env.GH_PAGES_PAT;

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

  if (ghToken && issuerId) {
    const ghEnv = { ...process.env, GH_TOKEN: ghToken };
    execSync(`gh secret set GOOGLE_WALLET_ISSUER_ID --repo ${REPO}`, { input: issuerId, env: ghEnv });
    if (merchantId) {
      execSync(`gh secret set GOOGLE_PAY_MERCHANT_ID --repo ${REPO}`, { input: merchantId, env: ghEnv });
    }
    results.github = true;
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
  const ghToken = process.env.GITHUB_TOKEN || process.env.GH_PAGES_PAT;

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

  if (ghToken && issuerId && serviceAccount) {
    const ghEnv = { ...process.env, GH_TOKEN: ghToken };
    execSync(`gh secret set GOOGLE_WALLET_ISSUER_ID --repo ${REPO}`, { input: issuerId, env: ghEnv });
    execSync(`gh secret set GOOGLE_WALLET_SERVICE_ACCOUNT --repo ${REPO}`, {
      input: JSON.stringify(serviceAccount),
      env: ghEnv,
    });
    if (merchantId) {
      execSync(`gh secret set GOOGLE_PAY_MERCHANT_ID --repo ${REPO}`, { input: merchantId, env: ghEnv });
    }
    if (apiKey) {
      execSync(`gh secret set GOOGLE_API_KEY --repo ${REPO}`, { input: apiKey, env: ghEnv });
    }
    results.github = true;
  }

  if (await deployWalletFunction(dryRun)) {
    results.function = true;
  }

  return results;
}

export function triggerPagesPublish(dryRun = false) {
  if (dryRun) return false;
  const ghToken = process.env.GITHUB_TOKEN || process.env.GH_PAGES_PAT;
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

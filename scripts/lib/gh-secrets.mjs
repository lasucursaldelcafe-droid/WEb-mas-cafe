/**
 * Escribe secrets en GitHub sin romper CI si el token no tiene permisos admin.
 */
import { execSync } from "child_process";

const REPO = "lasucursaldelcafe-droid/WEb-mas-cafe";

export function resolveGhToken() {
  return (
    process.env.GH_PAGES_PAT?.trim() ||
    process.env.GH_TOKEN?.trim() ||
    process.env.GITHUB_TOKEN?.trim() ||
    ""
  );
}

export function setGhSecret(name, value, repo = REPO) {
  if (process.env.SKIP_GITHUB_SECRETS === "1") {
    return { ok: false, skipped: true, reason: "SKIP_GITHUB_SECRETS" };
  }

  const ghToken = resolveGhToken();
  if (!ghToken) {
    return { ok: false, skipped: true, reason: "Sin GH_PAGES_PAT ni GITHUB_TOKEN" };
  }

  try {
    execSync(`gh secret set ${name} --repo ${repo}`, {
      input: String(value),
      env: { ...process.env, GH_TOKEN: ghToken },
      stdio: "pipe",
    });
    return { ok: true };
  } catch (err) {
    const msg = err.stderr?.toString() || err.message || "gh secret set falló";
    if (/403|not accessible|Resource not/i.test(msg)) {
      console.warn(`  ⚠ GitHub secret ${name} omitido (token sin permiso admin)`);
      return { ok: false, skipped: true, reason: msg.slice(0, 120) };
    }
    throw err;
  }
}

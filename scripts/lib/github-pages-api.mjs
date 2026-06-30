/**
 * GitHub API — custom domain en GitHub Pages.
 */
import { DOMAIN_DISPLAY, GITHUB_REPO } from "./domain-config.mjs";

const [owner, repo] = GITHUB_REPO.split("/");

function githubToken() {
  const token =
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.GITHUB_PAT;
  if (!token) {
    throw new Error(
      "Falta GITHUB_TOKEN (o GH_TOKEN).\n" +
        "Crear PAT: https://github.com/settings/tokens\n" +
        "Permisos: repo + administration (o Pages write).\n" +
        "Guía: proyecto-mas-cafe/migracion/AUTOMATIZAR-DOMINIO.md"
    );
  }
  return token;
}

async function githubApi(path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${githubToken()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} ${path}: ${JSON.stringify(body)}`);
  }
  return body;
}

export async function getPagesConfig() {
  try {
    return await githubApi(`/repos/${owner}/${repo}/pages`);
  } catch (err) {
    if (String(err).includes("404")) return null;
    throw err;
  }
}

export async function configureGithubPagesDomain({
  cname = DOMAIN_DISPLAY,
  dryRun = false,
} = {}) {
  const existing = dryRun ? null : await getPagesConfig();

  const payload = {
    build_type: existing?.build_type ?? "workflow",
    cname,
  };
  if (existing?.source) {
    payload.source = existing.source;
  }

  if (dryRun) {
    return { action: existing ? "PUT" : "POST", path: `/repos/${owner}/${repo}/pages`, payload };
  }

  if (existing) {
    return githubApi(`/repos/${owner}/${repo}/pages`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  return githubApi(`/repos/${owner}/${repo}/pages`, {
    method: "POST",
    body: JSON.stringify({
      build_type: "workflow",
      cname,
      source: { branch: "main", path: "/" },
    }),
  });
}

/** Quita custom domain hasta que DNS apunte a GitHub (evita 404 en github.io). */
export async function clearGithubPagesCustomDomain({ dryRun = false } = {}) {
  const existing = dryRun ? null : await getPagesConfig();
  if (!existing) return { action: "skip", reason: "no pages config" };

  const payload = {
    build_type: existing.build_type ?? "workflow",
    cname: null,
  };
  if (existing.source) payload.source = existing.source;

  if (dryRun) {
    return { action: "PUT", path: `/repos/${owner}/${repo}/pages`, payload };
  }

  return githubApi(`/repos/${owner}/${repo}/pages`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function testGithubCredentials() {
  await githubApi(`/repos/${owner}/${repo}`);
  return true;
}

/** Health check async — primera llamada puede devolver 202 */
export async function getPagesHealth({ retries = 8, delayMs = 4000 } = {}) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages/health`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${githubToken()}`,
      },
    });
    if (res.status === 200) return res.json();
    if (res.status !== 202) {
      const text = await res.text();
      throw new Error(`GitHub Pages health ${res.status}: ${text}`);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("GitHub Pages health check timeout");
}

const HTTPS_READY_CERT_STATES = new Set([
  "issued",
  "approved",
  "uploaded",
  "authorized",
]);

export function isCertificateReady(pagesConfig) {
  const state = pagesConfig?.https_certificate?.state;
  return state ? HTTPS_READY_CERT_STATES.has(state) : false;
}

/** Activa Enforce HTTPS cuando GitHub lo permite */
export async function enableGithubPagesHttps({ dryRun = false } = {}) {
  const existing = dryRun ? null : await getPagesConfig();
  if (!existing) throw new Error("GitHub Pages no configurado");

  const payload = {
    build_type: existing.build_type ?? "workflow",
    cname: existing.cname,
    https_enforced: true,
  };
  if (existing.source) payload.source = existing.source;

  if (dryRun) return { action: "PUT", payload };

  return githubApi(`/repos/${owner}/${repo}/pages`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

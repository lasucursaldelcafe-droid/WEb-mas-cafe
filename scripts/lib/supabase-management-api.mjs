/**
 * Supabase Management API — configuración Auth y redirects (plan gratuito).
 */
import { DOMAIN_PUNYCODE, GITHUB_PAGES_HOST } from "./domain-config.mjs";

const API = "https://api.supabase.com/v1";

export function projectRefFromUrl(url) {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    const ref = host.split(".")[0];
    return ref && ref !== "supabase" ? ref : null;
  } catch {
    return null;
  }
}

export function walletRedirectUrls() {
  const base = DOMAIN_PUNYCODE;
  const ghWallet = `https://${GITHUB_PAGES_HOST}/WEb-mas-cafe/wallet/`;
  return [
    `https://${base}/wallet/`,
    `https://www.${base}/wallet/`,
    `http://${base}/wallet/`,
    `http://www.${base}/wallet/`,
    ghWallet,
    `https://${GITHUB_PAGES_HOST}/WEb-mas-cafe/caja/`,
    "http://localhost:8080/wallet/",
    "http://127.0.0.1:8080/wallet/",
  ];
}

async function mgmtFetch(token, path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json, text };
}

export async function configureSupabaseAuth(accessToken, projectRef) {
  const siteUrl = `https://${DOMAIN_PUNYCODE}/wallet/`;
  const allowList = walletRedirectUrls().join(",");

  const patch = await mgmtFetch(accessToken, `/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    body: {
      site_url: siteUrl,
      uri_allow_list: allowList,
      disable_signup: false,
      external_email_enabled: true,
      mailer_autoconfirm: true,
    },
  });

  return {
    ok: patch.ok,
    status: patch.status,
    siteUrl,
    allowList,
    error: patch.ok ? null : patch.json?.message || patch.text,
  };
}

export async function getProjectStatus(accessToken, projectRef) {
  return mgmtFetch(accessToken, `/projects/${projectRef}`);
}

export async function listOrganizations(accessToken) {
  return mgmtFetch(accessToken, "/organizations");
}

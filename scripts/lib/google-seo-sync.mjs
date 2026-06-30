/**
 * Sincroniza verificación Google desde DNS GoDaddy → settings.json
 * y notifica sitemap a buscadores.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDnsRecords } from "./godaddy-api.mjs";
import { loadSeoSettings, GITHUB_PAGES_FALLBACK } from "./seo.mjs";
import { DOMAIN_PUNYCODE } from "./domain-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");
const settingsPath = path.join(root, "content/settings.json");

const GOOGLE_TXT_PREFIX = "google-site-verification=";

export function parseGoogleVerificationFromTxt(records) {
  for (const rec of records) {
    if (rec.type !== "TXT" || rec.name !== "@") continue;
    const data = String(rec.data ?? "");
    if (data.startsWith(GOOGLE_TXT_PREFIX)) {
      return data.slice(GOOGLE_TXT_PREFIX.length);
    }
    if (data.includes(GOOGLE_TXT_PREFIX)) {
      const m = data.match(/google-site-verification=([^\s;]+)/);
      if (m) return m[1];
    }
  }
  return "";
}

export async function fetchGoogleVerificationFromDns(domain = DOMAIN_PUNYCODE) {
  const records = await getDnsRecords(domain);
  return parseGoogleVerificationFromTxt(records);
}

export function loadSettingsFile() {
  if (!existsSync(settingsPath)) return {};
  return JSON.parse(readFileSync(settingsPath, "utf8"));
}

export function saveSettingsFile(settings) {
  writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

/** Actualiza settings.json si el TXT de Google en DNS difiere */
export async function syncGoogleVerificationToSettings({ dryRun = false } = {}) {
  const code = await fetchGoogleVerificationFromDns();
  const settings = loadSettingsFile();
  settings.seo = settings.seo ?? {};
  const prev = settings.seo.googleSiteVerification || "";
  const changed = Boolean(code && code !== prev);

  if (code) {
    settings.seo.googleSiteVerification = code;
    settings.seo.googleSearchConsoleVerifiedAt =
      settings.seo.googleSearchConsoleVerifiedAt || new Date().toISOString();
    settings.seo.googleVerificationMethod = "dns";
  }

  if (changed && !dryRun) {
    saveSettingsFile(settings);
  }

  return { code, prev, changed, verified: Boolean(code) };
}

export async function pingSitemap(siteUrl) {
  const sitemapUrl = `${siteUrl.replace(/\/$/, "")}/sitemap.xml`;
  const encoded = encodeURIComponent(sitemapUrl);
  const results = [];

  const endpoints = [
    { name: "Google", url: `https://www.google.com/ping?sitemap=${encoded}` },
    { name: "Bing", url: `https://www.bing.com/ping?sitemap=${encoded}` },
  ];

  for (const { name, url } of endpoints) {
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      results.push({ name, status: res.status, ok: res.ok, sitemapUrl });
    } catch (err) {
      results.push({
        name,
        status: 0,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        sitemapUrl,
      });
    }
  }

  return results;
}

export async function runGoogleSeoSync({ dryRun = false, ping = true } = {}) {
  const seo = loadSeoSettings();
  const siteUrl = seo.siteUrl || GITHUB_PAGES_FALLBACK.replace(/\/$/, "");

  const sync = await syncGoogleVerificationToSettings({ dryRun });
  let pings = [];
  if (ping && !dryRun) {
    pings = await pingSitemap(siteUrl);
  }

  return { sync, pings, siteUrl };
}

/**
 * GoDaddy DNS API — configurar registros para GitHub Pages.
 * Docs: https://developer.godaddy.com/doc/endpoint/domains/
 */
import {
  DOMAIN_PUNYCODE,
  GITHUB_PAGES_A_RECORDS,
  GITHUB_PAGES_CNAME,
  GITHUB_PAGES_HOST,
  godaddyApiBase,
} from "./domain-config.mjs";

function authHeaders() {
  const key = process.env.GODADDY_API_KEY;
  const secret = process.env.GODADDY_API_SECRET;
  if (!key || !secret) {
    throw new Error(
      "Faltan GODADDY_API_KEY y GODADDY_API_SECRET.\n" +
        "Crear en: https://developer.godaddy.com/keys\n" +
        "Guía: proyecto-mas-cafe/migracion/AUTOMATIZAR-DOMINIO.md"
    );
  }
  return {
    Authorization: `sso-key ${key}:${secret}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function api(path, options = {}) {
  const url = `${godaddyApiBase()}/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = typeof body === "object" ? JSON.stringify(body) : body;
    throw new Error(`GoDaddy API ${res.status} ${path}: ${msg}`);
  }
  return body;
}

export async function getDnsRecords(domain = DOMAIN_PUNYCODE) {
  return api(`/domains/${domain}/records`);
}

export async function putApexARecords(domain = DOMAIN_PUNYCODE, { dryRun = false } = {}) {
  const records = GITHUB_PAGES_A_RECORDS.map((ip) => ({
    data: ip,
    ttl: 600,
  }));

  if (dryRun) {
    return { action: "PUT", path: `/domains/${domain}/records/A/@`, records };
  }

  await api(`/domains/${domain}/records/A/@`, {
    method: "PUT",
    body: JSON.stringify(records),
  });
  return { updated: records.length, type: "A", name: "@" };
}

export async function putWwwCname(domain = DOMAIN_PUNYCODE, { dryRun = false } = {}) {
  const records = [
    {
      data: GITHUB_PAGES_CNAME,
      ttl: 600,
    },
  ];

  if (dryRun) {
    return { action: "PUT", path: `/domains/${domain}/records/CNAME/www`, records };
  }

  await api(`/domains/${domain}/records/CNAME/www`, {
    method: "PUT",
    body: JSON.stringify(records),
  });
  return { updated: 1, type: "CNAME", name: "www", target: GITHUB_PAGES_HOST };
}

export async function configureGodaddyForGitHubPages({ dryRun = false } = {}) {
  const apex = await putApexARecords(DOMAIN_PUNYCODE, { dryRun });
  const www = await putWwwCname(DOMAIN_PUNYCODE, { dryRun });
  return { apex, www, domain: DOMAIN_PUNYCODE };
}

export async function testGodaddyCredentials() {
  await api(`/domains/${DOMAIN_PUNYCODE}`);
  return true;
}

/** Reemplaza todos los registros MX del apex (@). */
export async function putMxRecords(records, domain = DOMAIN_PUNYCODE, { dryRun = false } = {}) {
  const payload = records.map((r) => ({
    data: r.data,
    priority: r.priority,
    ttl: r.ttl ?? 600,
  }));

  if (dryRun) {
    return { action: "PUT", path: `/domains/${domain}/records/MX/@`, records: payload };
  }

  await api(`/domains/${domain}/records/MX/@`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return { updated: payload.length, type: "MX", name: "@" };
}

/** Reemplaza registros TXT de un nombre (ej. @, _dmarc, zmail._domainkey). */
export async function putTxtRecords(name, values, domain = DOMAIN_PUNYCODE, { dryRun = false } = {}) {
  const payload = values.map((data) => ({
    data,
    ttl: 600,
  }));

  if (dryRun) {
    return { action: "PUT", path: `/domains/${domain}/records/TXT/${name}`, records: payload };
  }

  await api(`/domains/${domain}/records/TXT/${encodeURIComponent(name)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return { updated: payload.length, type: "TXT", name };
}

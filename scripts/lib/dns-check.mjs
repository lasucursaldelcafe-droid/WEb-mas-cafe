/**
 * Comprobación DNS para mascafé.com → GitHub Pages.
 * Usa resolvers públicos para evitar falsos positivos por caché local
 * o resolvers internos de CI que propagan antes que 8.8.8.8 / 1.1.1.1.
 */
import { execSync } from "child_process";
import {
  DOMAIN_PUNYCODE,
  GITHUB_PAGES_A_RECORDS,
  GITHUB_PAGES_HOST,
} from "./domain-config.mjs";

/** Resolvers públicos — consenso requerido en todos */
const PUBLIC_RESOLVERS = ["8.8.8.8", "1.1.1.1", "9.9.9.9"];

function digAt(resolver, query) {
  try {
    return execSync(`dig +short @${resolver} ${query}`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function dig(query) {
  try {
    return execSync(`dig +short ${query}`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function apexIpsOk(results) {
  return GITHUB_PAGES_A_RECORDS.every((ip) => results.includes(ip));
}

function checkApexFromResolver(resolver) {
  const results = digAt(resolver, `${DOMAIN_PUNYCODE} A`);
  const ok = apexIpsOk(results);
  return { results, ok };
}

function checkWwwFromResolver(resolver) {
  const cnameResults = digAt(resolver, `www.${DOMAIN_PUNYCODE} CNAME`);
  const normalized = cnameResults.map((r) => r.replace(/\.$/, ""));

  const directGithub = normalized.some(
    (r) => r === GITHUB_PAGES_HOST || r.endsWith(GITHUB_PAGES_HOST),
  );
  if (directGithub) return { results: cnameResults, ok: true };

  // GoDaddy a veces aplana www → apex (CNAME al dominio raíz)
  const pointsToApex = normalized.some(
    (r) => r === DOMAIN_PUNYCODE || r.endsWith(DOMAIN_PUNYCODE),
  );
  if (pointsToApex && checkApexFromResolver(resolver).ok) {
    return { results: cnameResults, ok: true };
  }

  // CNAME flattening: www resuelve como A a las IPs de GitHub
  const aResults = digAt(resolver, `www.${DOMAIN_PUNYCODE} A`);
  if (aResults.length > 0 && apexIpsOk(aResults)) {
    return { results: aResults, ok: true };
  }

  return { results: cnameResults.length ? cnameResults : aResults, ok: false };
}

export function checkApexDns() {
  const results = dig(`${DOMAIN_PUNYCODE} A`);
  const ok = apexIpsOk(results);
  return { results, ok, expected: GITHUB_PAGES_A_RECORDS };
}

export function checkWwwDns() {
  const cnameResults = dig(`www.${DOMAIN_PUNYCODE} CNAME`);
  const normalized = cnameResults.map((r) => r.replace(/\.$/, ""));

  let ok = normalized.some(
    (r) => r === GITHUB_PAGES_HOST || r.endsWith(GITHUB_PAGES_HOST),
  );

  if (!ok) {
    const pointsToApex = normalized.some(
      (r) => r === DOMAIN_PUNYCODE || r.endsWith(DOMAIN_PUNYCODE),
    );
    if (pointsToApex && checkApexDns().ok) ok = true;
  }

  if (!ok) {
    const aResults = dig(`www.${DOMAIN_PUNYCODE} A`);
    if (aResults.length > 0 && apexIpsOk(aResults)) ok = true;
  }

  return {
    results: cnameResults.length ? cnameResults : dig(`www.${DOMAIN_PUNYCODE} A`),
    ok,
    expected: GITHUB_PAGES_HOST,
  };
}

/** Consenso en resolvers públicos — evita activar custom domain demasiado pronto */
export function isDnsReadyForGitHubPages() {
  for (const resolver of PUBLIC_RESOLVERS) {
    const apex = checkApexFromResolver(resolver);
    const www = checkWwwFromResolver(resolver);
    if (!apex.ok || !www.ok) return false;
  }
  return true;
}

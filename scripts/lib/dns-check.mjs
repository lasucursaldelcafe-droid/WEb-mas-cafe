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

function checkApexFromResolver(resolver) {
  const results = digAt(resolver, `${DOMAIN_PUNYCODE} A`);
  const ok = GITHUB_PAGES_A_RECORDS.every((ip) => results.includes(ip));
  return { results, ok };
}

function checkWwwFromResolver(resolver) {
  const results = digAt(resolver, `www.${DOMAIN_PUNYCODE} CNAME`);
  const normalized = results.map((r) => r.replace(/\.$/, ""));
  const ok = normalized.some(
    (r) => r === GITHUB_PAGES_HOST || r.endsWith(GITHUB_PAGES_HOST),
  );
  return { results, ok };
}

export function checkApexDns() {
  const results = dig(`${DOMAIN_PUNYCODE} A`);
  const ok = GITHUB_PAGES_A_RECORDS.every((ip) => results.includes(ip));
  return { results, ok, expected: GITHUB_PAGES_A_RECORDS };
}

export function checkWwwDns() {
  const results = dig(`www.${DOMAIN_PUNYCODE} CNAME`);
  const normalized = results.map((r) => r.replace(/\.$/, ""));
  const ok = normalized.some(
    (r) => r === GITHUB_PAGES_HOST || r.endsWith(GITHUB_PAGES_HOST),
  );
  return { results, ok, expected: GITHUB_PAGES_HOST };
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

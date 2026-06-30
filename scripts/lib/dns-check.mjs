/**
 * Comprobación DNS para mascafé.com → GitHub Pages.
 */
import { execSync } from "child_process";
import {
  DOMAIN_PUNYCODE,
  GITHUB_PAGES_A_RECORDS,
  GITHUB_PAGES_HOST,
} from "./domain-config.mjs";

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

export function isDnsReadyForGitHubPages() {
  const apex = checkApexDns();
  const www = checkWwwDns();
  return apex.ok && www.ok;
}

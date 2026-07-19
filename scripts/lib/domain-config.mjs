/**
 * Configuración central del dominio Más Café.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

export const DOMAIN_DISPLAY = "mascafé.com";
export const DOMAIN_WWW = "www.mascafé.com";
export const DOMAIN_PUNYCODE = "xn--mascaf-gva.com";
export const DOMAIN_WWW_PUNYCODE = `www.${DOMAIN_PUNYCODE}`;
export const DOMAIN_URL = `https://${DOMAIN_WWW}`;

export const GITHUB_PAGES_HOST = "lasucursaldelcafe-droid.github.io";
export const GITHUB_REPO = "lasucursaldelcafe-droid/WEb-mas-cafe";
export const GITHUB_PAGES_CNAME = `${GITHUB_PAGES_HOST}.`;

/** IPs oficiales GitHub Pages (documentación GitHub) */
export const GITHUB_PAGES_A_RECORDS = [
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153",
];

export const GODADDY_DNS_PANEL = `https://dcc.godaddy.com/control/dnsmanagement?domainName=${DOMAIN_PUNYCODE}`;
export const GITHUB_PAGES_SETTINGS = `https://github.com/${GITHUB_REPO}/settings/pages`;

export function loadSettings() {
  const settingsPath = path.join(root, "content/settings.json");
  if (!existsSync(settingsPath)) return {};
  return JSON.parse(readFileSync(settingsPath, "utf8"));
}

export function godaddyApiBase() {
  return process.env.GODADDY_API_ENV === "ote"
    ? "https://api.ote-godaddy.com"
    : "https://api.godaddy.com";
}

export function parseArgs(argv = process.argv.slice(2)) {
  const maxWaitArg = argv.find((a) => a.startsWith("--max-wait="));
  const maxWaitMin = maxWaitArg ? Number(maxWaitArg.split("=")[1]) : 0;
  return {
    dryRun: argv.includes("--dry-run"),
    skipGodaddy: argv.includes("--skip-godaddy"),
    skipGithub: argv.includes("--skip-github"),
    verifyOnly: argv.includes("--verify-only"),
    wait: argv.includes("--wait"),
    noWait: argv.includes("--no-wait"),
    kickstart: argv.includes("--kickstart"),
    aggressiveKickstart: argv.includes("--aggressive-kickstart"),
    tryWww: argv.includes("--try-www"),
    nuclear: argv.includes("--nuclear"),
    maxWaitMin: Number.isFinite(maxWaitMin) && maxWaitMin > 0 ? maxWaitMin : 0,
  };
}

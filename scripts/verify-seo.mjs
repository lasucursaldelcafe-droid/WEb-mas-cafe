#!/usr/bin/env node
/**
 * Verifica meta SEO del build (títulos, OG, JSON-LD, sitemap, favicon).
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { domainToASCII } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, "../gh-pages-site");

const PUBLIC_PAGES = [
  "index.html",
  "cafe/index.html",
  "menu/index.html",
  "nosotros/index.html",
  "tienda/index.html",
  "blog/index.html",
  "contacto/index.html",
];

function fail(msg) {
  console.error(`  ❌ ${msg}`);
  return false;
}

function ok(msg) {
  console.log(`  ✅ ${msg}`);
  return true;
}

let passed = true;

console.log("\n▸ Verificación SEO — Más Café\n");

if (!existsSync(siteDir)) {
  console.error("Ejecuta primero: npm run build:github-pages");
  process.exit(1);
}

for (const rel of ["sitemap.xml", "robots.txt", "favicon.ico", "site.webmanifest"]) {
  if (!existsSync(path.join(siteDir, rel))) passed = fail(`Falta ${rel}`) && passed;
  else ok(rel);
}

const robots = readFileSync(path.join(siteDir, "robots.txt"), "utf8");
if (!robots.includes("Sitemap:")) passed = fail("robots.txt sin Sitemap") && passed;
if (!robots.includes("Disallow: /admin/")) passed = fail("robots.txt sin Disallow admin") && passed;

const sitemap = readFileSync(path.join(siteDir, "sitemap.xml"), "utf8");
if (!sitemap.includes("<loc>")) passed = fail("sitemap.xml vacío") && passed;
else ok("sitemap con URLs públicas");

const settingsRaw = readFileSync(path.join(__dirname, "../content/settings.json"), "utf8");
const httpsReady = settingsRaw.includes('"httpsReady": true');
const locMatches = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locMatches.length === 0) {
  passed = fail("sitemap sin entradas <loc>") && passed;
} else {
  for (const loc of locMatches) {
    let parsed;
    try {
      parsed = new URL(loc);
    } catch {
      passed = fail(`sitemap URL inválida: ${loc}`) && passed;
      continue;
    }
    if (parsed.hostname !== domainToASCII(parsed.hostname)) {
      passed = fail(`sitemap debe usar punycode: ${parsed.hostname}`) && passed;
    }
    if (parsed.protocol === "https:" && !httpsReady) {
      passed = fail("sitemap HTTPS pero el sitio aún no tiene SSL activo") && passed;
    }
    if (parsed.hostname.startsWith("www.")) {
      passed = fail(`sitemap con www (${loc}) — usar apex sin www`) && passed;
    }
  }
  if (passed) ok(`${locMatches.length} URLs sitemap (protocolo y host correctos)`);
}

for (const page of PUBLIC_PAGES) {
  const full = path.join(siteDir, page);
  if (!existsSync(full)) {
    passed = fail(`Falta ${page}`) && passed;
    continue;
  }
  const html = readFileSync(full, "utf8");
  const label = page.replace("/index.html", "") || "inicio";

  if (!/<title>Más Café/.test(html)) {
    passed = fail(`${label}: título sin «Más Café»`) && passed;
  }
  if (!html.includes('rel="canonical"')) {
    passed = fail(`${label}: sin canonical`) && passed;
  }
  if (!html.includes('property="og:title"')) {
    passed = fail(`${label}: sin og:title`) && passed;
  }
  if (!html.includes('property="og:image"')) {
    passed = fail(`${label}: sin og:image`) && passed;
  }
  if (!html.includes("application/ld+json")) {
    passed = fail(`${label}: sin JSON-LD`) && passed;
  }
  if (!html.includes("favicon.ico")) {
    passed = fail(`${label}: sin favicon`) && passed;
  }
  if (html.includes('content="noindex')) {
    passed = fail(`${label}: noindex en página pública`) && passed;
  }
}

if (passed) {
  console.log("\n✅ SEO básico verificado en todas las páginas públicas.\n");
  process.exit(0);
}
console.log("\n❌ Hay problemas SEO. Revisa el build.\n");
process.exit(1);

#!/usr/bin/env node
/**
 * Verifica rutas internas del build gh-pages-site (HTML + assets).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const siteDir = path.join(root, "gh-pages-site");

const REQUIRED_ROUTES = [
  "index.html",
  "cafe/index.html",
  "menu/index.html",
  "nosotros/index.html",
  "tienda/index.html",
  "blog/index.html",
  "contacto/index.html",
  "admin/index.html",
  "wallet/index.html",
  "wallet/wallet-app.js",
  "caja/index.html",
  "informe/index.html",
  "informe/wallet/index.html",
];

function walkHtml(dir, base = "") {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.posix.join(base, name);
    if (statSync(full).isDirectory()) {
      files.push(...walkHtml(full, rel));
    } else if (name.endsWith(".html")) {
      files.push(rel);
    }
  }
  return files;
}

function resolveRef(fromFile, ref) {
  if (!ref || ref.startsWith("#") || ref.startsWith("mailto:") || ref.startsWith("tel:") || ref.startsWith("javascript:")) {
    return null;
  }
  if (ref.startsWith("http://") || ref.startsWith("https://")) return null;
  const clean = ref.split("?")[0].split("#")[0];
  if (!clean) return null;
  const fromDir = path.posix.dirname(fromFile);
  const resolved = path.posix.normalize(path.posix.join(fromDir, clean));
  return resolved;
}

function targetExists(resolved) {
  const full = path.join(siteDir, resolved);
  if (existsSync(full) && statSync(full).isFile()) return true;
  if (existsSync(path.join(full, "index.html"))) return true;
  return false;
}

function extractRefs(html) {
  const refs = [];
  const attrRe = /\b(?:href|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = attrRe.exec(html))) refs.push(m[1]);
  return refs;
}

function main() {
  if (!existsSync(siteDir)) {
    console.error("\n❌ Falta gh-pages-site/. Ejecuta: npm run build:github-pages\n");
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  for (const route of REQUIRED_ROUTES) {
    if (!existsSync(path.join(siteDir, route))) {
      errors.push(`Ruta obligatoria ausente: ${route}`);
    }
  }

  for (const htmlFile of walkHtml(siteDir)) {
    const content = readFileSync(path.join(siteDir, htmlFile), "utf8");
    for (const ref of extractRefs(content)) {
      if (ref.includes("${") || ref.includes("}")) continue;
      const resolved = resolveRef(htmlFile, ref);
      if (!resolved) continue;
      if (!targetExists(resolved)) {
        errors.push(`${htmlFile} → ${ref} (no existe: ${resolved})`);
      }
    }
  }

  const walletHtml = readFileSync(path.join(siteDir, "informe/wallet/index.html"), "utf8");
  for (const must of ["../../images/brand/favs.png", "../../images/brand/horizontal-crema.png"]) {
    if (!walletHtml.includes(must)) {
      warnings.push(`Wallet: falta referencia esperada ${must}`);
    }
  }

  console.log("\n═══ Verificación de enlaces — gh-pages-site ═══\n");
  if (warnings.length) warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  if (errors.length) {
    errors.forEach((e) => console.log(`  ✗ ${e}`));
    console.log(`\n❌ ${errors.length} problema(s)\n`);
    process.exit(1);
  }
  console.log(`  ✅ ${REQUIRED_ROUTES.length} rutas obligatorias`);
  console.log(`  ✅ Enlaces internos en ${walkHtml(siteDir).length} HTML verificados\n`);
}

main();

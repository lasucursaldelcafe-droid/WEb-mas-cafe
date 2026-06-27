#!/usr/bin/env node
/**
 * Sitio HTML multipágina para GitHub Pages (HTML + imágenes locales).
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { collectImagePaths, generateSitePages } from "./lib/generate-site-pages.mjs";
import { generateAdminPage } from "./lib/site-html/admin.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "gh-pages-site");

console.log("\n▸ Generando sitio multipágina para GitHub Pages...\n");

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

const pages = generateSitePages();
for (const { path: relPath, html } of pages) {
  const dest = path.join(outDir, relPath);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, html, "utf8");
  console.log(`  • ${relPath}`);
}

const adminHtml = generateAdminPage();
const adminDest = path.join(outDir, "admin/index.html");
mkdirSync(path.dirname(adminDest), { recursive: true });
writeFileSync(adminDest, adminHtml, "utf8");
console.log("  • admin/index.html");

writeFileSync(
  path.join(outDir, "404.html"),
  `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=./"/><title>Más Café</title></head><body><p><a href="./">Ir al inicio</a></p></body></html>`,
  "utf8"
);

writeFileSync(path.join(outDir, ".nojekyll"), "");

let copied = 0;
for (const assetPath of collectImagePaths()) {
  const rel = assetPath.replace(/^\//, "");
  const src = path.join(root, "public", rel);
  const dest = path.join(outDir, rel);
  if (!existsSync(src)) {
    console.warn(`  ⚠ imagen no encontrada: ${rel}`);
    continue;
  }
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest);
  copied++;
}

console.log(`\n✅ ${pages.length + 1} páginas · ${copied} imágenes\n`);
console.log("Local:    npm run preview");
console.log("Público:  https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/\n");

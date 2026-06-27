#!/usr/bin/env node
/**
 * Sitio HTML autocontenido para GitHub Pages (HTML + imágenes locales).
 * No usa jsDelivr ni CDN externo — funciona con repo privado.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generatePublicHtml } from "./lib/generate-public-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "gh-pages-site");

const site = JSON.parse(readFileSync(path.join(root, "content/site.json"), "utf8"));

function collectImagePaths() {
  const paths = new Set([
    "/images/brand/horizontal-crema.png",
    "/images/grafica/3.png",
  ]);
  for (const exp of site.experiences) paths.add(exp.image);
  for (const p of site.products) paths.add(p.image);
  for (const b of site.blog ?? []) paths.add(b.image);
  return [...paths];
}

/** Rutas relativas para GitHub Pages (/WEb-mas-cafe/) */
const img = (assetPath) => assetPath.replace(/^\//, "");

console.log("\n▸ Generando sitio para GitHub Pages (HTML + imágenes)...\n");

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

writeFileSync(path.join(outDir, "index.html"), generatePublicHtml(img), "utf8");

writeFileSync(
  path.join(outDir, "404.html"),
  `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=./"/><title>Más Café</title></head><body><p><a href="./">Ir al inicio</a></p></body></html>`,
  "utf8"
);

writeFileSync(path.join(outDir, ".nojekyll"), "");

const used = collectImagePaths();
let copied = 0;

for (const assetPath of used) {
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

console.log(`✅ gh-pages-site/ listo (${copied} imágenes)\n`);
console.log("URL pública (tras activar GitHub Pages):");
console.log("  https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/\n");

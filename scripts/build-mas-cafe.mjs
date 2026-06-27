#!/usr/bin/env node
/**
 * Prepara mas-cafe/ para Firebase (HTML + solo imágenes usadas).
 * Carpeta liviana para publicar en la-sucursal-del-cafe.web.app/mas-cafe
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generatePublicHtml } from "./lib/generate-public-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "mas-cafe");
const imagesSrc = path.join(root, "public", "images");

const site = JSON.parse(readFileSync(path.join(root, "content/site.json"), "utf8"));

/** Rutas /images/... referenciadas en site.json y en el HTML fijo. */
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

const prefix = process.env.MAS_CAFE_PREFIX ?? "";
const img = (assetPath) => `${prefix}${assetPath}`;

console.log("\n▸ Generando Más Café para Firebase (La Sucursal)...\n");

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

writeFileSync(path.join(outDir, "index.html"), generatePublicHtml(img), "utf8");

writeFileSync(
  path.join(outDir, "404.html"),
  `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=/mas-cafe/"/><title>Más Café</title></head><body><p><a href="/mas-cafe/">Ir al inicio</a></p></body></html>`,
  "utf8"
);

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

console.log(`✅ mas-cafe/ listo (${copied} imágenes)\n`);
console.log("URL pública tras deploy:");
console.log("  https://mas-cafe.web.app/");
console.log("  (mismo Firebase que La Sucursal: la-sucursal-del-cafe)\n");

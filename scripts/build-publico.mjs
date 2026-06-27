#!/usr/bin/env node
/**
 * Genera publico/ — misma salida que GitHub Pages (HTML + imágenes locales).
 * Útil para commit manual o vista previa sin servidor.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generatePublicHtml } from "./lib/generate-public-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "publico");

const site = JSON.parse(readFileSync(path.join(root, "content/site.json"), "utf8"));

function collectImagePaths() {
  const paths = new Set(["/images/brand/horizontal-crema.png", "/images/grafica/3.png"]);
  for (const exp of site.experiences) paths.add(exp.image);
  for (const p of site.products) paths.add(p.image);
  for (const b of site.blog ?? []) paths.add(b.image);
  return [...paths];
}

const img = (assetPath) => assetPath.replace(/^\//, "");

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

writeFileSync(path.join(outDir, "index.html"), generatePublicHtml(img), "utf8");

for (const assetPath of collectImagePaths()) {
  const rel = assetPath.replace(/^\//, "");
  const src = path.join(root, "public", rel);
  const dest = path.join(outDir, rel);
  if (!existsSync(src)) continue;
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest);
}

console.log("\n✅ publico/ listo (HTML + imágenes)\n");

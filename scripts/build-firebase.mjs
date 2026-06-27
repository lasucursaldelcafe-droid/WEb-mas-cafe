#!/usr/bin/env node
/**
 * Prepara firebase-public/ para Firebase Hosting (HTML + imágenes locales).
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generatePublicHtml } from "./lib/generate-public-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "firebase-public");
const imagesSrc = path.join(root, "public", "images");

const img = (assetPath) => assetPath;

console.log("\n▸ Generando sitio para Firebase Hosting...\n");

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

writeFileSync(path.join(outDir, "index.html"), generatePublicHtml(img), "utf8");

if (!existsSync(imagesSrc)) {
  console.error("❌ No se encontró public/images/");
  process.exit(1);
}

console.log("▸ Copiando imágenes (puede tardar un momento)...");
cpSync(imagesSrc, path.join(outDir, "images"), { recursive: true });

writeFileSync(
  path.join(outDir, "404.html"),
  `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=/"/><title>Más Café</title></head><body><p><a href="/">Ir al inicio</a></p></body></html>`,
  "utf8"
);

console.log("\n✅ Listo: firebase-public/\n");
console.log("Despliega con: npm run deploy:firebase\n");

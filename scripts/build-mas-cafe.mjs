#!/usr/bin/env node
/**
 * Prepara mas-cafe/ para Firebase Hosting (HTML + imágenes + config).
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generatePublicHtml } from "./lib/generate-public-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "mas-cafe");

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA0oWtlIDDgbYT_VUpRmIQ_g1KNXtOa0JU",
  authDomain: "mas-cafe-c8413.firebaseapp.com",
  projectId: "mas-cafe-c8413",
  storageBucket: "mas-cafe-c8413.firebasestorage.app",
  messagingSenderId: "431985221060",
  appId: "1:431985221060:web:ca46cb9027955bac091891",
};

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

const img = (assetPath) => assetPath;

console.log("\n▸ Generando Más Café para Firebase (mas-cafe-c8413)...\n");

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });
mkdirSync(path.join(outDir, "js"), { recursive: true });

writeFileSync(path.join(outDir, "index.html"), generatePublicHtml(img), "utf8");

writeFileSync(
  path.join(outDir, "404.html"),
  `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=/"/><title>Más Café</title></head><body><p><a href="/">Ir al inicio</a></p></body></html>`,
  "utf8"
);

writeFileSync(
  path.join(outDir, "js/firebase-config.js"),
  `window.FIREBASE_CONFIG = ${JSON.stringify(FIREBASE_CONFIG, null, 2)};\n`,
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
console.log("URLs públicas tras deploy:");
console.log("  https://mas-cafe-c8413.web.app/");
console.log("  https://mas-cafe-c8413.firebaseapp.com/\n");

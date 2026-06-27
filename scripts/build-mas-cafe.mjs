#!/usr/bin/env node
/**
 * Prepara mas-cafe/ para Firebase Hosting (sitio multipágina + imágenes).
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { collectImagePaths, generateSitePages } from "./lib/generate-site-pages.mjs";

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

console.log("\n▸ Generando Más Café multipágina para Firebase...\n");

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });
mkdirSync(path.join(outDir, "js"), { recursive: true });

for (const { path: relPath, html } of generateSitePages()) {
  const dest = path.join(outDir, relPath);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, html, "utf8");
}

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

let copied = 0;
for (const assetPath of collectImagePaths()) {
  const rel = assetPath.replace(/^\//, "");
  const src = path.join(root, "public", rel);
  const dest = path.join(outDir, rel);
  if (!existsSync(src)) continue;
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest);
  copied++;
}

console.log(`✅ mas-cafe/ listo (7 páginas, ${copied} imágenes)\n`);

#!/usr/bin/env node
/** Genera publico/ — mismo sitio multipágina que GitHub Pages */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { collectImagePaths, generateSitePages } from "./lib/generate-site-pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "publico");

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const { path: relPath, html } of generateSitePages()) {
  const dest = path.join(outDir, relPath);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, html, "utf8");
}

for (const assetPath of collectImagePaths()) {
  const rel = assetPath.replace(/^\//, "");
  const src = path.join(root, "public", rel);
  const dest = path.join(outDir, rel);
  if (!existsSync(src)) continue;
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest);
}

console.log("\n✅ publico/ listo (sitio multipágina)\n");

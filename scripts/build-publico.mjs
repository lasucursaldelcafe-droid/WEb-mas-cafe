#!/usr/bin/env node
/**
 * Genera publico/index.html — HTML para GitHub (CDN jsDelivr).
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generatePublicHtml } from "./lib/generate-public-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const repo = "lasucursaldelcafe-droid/WEb-mas-cafe";
const branch = "main";
const cdnBase = `https://cdn.jsdelivr.net/gh/${repo}/${branch}/public`;

const img = (assetPath) => `${cdnBase}${assetPath}`;

const outDir = path.join(root, "publico");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "index.html"), generatePublicHtml(img), "utf8");

console.log("\n✅ HTML público generado: publico/index.html\n");

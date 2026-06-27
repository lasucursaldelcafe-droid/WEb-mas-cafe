#!/usr/bin/env node
/**
 * Genera todos los archivos HTML del sitio en la carpeta out/
 * Uso: npm run build:html
 */
import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "out");
const repo = "WEb-mas-cafe";
const basePath = `/${repo}`;

function findFiles(dir, ext, base = "") {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.join(base, entry);
    if (statSync(full).isDirectory()) {
      files.push(...findFiles(full, ext, rel));
    } else if (entry.endsWith(ext)) {
      files.push(rel);
    }
  }
  return files;
}

/** Ajusta rutas /fonts/ en CSS para GitHub Pages (basePath). */
function fixFontPathsInCss() {
  const cssFiles = findFiles(path.join(outDir, "_next"), ".css");
  for (const file of cssFiles) {
    const full = path.join(outDir, "_next", file);
    const css = readFileSync(full, "utf8");
    const fixed = css.replace(/url\(\/fonts\//g, `url(${basePath}/fonts/`);
    if (fixed !== css) writeFileSync(full, fixed);
  }
}

console.log("\n▸ Generando HTML estático para GitHub Pages...\n");

execSync("npm run build", {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, GITHUB_PAGES: "true" },
});

if (!existsSync(path.join(outDir, "index.html"))) {
  console.error("\n❌ Error: no se generó out/index.html\n");
  process.exit(1);
}

fixFontPathsInCss();

const htmlFiles = findFiles(outDir, ".html").sort();

console.log("\n✅ HTML generado en out/\n");
console.log("Páginas creadas:");
for (const file of htmlFiles) {
  console.log(`  • ${file}`);
}

console.log(`
URL permanente (GitHub Pages):
  https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/

Para publicar: push a main (automático) o sube la carpeta out/ a la rama gh-pages
`);

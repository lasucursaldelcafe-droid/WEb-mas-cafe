#!/usr/bin/env node
/**
 * Verifica que el proyecto esté listo para GitHub Pages.
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const errors = [];
const warnings = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

const required = [
  "package.json",
  "content/site.json",
  "public/images/brand/horizontal-azul.png",
  "scripts/build-github-pages.mjs",
  "scripts/lib/generate-constitution-report.mjs",
  "scripts/lib/generate-wallet-visual.mjs",
  "scripts/serve-local.mjs",
  ".github/workflows/deploy-github-pages.yml",
];

for (const file of required) {
  check(existsSync(path.join(root, file)), `Falta: ${file}`);
}

check(
  existsSync(path.join(root, "next.config.ts")),
  "Falta next.config.ts (prototipo Next.js en src/)",
);

try {
  const site = JSON.parse(readFileSync(path.join(root, "content/site.json"), "utf-8"));
  check(site.brand?.name, "site.json: falta brand.name");
  check(Array.isArray(site.products) && site.products.length > 0, "site.json: sin productos");
} catch {
  errors.push("content/site.json no es JSON válido");
}

console.log("\n═══ Health Check — Más Café / GitHub Pages ═══\n");

if (warnings.length) {
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}

if (errors.length) {
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log("\n❌ No listo.\n");
  process.exit(1);
}

const routes = ["/", "/cafe/", "/menu/", "/nosotros/", "/tienda/", "/blog/", "/contacto/", "/informe/", "/informe/wallet/"];
console.log("Rutas que se generarán:");
routes.forEach((r) => console.log(`  • ${r}`));
console.log("\n✅ Listo para GitHub Pages (push a main o npm run build)\n");

#!/usr/bin/env node
/**
 * Verifica que el proyecto esté listo para export estático y GoDaddy.
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
  "next.config.ts",
  "content/site.json",
  "public/images/brand/horizontal-azul.png",
  "scripts/godaddy-prep.mjs",
];

for (const file of required) {
  check(existsSync(path.join(root, file)), `Falta: ${file}`);
}

const nextConfig = readFileSync(path.join(root, "next.config.ts"), "utf-8");
check(
  nextConfig.includes('output: "export"') || nextConfig.includes("output: 'export'"),
  "next.config.ts debe tener output: 'export' (sitio estático)",
);

check(
  !existsSync(path.join(root, "src/middleware.ts")),
  "Elimina src/middleware.ts — no compatible con export estático",
);

check(
  !existsSync(path.join(root, "src/app/api")),
  "Elimina src/app/api — no compatible con hosting estático",
);

try {
  const site = JSON.parse(readFileSync(path.join(root, "content/site.json"), "utf-8"));
  check(site.brand?.name, "site.json: falta brand.name");
  check(Array.isArray(site.products) && site.products.length > 0, "site.json: sin productos");
} catch {
  errors.push("content/site.json no es JSON válido");
}

console.log("\n═══ Health Check — Más Café estático / GoDaddy ═══\n");

if (warnings.length) {
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}

if (errors.length) {
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log("\n❌ No listo.\n");
  process.exit(1);
}

const routes = ["/", "/cafe/", "/menu/", "/nosotros/", "/tienda/", "/blog/", "/contacto/"];
console.log("Rutas que se generarán:");
routes.forEach((r) => console.log(`  • ${r}`));
console.log("\n✅ Listo para: npm run godaddy:prep\n");

#!/usr/bin/env node
/**
 * Verifica que el proyecto esté listo para desplegar en GoDaddy.
 * Uso: npm run health-check
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const errors = [];
const warnings = [];

function check(condition, message, level = "error") {
  if (!condition) {
    if (level === "error") errors.push(message);
    else warnings.push(message);
  }
}

// Archivos esenciales
const required = [
  "package.json",
  "next.config.ts",
  "content/site.json",
  "content/users.json",
  "content/settings.json",
  "public/images/brand/horizontal-azul.png",
  "scripts/godaddy-prep.mjs",
];

for (const file of required) {
  check(existsSync(path.join(root, file)), `Falta: ${file}`);
}

// next.config standalone
const nextConfig = readFileSync(path.join(root, "next.config.ts"), "utf-8");
check(
  nextConfig.includes('output: "standalone"') || nextConfig.includes("output: 'standalone'"),
  "next.config.ts debe tener output: 'standalone'",
);

// Rutas públicas en build (si existe)
const routes = ["/", "/cafe", "/menu", "/nosotros", "/tienda", "/blog", "/contacto"];
if (existsSync(path.join(root, ".next", "BUILD_ID"))) {
  console.log("✓ Build de producción detectado");
} else {
  warnings.push("No hay build (.next). Ejecuta: npm run build o npm run godaddy:prep");
}

// Contenido site.json
try {
  const site = JSON.parse(readFileSync(path.join(root, "content/site.json"), "utf-8"));
  check(site.brand?.name, "site.json: falta brand.name");
  check(Array.isArray(site.products) && site.products.length > 0, "site.json: sin productos");
} catch {
  errors.push("content/site.json no es JSON válido");
}

// Imágenes referenciadas
try {
  const site = JSON.parse(readFileSync(path.join(root, "content/site.json"), "utf-8"));
  const images = new Set();
  for (const p of site.products ?? []) if (p.image) images.add(p.image);
  for (const e of site.experiences ?? []) if (e.image) images.add(e.image);
  for (const b of site.blog ?? []) if (b.image) images.add(b.image);

  for (const img of images) {
    if (!img.startsWith("/")) continue;
    const filePath = path.join(root, "public", img);
    if (!existsSync(filePath)) {
      warnings.push(`Imagen no encontrada: ${img}`);
    }
  }
} catch {
  // ya reportado arriba
}

console.log("\n═══ Health Check — Más Café / GoDaddy ═══\n");

if (warnings.length) {
  console.log("Advertencias:");
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  console.log();
}

if (errors.length) {
  console.log("Errores:");
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log("\n❌ No listo para desplegar.\n");
  process.exit(1);
}

console.log("Rutas públicas esperadas:");
routes.forEach((r) => console.log(`  • ${r}`));

console.log("\n✅ Proyecto listo para npm run godaddy:prep\n");

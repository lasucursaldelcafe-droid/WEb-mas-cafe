#!/usr/bin/env node
/**
 * Verifica que el panel admin generado tenga clave de publicación y usuarios.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const adminPath = path.join(root, "gh-pages-site/admin/index.html");

function fail(msg) {
  console.error(`❌ Admin: ${msg}`);
  process.exit(1);
}

function warn(msg) {
  console.warn(`⚠️  Admin: ${msg}`);
}

if (!existsSync(adminPath)) {
  fail("no se encontró gh-pages-site/admin/index.html — ejecuta npm run build:github-pages");
}

const html = readFileSync(adminPath, "utf8");

if (!html.includes("USER_HASHES = [") || html.includes("USER_HASHES = []")) {
  fail("USER_HASHES vacío — revisa content/users.json");
}

const secretMatch = html.match(/const PUBLISH_SECRET = (.+);/);
if (!secretMatch) {
  fail("no se encontró PUBLISH_SECRET en admin/index.html");
}

let secretValue = "";
try {
  secretValue = JSON.parse(secretMatch[1]);
} catch {
  fail("PUBLISH_SECRET no es JSON válido");
}

const strictSecret = process.env.VERIFY_ADMIN_STRICT === "1";
if (!secretValue) {
  const msg =
    "PUBLISH_SECRET vacío — configura ADMIN_PUBLISH_KEY (PAT con contents:write) o GH_PAGES_PAT en GitHub Actions";
  if (strictSecret) fail(msg);
  warn(msg);
} else {
  console.log("✅ Admin: PUBLISH_SECRET configurado");
}

if (!html.includes("sha256Pure")) {
  fail("falta sha256-fallback — el login no funcionará en HTTP");
}

console.log("✅ Admin: usuarios y fallback SHA-256 OK");

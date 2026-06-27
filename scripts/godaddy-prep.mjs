#!/usr/bin/env node
/**
 * Genera el sitio estático y el ZIP para subir a GoDaddy (public_html).
 * Uso: npm run godaddy:prep
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "out");
const deployRoot = path.join(root, "deploy");
const zipPath = path.join(deployRoot, "mascafe-web-godaddy.zip");

const htaccess = `# Más Café — GoDaddy Apache
Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Forzar HTTPS (opcional, si ya tienes SSL en GoDaddy)
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Servir archivos y carpetas existentes
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
</IfModule>
`;

function log(msg) {
  console.log(`\n▸ ${msg}`);
}

log("Compilando sitio estático...");
execSync("npm run build", { cwd: root, stdio: "inherit" });

if (!existsSync(outDir)) {
  console.error("Error: no se generó la carpeta out/");
  process.exit(1);
}

writeFileSync(path.join(outDir, ".htaccess"), htaccess);

log("Creando ZIP para GoDaddy...");
rmSync(deployRoot, { recursive: true, force: true });
mkdirSync(deployRoot, { recursive: true });

execSync(`cd "${outDir}" && zip -rq "${zipPath}" .`, { stdio: "inherit" });

const sizeMb = (readFileSync(zipPath).length / 1024 / 1024).toFixed(1);

console.log(`
✅ Sitio estático listo para GoDaddy

   Carpeta local: out/
   ZIP a subir:   deploy/mascafe-web-godaddy.zip (${sizeMb} MB)

   En GoDaddy cPanel:
   1. Administrador de archivos → public_html
   2. Borra el contenido anterior (respalda si hace falta)
   3. Sube y extrae el ZIP
   4. Verifica que exista index.html en la raíz

   Guía completa: docs/MIGRACION-GODADDY.md
`);

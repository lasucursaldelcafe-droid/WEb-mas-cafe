#!/usr/bin/env node
/**
 * Prepara el paquete ZIP para subir a GoDaddy cPanel.
 * Uso: npm run godaddy:prep
 */
import { cpSync, existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const deployRoot = path.join(root, "deploy");
const deployDir = path.join(deployRoot, "mascafe-web");
const zipPath = path.join(deployRoot, "mascafe-web-godaddy.zip");

function log(msg) {
  console.log(`\n▸ ${msg}`);
}

log("Compilando producción (standalone)...");
execSync("npm run build", { cwd: root, stdio: "inherit" });

const standaloneDir = path.join(root, ".next", "standalone");
if (!existsSync(standaloneDir)) {
  console.error("Error: no se generó .next/standalone");
  process.exit(1);
}

log("Armando carpeta deploy/mascafe-web/...");
rmSync(deployRoot, { recursive: true, force: true });
mkdirSync(deployDir, { recursive: true });

cpSync(standaloneDir, deployDir, { recursive: true });

const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(deployDir, ".next", "static");
if (existsSync(staticSrc)) {
  mkdirSync(path.join(deployDir, ".next"), { recursive: true });
  cpSync(staticSrc, staticDest, { recursive: true });
}

cpSync(path.join(root, "public"), path.join(deployDir, "public"), { recursive: true });
cpSync(path.join(root, "content"), path.join(deployDir, "content"), { recursive: true });

// Passenger en GoDaddy a veces usa PASSENGER_PORT
const serverPath = path.join(deployDir, "server.js");
let serverCode = readFileSync(serverPath, "utf-8");
serverCode = serverCode.replace(
  "const currentPort = parseInt(process.env.PORT, 10) || 3000",
  "const currentPort = parseInt(process.env.PORT || process.env.PASSENGER_PORT, 10) || 3000",
);
writeFileSync(serverPath, serverCode);

writeFileSync(
  path.join(deployDir, ".env.production.example"),
  `NODE_ENV=production
HOSTNAME=0.0.0.0
ADMIN_PASSWORD=mascafe2025
# PORT lo asigna GoDaddy/cPanel automáticamente
`,
);

log("Creando ZIP (puede tardar 1-2 min)...");
execSync(
  `cd "${deployRoot}" && zip -rq "mascafe-web-godaddy.zip" mascafe-web`,
  { stdio: "inherit" },
);

const sizeMb = (readFileSync(zipPath).length / 1024 / 1024).toFixed(1);

console.log(`
✅ Paquete listo para GoDaddy

   Carpeta local: deploy/mascafe-web/
   ZIP a subir:   deploy/mascafe-web-godaddy.zip (${sizeMb} MB)
   Startup file:  server.js

   Sigue la guía: docs/MIGRACION-GODADDY.md
`);

#!/usr/bin/env node
/**
 * Build de producción para Vercel — mismo sitio estático que GitHub Pages.
 * Incluye wallet, fidelización, admin y verificación de enlaces.
 */
import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

loadEnvLocal();

const skipInforme = process.env.CI_SKIP_INFORME_SOURCE ?? "1";

console.log("\n▸ Build Vercel — sitio estático Más Café\n");

execSync("node scripts/build-github-pages.mjs", {
  stdio: "inherit",
  env: {
    ...process.env,
    CI_SKIP_INFORME_SOURCE: skipInforme,
    // Vercel sirve en raíz del dominio (sin basePath de GitHub Pages)
    GITHUB_PAGES: "",
  },
  cwd: root,
});

execSync("node scripts/verify-links.mjs", { stdio: "inherit", cwd: root });

const outDir = path.join(root, "gh-pages-site");
if (!existsSync(path.join(outDir, "fidelizacion/index.html"))) {
  console.error("\n❌ Falta fidelizacion/index.html en gh-pages-site\n");
  process.exit(1);
}
if (!existsSync(path.join(outDir, "wallet/index.html"))) {
  console.error("\n❌ Falta wallet/index.html en gh-pages-site\n");
  process.exit(1);
}

console.log("\n✅ Build Vercel listo → gh-pages-site/\n");

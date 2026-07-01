#!/usr/bin/env node
/**
 * Sitio HTML multipágina para GitHub Pages (HTML + imágenes locales).
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { collectImagePaths, generateSitePages } from "./lib/generate-site-pages.mjs";
import { collectFontFiles, loadDriveAssets, syncAllDriveAssets } from "./lib/drive-assets.mjs";
import { loadSite } from "./lib/site-html/shared.mjs";
import { generateAdminPage } from "./lib/site-html/admin.mjs";
import { generateConstitutionReport } from "./lib/generate-constitution-report.mjs";
import { generateWalletVisualPage } from "./lib/generate-wallet-visual.mjs";
import { FAVICON_FILES, generateFavicons } from "./lib/generate-favicons-lib.mjs";
import { generateWalletPage, generateCajaPage, generateWalletManifest } from "./lib/site-html/wallet-pages.mjs";
import { generateRobotsTxt, generateSitemapXml } from "./lib/seo.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "gh-pages-site");
const skipInformeSource = process.env.CI_SKIP_INFORME_SOURCE === "1";

console.log("\n▸ Generando sitio multipágina para GitHub Pages...\n");

const site = loadSite();
const driveManifest = loadDriveAssets();
try {
  const synced = await syncAllDriveAssets(driveManifest);
  if (synced) console.log(`  • ${synced} imagen(es) sincronizada(s) desde Drive`);
} catch (err) {
  console.warn(`  ⚠ Drive sync: ${err.message}`);
}

await generateFavicons(path.join(root, "public"));

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

const pages = generateSitePages();
for (const { path: relPath, html } of pages) {
  const dest = path.join(outDir, relPath);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, html, "utf8");
  console.log(`  • ${relPath}`);
}

const adminHtml = generateAdminPage();
const adminDest = path.join(outDir, "admin/index.html");
mkdirSync(path.dirname(adminDest), { recursive: true });
writeFileSync(adminDest, adminHtml, "utf8");
console.log("  • admin/index.html");

const constitutionHtml = generateConstitutionReport();
const informeDest = path.join(outDir, "informe/index.html");
mkdirSync(path.dirname(informeDest), { recursive: true });
writeFileSync(informeDest, constitutionHtml, "utf8");
if (!skipInformeSource) {
  const informeSource = path.join(root, "informes/constitucion-web.html");
  mkdirSync(path.dirname(informeSource), { recursive: true });
  writeFileSync(informeSource, constitutionHtml, "utf8");
}
console.log("  • informe/index.html (constitución web)");

const walletVisualHtml = generateWalletVisualPage();
const walletDest = path.join(outDir, "informe/wallet/index.html");
mkdirSync(path.dirname(walletDest), { recursive: true });
writeFileSync(walletDest, walletVisualHtml, "utf8");
if (!skipInformeSource) {
  const walletSource = path.join(root, "informes/wallet-visual.html");
  mkdirSync(path.dirname(walletSource), { recursive: true });
  writeFileSync(walletSource, walletVisualHtml, "utf8");
}
console.log("  • informe/wallet/index.html (mockup Apple + Google Wallet)");

await import("./wallet/sync-program.mjs");

const walletDir = path.join(outDir, "wallet");
const cajaDir = path.join(outDir, "caja");
mkdirSync(walletDir, { recursive: true });
mkdirSync(cajaDir, { recursive: true });

writeFileSync(path.join(walletDir, "index.html"), generateWalletPage(), "utf8");
writeFileSync(path.join(walletDir, "manifest.webmanifest"), generateWalletManifest(), "utf8");
writeFileSync(path.join(cajaDir, "index.html"), generateCajaPage(), "utf8");

for (const file of ["wallet.css", "wallet-app.js", "wallet-api.mjs"]) {
  cpSync(path.join(root, "scripts/wallet", file), path.join(walletDir, file));
}
cpSync(path.join(root, "scripts/wallet/caja-app.js"), path.join(cajaDir, "caja-app.js"));
console.log("  • wallet/index.html (fidelización cliente)");
console.log("  • caja/index.html (modo mostrador)");

const cotizacionSrc = path.join(root, "public/cotizacion-perpetuo/index.html");
const cotizacionDest = path.join(outDir, "cotizacion-perpetuo/index.html");
if (existsSync(cotizacionSrc)) {
  mkdirSync(path.dirname(cotizacionDest), { recursive: true });
  cpSync(cotizacionSrc, cotizacionDest);
  console.log("  • cotizacion-perpetuo/index.html (cotización Perpetuo)");
}

writeFileSync(
  path.join(outDir, "404.html"),
  `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=./"/><title>Más Café</title></head><body><p><a href="./">Ir al inicio</a></p></body></html>`,
  "utf8"
);

writeFileSync(path.join(outDir, ".nojekyll"), "");

writeFileSync(path.join(outDir, "sitemap.xml"), generateSitemapXml(), "utf8");
writeFileSync(path.join(outDir, "robots.txt"), generateRobotsTxt(), "utf8");
console.log("  • sitemap.xml + robots.txt (SEO)");

let copied = 0;
for (const fav of FAVICON_FILES) {
  const src = path.join(root, "public", fav);
  const dest = path.join(outDir, fav);
  if (existsSync(src)) {
    cpSync(src, dest);
    copied++;
  }
}
console.log("  • favicon.ico + iconos de pestaña");

for (const assetPath of collectImagePaths()) {
  const rel = assetPath.replace(/^\//, "");
  const src = path.join(root, "public", rel);
  const dest = path.join(outDir, rel);
  if (!existsSync(src)) {
    console.warn(`  ⚠ imagen no encontrada: ${rel}`);
    continue;
  }
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest);
  copied++;
}

const fontsDir = path.join(root, "public/fonts");
if (existsSync(fontsDir)) {
  const fontsOut = path.join(outDir, "fonts");
  mkdirSync(fontsOut, { recursive: true });
  for (const file of collectFontFiles(site, driveManifest)) {
    const src = path.join(fontsDir, file);
    if (existsSync(src)) {
      cpSync(src, path.join(fontsOut, file));
      copied++;
    }
  }
  console.log("  • fonts/ (tipografías de marca)");
}

console.log(`\n✅ ${pages.length + 1} páginas · ${copied} imágenes\n`);
console.log("Local:    npm run preview");
console.log("Público:  https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/");
console.log("Informe:  https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/");
console.log("Wallet:   https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/");
console.log("Caja:     https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/caja/");
console.log("Cotización: https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/cotizacion-perpetuo/\n");

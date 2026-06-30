#!/usr/bin/env node
/**
 * Descarga el logo principal desde Google Drive y genera derivados:
 * - logo-principal.png (oficial)
 * - favs.png (cuadrado para UI/favicon)
 * - logo-og.png (1200×630 redes sociales)
 * - favicon.ico + iconos de pestaña
 *
 * Uso: npm run brand:sync-logo
 */
import { mkdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import {
  BRAND_ASSETS,
  PRIMARY_LOGO_DRIVE_ID,
  loadBrandSettings,
  resolveBrandFile,
} from "./lib/brand-logo.mjs";
import { generateFavicons } from "./lib/generate-favicons-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const CREAM = "#f6f5ef";

async function downloadFromDrive(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function writePrimaryLogo(buffer, outPath) {
  mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(outPath);
}

/** Cuadrado con logo centrado (favicon / hero isotipo) */
async function writeSquareFavicon(srcPath, outPath, size = 512) {
  const meta = await sharp(srcPath).metadata();
  const pad = Math.round(size * 0.12);
  const inner = size - pad * 2;
  const resized = await sharp(srcPath)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: CREAM,
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png()
    .toFile(outPath);

  return { size, source: `${meta.width}x${meta.height}` };
}

/** Open Graph 1200×630 */
async function writeOgImage(srcPath, outPath) {
  const w = 1200;
  const h = 630;
  const maxW = Math.round(w * 0.72);
  const maxH = Math.round(h * 0.55);
  const resized = await sharp(srcPath)
    .resize(maxW, maxH, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: CREAM,
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .jpeg({ quality: 90 })
    .toFile(outPath.replace(/\.png$/, ".jpg"));

  // También PNG para compatibilidad
  await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: CREAM,
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png()
    .toFile(outPath);
}

async function main() {
  const brand = loadBrandSettings();
  const fileId = brand.primaryLogoDriveId || PRIMARY_LOGO_DRIVE_ID;

  console.log("\n▸ Logo principal Más Café — Google Drive\n");
  console.log(`  ID: ${fileId}`);

  const buffer = await downloadFromDrive(fileId);
  const primaryPath = resolveBrandFile(BRAND_ASSETS.primary);
  const favsPath = resolveBrandFile(BRAND_ASSETS.favicon);
  const ogPath = resolveBrandFile(BRAND_ASSETS.og);

  await writePrimaryLogo(buffer, primaryPath);
  console.log(`  ✅ logo-principal.png`);

  const sq = await writeSquareFavicon(primaryPath, favsPath);
  console.log(`  ✅ favs.png (${sq.size}px, desde ${sq.source})`);

  await writeOgImage(primaryPath, ogPath);
  console.log(`  ✅ logo-og.png (1200×630)`);

  await generateFavicons(path.join(root, "public"));
  console.log(`  ✅ favicon.ico + iconos de pestaña`);

  console.log("\n✅ Logo sincronizado. Ejecuta: npm run build:github-pages\n");
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});

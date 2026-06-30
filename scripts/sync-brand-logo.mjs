#!/usr/bin/env node
/**
 * Sincroniza logo desde Drive y genera miniaturas con el lockup horizontal
 * (mismo tratamiento visual que Google Wallet mockup).
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
const BLUE = "#073954";
const BLUE_MID = "#0a4d6e";
const GREEN = "#1bb175";

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

/** Recorta el isotipo (+) del lockup horizontal */
async function writeIconMark(horizontalPath, outPath) {
  const meta = await sharp(horizontalPath).metadata();
  const side = meta.height ?? 183;
  mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(horizontalPath)
    .extract({ left: 0, top: 0, width: Math.min(side, meta.width ?? side), height: side })
    .png()
    .toFile(outPath);
  return side;
}

/** Cuadrado con lockup horizontal azul centrado (UI / referencia) */
async function writeSquareFavicon(horizontalPath, outPath, size = 512) {
  const pad = Math.round(size * 0.1);
  const innerW = size - pad * 2;
  const innerH = Math.round(size * 0.35);
  const resized = await sharp(horizontalPath)
    .resize(innerW, innerH, {
      fit: "inside",
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

  return size;
}

/** OG 1200×630 — gradiente marca + lockup crema (igual que Google Wallet) */
async function writeOgImageWalletStyle(horizontalCremaPath, outPath) {
  const w = 1200;
  const h = 630;
  const gradientSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="mc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${BLUE}"/>
        <stop offset="45%" stop-color="${BLUE_MID}"/>
        <stop offset="100%" stop-color="${GREEN}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#mc)"/>
  </svg>`;

  const bg = await sharp(Buffer.from(gradientSvg)).png().toBuffer();
  const maxW = Math.round(w * 0.58);
  const logo = await sharp(horizontalCremaPath)
    .resize(maxW, null, { fit: "inside" })
    .png()
    .toBuffer();

  mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(bg)
    .composite([{ input: logo, gravity: "centre" }])
    .jpeg({ quality: 90 })
    .toFile(outPath.replace(/\.png$/, ".jpg"));

  await sharp(bg)
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(outPath);
}

async function main() {
  const brand = loadBrandSettings();
  const fileId = brand.primaryLogoDriveId || PRIMARY_LOGO_DRIVE_ID;

  const horizontalCremaPath = resolveBrandFile(BRAND_ASSETS.horizontalCrema);
  const horizontalAzulPath = resolveBrandFile(BRAND_ASSETS.horizontalAzul);

  if (!existsSync(horizontalCremaPath) || !existsSync(horizontalAzulPath)) {
    throw new Error(
      "Faltan horizontal-crema.png o horizontal-azul.png en public/images/brand/"
    );
  }

  console.log("\n▸ Logo Más Café — lockup horizontal (estilo Google Wallet)\n");

  try {
    const buffer = await downloadFromDrive(fileId);
    const primaryPath = resolveBrandFile(BRAND_ASSETS.primary);
    await writePrimaryLogo(buffer, primaryPath);
    console.log(`  ✅ logo-principal.png (respaldo Drive)`);
  } catch (err) {
    console.warn(`  ⚠ Drive: ${err.message} — usando lockups locales`);
  }

  const iconPath = resolveBrandFile(BRAND_ASSETS.iconMark);
  const iconSide = await writeIconMark(horizontalCremaPath, iconPath);
  console.log(`  ✅ icon-mark.png (${iconSide}×${iconSide} desde lockup)`);

  const favsPath = resolveBrandFile(BRAND_ASSETS.favicon);
  const sq = await writeSquareFavicon(horizontalAzulPath, favsPath);
  console.log(`  ✅ favs.png (${sq}px, lockup horizontal azul)`);

  const ogPath = resolveBrandFile(BRAND_ASSETS.og);
  await writeOgImageWalletStyle(horizontalCremaPath, ogPath);
  console.log(`  ✅ logo-og.png (1200×630, gradiente + lockup crema)`);

  await generateFavicons(path.join(root, "public"));
  console.log(`  ✅ favicon.ico + iconos de pestaña`);

  console.log("\n✅ Miniaturas unificadas. Ejecuta: npm run build:github-pages\n");
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});

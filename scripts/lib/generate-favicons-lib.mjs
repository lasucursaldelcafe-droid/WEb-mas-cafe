/**
 * Genera favicons para pestañas del navegador desde el lockup horizontal de marca.
 * Tamaños pequeños: isotipo (+). Tamaños grandes: lockup horizontal azul.
 */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveBrandFile, BRAND_ASSETS } from "./brand-logo.mjs";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const CREAM = { r: 246, g: 245, b: 239, alpha: 1 };

const SMALL_SIZES = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
];

const LARGE_SIZES = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

const FAVICON_FILES = [
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "site.webmanifest",
];

function pickSource(candidates) {
  const src = candidates.find((p) => existsSync(p));
  if (!src) {
    throw new Error(`No se encontró logo de marca. Ejecuta: npm run brand:sync-logo`);
  }
  return src;
}

async function resizeIcon(src, size, { padRatio = 0.08 } = {}) {
  const pad = Math.max(1, Math.round(size * padRatio));
  const inner = size - pad * 2;
  const resized = await sharp(src)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: CREAM,
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png()
    .toBuffer();
}

async function resizeHorizontal(src, size) {
  const pad = Math.round(size * 0.12);
  const innerW = size - pad * 2;
  const innerH = Math.round(size * 0.32);
  const resized = await sharp(src)
    .resize(innerW, innerH, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: CREAM,
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png()
    .toBuffer();
}

export async function generateFavicons(outDir = path.join(root, "public")) {
  const iconSrc = pickSource([
    resolveBrandFile(BRAND_ASSETS.iconMark),
    resolveBrandFile(BRAND_ASSETS.horizontalCrema),
  ]);
  const horizontalSrc = pickSource([
    resolveBrandFile(BRAND_ASSETS.horizontalAzul),
    resolveBrandFile(BRAND_ASSETS.favicon),
    resolveBrandFile(BRAND_ASSETS.horizontalCrema),
  ]);

  mkdirSync(outDir, { recursive: true });

  const pngBuffers = [];
  for (const { name, size } of SMALL_SIZES) {
    const buffer = await resizeIcon(iconSrc, size);
    writeFileSync(path.join(outDir, name), buffer);
    pngBuffers.push(buffer);
  }

  for (const { name, size } of LARGE_SIZES) {
    const buffer = await resizeHorizontal(horizontalSrc, size);
    writeFileSync(path.join(outDir, name), buffer);
  }

  const ico = await toIco(pngBuffers);
  writeFileSync(path.join(outDir, "favicon.ico"), ico);

  writeFileSync(
    path.join(outDir, "site.webmanifest"),
    JSON.stringify(
      {
        name: "Más Café",
        short_name: "Más Café",
        description: "Café de especialidad en Cali, Colombia",
        lang: "es-CO",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
        theme_color: "#073954",
        background_color: "#f6f5ef",
        display: "standalone",
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  return FAVICON_FILES;
}

export { FAVICON_FILES };

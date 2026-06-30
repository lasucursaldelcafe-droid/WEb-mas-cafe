/**
 * Genera favicons para pestañas del navegador desde el logo de marca.
 */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const SIZES = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
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

export async function generateFavicons(outDir = path.join(root, "public")) {
  const src = path.join(root, "public/images/brand/favs.png");
  if (!existsSync(src)) {
    throw new Error(`No se encontró el logo: ${src}`);
  }
  mkdirSync(outDir, { recursive: true });

  const pngBuffers = [];
  for (const { name, size } of SIZES) {
    const buffer = await sharp(src)
      .resize(size, size, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
    writeFileSync(path.join(outDir, name), buffer);
    if (size === 16 || size === 32) pngBuffers.push(buffer);
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

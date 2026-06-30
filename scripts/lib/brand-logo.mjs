/**
 * Logo principal de marca — fuente única para favicons, OG y JSON-LD.
 * El lockup horizontal (icono + «MÁS CAFÉ») es el estándar visual — igual que Google Wallet.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

/** Google Drive — logo oficial Más Café (archivo de respaldo) */
export const PRIMARY_LOGO_DRIVE_ID = "1ujaXixhIBH7nMdV-xg3sjtkkKXDT9wmo";
export const PRIMARY_LOGO_DRIVE_URL =
  "https://drive.google.com/file/d/1ujaXixhIBH7nMdV-xg3sjtkkKXDT9wmo/view?usp=drive_link";

export const BRAND_ASSETS = {
  /** Archivo sincronizado desde Drive (referencia) */
  primary: "public/images/brand/logo-principal.png",
  /** Lockup horizontal crema — fondos oscuros, OG estilo Wallet, mockups */
  horizontalCrema: "public/images/brand/horizontal-crema.png",
  /** Lockup horizontal azul — fondos claros, favicons, header */
  horizontalAzul: "public/images/brand/horizontal-azul.png",
  /** Isotipo (+ café) recortado del lockup — favicons pequeños */
  iconMark: "public/images/brand/icon-mark.png",
  /** Cuadrado derivado del lockup azul */
  favicon: "public/images/brand/favs.png",
  /** 1200×630 — gradiente marca + lockup crema (como Google Wallet) */
  og: "public/images/brand/logo-og.png",
};

export const BRAND_PATHS = {
  primary: "/images/brand/logo-principal.png",
  horizontalCrema: "/images/brand/horizontal-crema.png",
  horizontalAzul: "/images/brand/horizontal-azul.png",
  iconMark: "/images/brand/icon-mark.png",
  favicon: "/images/brand/favs.png",
  og: "/images/brand/logo-og.png",
};

export function brandAssetPath(key) {
  return BRAND_PATHS[key] ?? BRAND_PATHS.horizontalAzul;
}

export function loadBrandSettings() {
  const settingsPath = path.join(root, "content/settings.json");
  const settings = existsSync(settingsPath)
    ? JSON.parse(readFileSync(settingsPath, "utf8"))
    : {};
  const brand = settings.brand ?? {};
  return {
    primaryLogoDriveId: brand.primaryLogoDriveId || PRIMARY_LOGO_DRIVE_ID,
    primaryLogoPath: brand.primaryLogoPath || BRAND_PATHS.primary,
    ogImagePath: settings.seo?.ogImagePath || BRAND_PATHS.og,
    faviconSource: brand.faviconSource || BRAND_PATHS.horizontalAzul,
    thumbnailSource: brand.thumbnailSource || BRAND_PATHS.horizontalCrema,
  };
}

export function resolveBrandFile(relPath) {
  return path.join(root, relPath.replace(/^\//, "public/"));
}

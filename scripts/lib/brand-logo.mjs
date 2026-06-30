/**
 * Logo principal de marca — fuente única para favicons, OG y JSON-LD.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

/** Google Drive — logo oficial Más Café */
export const PRIMARY_LOGO_DRIVE_ID = "1ujaXixhIBH7nMdV-xg3sjtkkKXDT9wmo";
export const PRIMARY_LOGO_DRIVE_URL =
  "https://drive.google.com/file/d/1ujaXixhIBH7nMdV-xg3sjtkkKXDT9wmo/view?usp=drive_link";

export const BRAND_ASSETS = {
  /** Logo horizontal oficial (fuente desde Drive) */
  primary: "public/images/brand/logo-principal.png",
  /** Cuadrado para favicon / isotipo en UI */
  favicon: "public/images/brand/favs.png",
  /** 1200×630 para Open Graph / Twitter / Google */
  og: "public/images/brand/logo-og.png",
};

export const BRAND_PATHS = {
  primary: "/images/brand/logo-principal.png",
  favicon: "/images/brand/favs.png",
  og: "/images/brand/logo-og.png",
};

export function brandAssetPath(key) {
  return BRAND_PATHS[key] ?? BRAND_PATHS.primary;
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
    faviconSource: brand.faviconSource || BRAND_PATHS.primary,
  };
}

export function resolveBrandFile(relPath) {
  return path.join(root, relPath.replace(/^\//, "public/"));
}

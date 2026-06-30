import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

export const DEFAULT_TYPOGRAPHY = {
  display: "Playfair Display",
  body: "Satoshi",
  accent: "Marydale",
};

const manifestPath = path.join(root, "content/drive-assets.json");

export function loadDriveAssets() {
  if (!existsSync(manifestPath)) {
    return { folderId: "", folderUrl: "", fonts: [], images: [] };
  }
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

export function saveDriveAssets(manifest) {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

export function resolveTypography(site) {
  return { ...DEFAULT_TYPOGRAPHY, ...(site?.theme?.typography || {}) };
}

export function getFontByFamily(manifest, family) {
  return (manifest.fonts || []).find((f) => f.family === family);
}

export function getDriveImages(manifest, category) {
  return (manifest.images || []).filter(
    (img) => img.driveId && (!category || (img.categories || []).includes(category))
  );
}

export function parseDriveFileId(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  const match =
    raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    raw.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    raw.match(/^([a-zA-Z0-9_-]{20,})$/);
  return match?.[1] || "";
}

export function driveThumbnailUrl(driveId, size = 400) {
  return `https://drive.google.com/thumbnail?id=${driveId}&sz=w${size}`;
}

export function driveDownloadUrl(driveId) {
  return `https://drive.google.com/uc?export=download&id=${driveId}`;
}

export async function downloadFromDrive(fileId) {
  const url = driveDownloadUrl(fileId);
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export function resolvePublicPath(relativePath) {
  return path.join(root, "public", relativePath.replace(/^\//, ""));
}

export async function syncDriveImage(asset) {
  if (!asset?.driveId || !asset?.localPath) return false;
  const dest = resolvePublicPath(asset.localPath);
  mkdirSync(path.dirname(dest), { recursive: true });
  const buffer = await downloadFromDrive(asset.driveId);
  writeFileSync(dest, buffer);
  return true;
}

export async function syncAllDriveAssets(manifest = loadDriveAssets()) {
  let synced = 0;
  for (const img of manifest.images || []) {
    if (!img.driveId) continue;
    try {
      await syncDriveImage(img);
      synced++;
      console.log(`  ✅ ${img.label || img.id} → ${img.localPath}`);
    } catch (err) {
      console.warn(`  ⚠ ${img.id}: ${err.message}`);
    }
  }

  try {
    const menuPages = await syncMenuBook(manifest);
    if (menuPages > 0) {
      synced += menuPages;
      console.log(`  ✅ Menú digital → ${menuPages} página(s)`);
    }
  } catch (err) {
    console.warn(`  ⚠ menuBook: ${err.message}`);
  }

  try {
    const optimized = await optimizeMenuPageImages(manifest);
    if (optimized > 0) {
      synced += optimized;
      console.log(`  ✅ Menú zoom → ${optimized} página(s) recortadas`);
    }
  } catch (err) {
    console.warn(`  ⚠ menuBook zoom: ${err.message}`);
  }

  return synced;
}

export function resolveMenuBookPages(manifest = loadDriveAssets()) {
  const book = manifest.menuBook;
  if (!book?.pagesDir) return [];

  const dir = resolvePublicPath(book.pagesDir);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((file) => /^page-\d+\.webp$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => `${book.pagesDir}/${file}`);
}

async function loadSharp() {
  const { default: sharp } = await import("sharp");
  return sharp;
}

/** Recorta márgenes blancos del PDF y rellena el marco con zoom (cover). */
export async function processMenuPageBuffer(pageBuffer, book = {}) {
  const sharp = await loadSharp();
  const width = book.pageWidth ?? 792;
  const height = book.pageHeight ?? 1224;
  const threshold = book.trimThreshold ?? 18;
  const quality = book.webpQuality ?? 86;

  return sharp(pageBuffer)
    .trim({ threshold })
    .resize(width, height, { fit: "cover", position: "centre" })
    .webp({ quality })
    .toBuffer();
}

export async function optimizeMenuPageImages(manifest = loadDriveAssets()) {
  const book = manifest.menuBook;
  if (!book?.pagesDir) return 0;

  const dir = resolvePublicPath(book.pagesDir);
  if (!existsSync(dir)) return 0;

  const files = readdirSync(dir)
    .filter((file) => /^page-\d+\.webp$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (!files.length) return 0;

  let count = 0;
  for (const file of files) {
    const dest = path.join(dir, file);
    const processed = await processMenuPageBuffer(readFileSync(dest), book);
    writeFileSync(dest, processed);
    count += 1;
  }

  return count;
}

export async function syncMenuBook(manifest = loadDriveAssets()) {
  const book = manifest.menuBook;
  if (!book?.pdfDriveId) return 0;

  const { pdf } = await import("pdf-to-img");

  const pdfDest = resolvePublicPath(book.pdfLocalPath || "/menu/menu-digital.pdf");
  const pagesDir = resolvePublicPath(book.pagesDir || "/images/menu/pages");
  mkdirSync(path.dirname(pdfDest), { recursive: true });
  mkdirSync(pagesDir, { recursive: true });

  const pdfBuffer = await downloadFromDrive(book.pdfDriveId);
  writeFileSync(pdfDest, pdfBuffer);

  const scale = book.scale || 2;
  const document = await pdf(pdfDest, { scale });
  let pageNum = 0;

  for await (const pageBuffer of document) {
    pageNum += 1;
    const filename = `page-${String(pageNum).padStart(2, "0")}.webp`;
    const dest = path.join(pagesDir, filename);
    const processed = await processMenuPageBuffer(pageBuffer, book);
    writeFileSync(dest, processed);
  }

  if (pageNum > 0) {
    book.pageCount = pageNum;
    saveDriveAssets(manifest);
  }

  return pageNum;
}

export function buildFontFacesCss(depth, site, manifest = loadDriveAssets()) {
  const typography = resolveTypography(site);
  const selectedFamilies = new Set(Object.values(typography));
  const up = depth === 0 ? "" : "../".repeat(depth);
  const rules = [];

  for (const font of manifest.fonts || []) {
    if (!selectedFamilies.has(font.family)) continue;
    for (const face of font.faces || []) {
      const rel = face.path.replace(/^\//, "");
      rules.push(
        `@font-face{font-family:"${font.family}";src:url("${up}${rel}") format("${face.format}");font-weight:${face.weight};font-display:swap}`
      );
    }
  }

  return rules.length ? `\n    ${rules.join("\n    ")}\n  ` : "";
}

export function collectFontFiles(site, manifest = loadDriveAssets()) {
  const typography = resolveTypography(site);
  const selectedFamilies = new Set(Object.values(typography));
  const files = new Set();

  for (const font of manifest.fonts || []) {
    if (!selectedFamilies.has(font.family)) continue;
    for (const face of font.faces || []) {
      files.add(path.basename(face.path));
    }
  }
  return [...files];
}

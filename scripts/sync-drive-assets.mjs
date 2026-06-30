#!/usr/bin/env node
/**
 * Descarga imágenes del manifiesto Drive → public/
 * Uso: npm run drive:sync-assets
 */
import { loadDriveAssets, syncAllDriveAssets } from "./lib/drive-assets.mjs";

async function main() {
  const manifest = loadDriveAssets();
  console.log("\n▸ Sincronizando assets desde Google Drive\n");
  console.log(`  Carpeta: ${manifest.folderUrl || manifest.folderId || "—"}\n`);

  const withId = (manifest.images || []).filter((i) => i.driveId);
  const hasMenuBook = !!manifest.menuBook?.pdfDriveId;

  if (!withId.length && !hasMenuBook) {
    console.log("  ○ No hay assets con driveId en content/drive-assets.json");
    console.log("    Añade IDs de Drive al manifiesto o configura menuBook.pdfDriveId.\n");
    return;
  }

  const synced = await syncAllDriveAssets(manifest);
  console.log(`\n✅ ${synced} asset(s) sincronizado(s)\n`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});

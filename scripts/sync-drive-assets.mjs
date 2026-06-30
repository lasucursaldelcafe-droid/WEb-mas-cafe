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
  if (!withId.length) {
    console.log("  ○ No hay imágenes con driveId en content/drive-assets.json");
    console.log("    Añade el ID de cada archivo de Drive al manifiesto.\n");
    return;
  }

  const synced = await syncAllDriveAssets(manifest);
  console.log(`\n✅ ${synced} imagen(es) sincronizada(s)\n`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Sincroniza Google Search Console (TXT DNS → settings) y avisa sitemap.
 *
 * Uso:
 *   npm run seo:sync-google
 *   npm run seo:sync-google -- --dry-run
 *   npm run seo:sync-google -- --no-ping
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { testGodaddyCredentials } from "./lib/godaddy-api.mjs";
import { runGoogleSeoSync } from "./lib/google-seo-sync.mjs";

loadEnvLocal();

const dryRun = process.argv.includes("--dry-run");
const noPing = process.argv.includes("--no-ping");

async function main() {
  console.log("\n▸ Sincronización Google SEO — Más Café\n");

  if (!process.env.GODADDY_API_KEY || !process.env.GODADDY_API_SECRET) {
    console.error("❌ Faltan credenciales GoDaddy\n");
    process.exit(1);
  }

  await testGodaddyCredentials();

  const { sync, pings, siteUrl } = await runGoogleSeoSync({
    dryRun,
    ping: !noPing,
  });

  if (sync.verified) {
    console.log(`  ✅ Google verificado (DNS TXT): ${sync.code.slice(0, 12)}…`);
    if (sync.changed) console.log("  ✅ settings.json actualizado");
    else console.log("  ○ settings.json ya tenía el código");
  } else {
    console.log("  ○ Sin TXT google-site-verification en DNS @");
  }

  console.log(`  Sitio: ${siteUrl}`);

  if (!noPing && !dryRun) {
    console.log("\n  Ping sitemap:");
    for (const p of pings) {
      const icon = p.ok ? "✅" : "○";
      console.log(`    ${icon} ${p.name}: HTTP ${p.status}`);
    }
  }

  console.log("\n  Search Console: https://search.google.com/search-console");
  console.log(`  Sitemap manual: ${siteUrl}/sitemap.xml\n`);

  process.exit(sync.verified ? 0 : 1);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});

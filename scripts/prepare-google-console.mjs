#!/usr/bin/env node
/**
 * Prepara Google Cloud + Pay Console y deja Supabase listo para recibir el JSON.
 * Tras descargar el JSON en GCP, ejecuta: npm run wallet:google-ingest -- ./archivo.json
 *
 * Uso:
 *   npm run wallet:google-console
 */
import { execSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { loadGoogleWalletConfig, applyGoogleWalletConfigToEnv } from "./lib/google-wallet-config.mjs";
import { readGoogleServiceAccount, repoRoot } from "./lib/read-google-sa.mjs";
import { DEFAULT_GOOGLE_WALLET_SA_PATH } from "./lib/google-wallet-sa-path.mjs";
import { deployGoogleWalletIdsOnly, deployWalletFunction } from "./lib/google-wallet-deploy.mjs";
import { googleCloudConsoleLinks } from "./lib/google-wallet-api.mjs";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./wallet/supabase-shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadEnvLocal();
applyGoogleWalletConfigToEnv();

const cfg = loadGoogleWalletConfig();
const projectId = cfg.googleCloudProjectId || "mas-cafe-c8413";
const saEmail =
  cfg.serviceAccountEmail ||
  `firebase-adminsdk-fbsvc@${projectId}.iam.gserviceaccount.com`;
const issuerId = cfg.issuerId || process.env.GOOGLE_WALLET_ISSUER_ID;
const merchantId = cfg.merchantId || process.env.GOOGLE_PAY_MERCHANT_ID;
const links = googleCloudConsoleLinks(projectId);

console.log("\n═══════════════════════════════════════════════════");
console.log("  Preparar Google Wallet — Más Café");
console.log("═══════════════════════════════════════════════════\n");

console.log("▸ 1/4 Desplegar Issuer ID + Edge Function en Supabase…");
const deploy = await deployGoogleWalletIdsOnly({
  issuerId,
  merchantId,
  dryRun: false,
});
if (deploy.supabase) console.log("  ✓ Issuer/Merchant en Supabase");
else console.log("  ○ Supabase omitido (falta SUPABASE_ACCESS_TOKEN en .env.local)");

if (await deployWalletFunction(false)) {
  console.log("  ✓ Edge Function wallet");
} else {
  console.log("  ○ Edge Function omitida (falta SUPABASE_ACCESS_TOKEN)");
}

const existing = readGoogleServiceAccount();
if (existing?.account) {
  console.log(`\n▸ JSON ya detectado: ${existing.account.client_email}`);
  console.log("  Ejecuta: npm run wallet:google-ingest\n");
} else {
  console.log("\n▸ 2/4 Falta el JSON — sigue estos pasos en Google:\n");

  const steps = [
    {
      n: 1,
      title: "Activar Google Wallet API",
      url: links.walletApi,
      action: "Pulsar «Enable» / «Activar»",
    },
    {
      n: 2,
      title: "Abrir cuenta de servicio",
      url: `${links.serviceAccounts}`,
      action: `Abrir: ${saEmail}`,
    },
    {
      n: 3,
      title: "Crear clave JSON",
      url: links.serviceAccounts,
      action: "Pestaña Claves → Añadir clave → Crear clave nueva → JSON → Descargar",
    },
    {
      n: 4,
      title: "Autorizar en Pay Console",
      url: cfg.consoleEditUrl || links.businessConsole,
      action: `Usuarios autorizados → Añadir: ${saEmail}`,
    },
    {
      n: 5,
      title: "Importar al proyecto",
      url: "",
      action: `npm run wallet:google-ingest -- ./ruta/descarga.json`,
    },
  ];

  for (const s of steps) {
    console.log(`  ${s.n}. ${s.title}`);
    if (s.url) console.log(`     ${s.url}`);
    console.log(`     → ${s.action}\n`);
  }
}

console.log("▸ 3/4 Verificar API Supabase…");
try {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/wallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ action: "getGoogleWalletStatus" }),
  });
  const data = await res.json();
  console.log(
    `  Issuer en servidor: ${data.issuerConfigured ? "✓" : "✗"} (${data.classId || "—"})`,
  );
  console.log(
    `  JWT / botón Wallet: ${data.configured ? "✓ ACTIVO" : "○ pendiente JSON"}`,
  );
} catch (err) {
  console.log(`  ⚠ No se pudo consultar API: ${err.message}`);
}

console.log("\n▸ 4/4 Ruta destino del JSON en este repo:");
mkdirSync(path.dirname(DEFAULT_GOOGLE_WALLET_SA_PATH), { recursive: true });
const dest = DEFAULT_GOOGLE_WALLET_SA_PATH;
console.log(`  ${dest}`);
console.log("  (gitignored — nunca se sube a GitHub)\n");

const cardPath = path.join(repoRoot, "secrets", "PASOS-GOOGLE-CONSOLE.txt");
writeFileSync(
  cardPath,
  [
    "Más Café — Google Wallet JSON",
    "==============================",
    "",
    `Proyecto GCP: ${projectId}`,
    `Cuenta de servicio: ${saEmail}`,
    `Issuer ID: ${issuerId}`,
    `Merchant ID: ${merchantId}`,
    "",
    "1. Activar API:",
    links.walletApi,
    "",
    "2. Descargar JSON:",
    links.serviceAccounts,
    "   Claves → Añadir clave → JSON",
    "",
    "3. Pay Console — Usuarios autorizados:",
    cfg.consoleEditUrl || links.businessConsole,
    `   Email: ${saEmail}`,
    "",
    "4. Importar:",
    "   npm run wallet:google-ingest -- ./archivo-descargado.json",
    "",
    "5. Probar Android:",
    "   https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/",
    "",
  ].join("\n"),
  "utf8",
);
console.log(`  ✓ Guía guardada: secrets/PASOS-GOOGLE-CONSOLE.txt\n`);

console.log("═══════════════════════════════════════════════════");
console.log("  Cuando tengas el .json:");
console.log("  npm run wallet:google-ingest -- ./tu-archivo.json");
console.log("═══════════════════════════════════════════════════\n");

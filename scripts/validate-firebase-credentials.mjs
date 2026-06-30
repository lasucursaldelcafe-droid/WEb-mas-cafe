#!/usr/bin/env node
/**
 * Valida credenciales Firebase para setup automático de wallet.
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { resolveServiceAccountJson, getAccessToken, FIREBASE_PROJECT } from "./lib/firebase-setup-api.mjs";

loadEnvLocal();

console.log("\n═══ Validación Firebase — Wallet ═══\n");

const sa = resolveServiceAccountJson();
const token = process.env.FIREBASE_TOKEN?.trim();

if (!sa && !token) {
  console.log("  ✗ Falta FIREBASE_SERVICE_ACCOUNT (JSON) o FIREBASE_TOKEN");
  console.log("\n  Configura en GitHub Secrets:");
  console.log("  https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions");
  console.log("\n  Cuenta de servicio → Firebase Console → Configuración → Cuentas de servicio");
  console.log("  Token CI → npx firebase login:ci\n");
  process.exit(1);
}

if (sa) {
  try {
    await getAccessToken(sa);
    console.log(`  ✓ Cuenta de servicio — acceso API OK (${FIREBASE_PROJECT})`);
    console.log("  ✓ Setup completo disponible (Auth + Firestore + deploy + seed)\n");
    process.exit(0);
  } catch (err) {
    console.log("  ✗ Cuenta de servicio:", err.message);
    process.exit(1);
  }
}

console.log("  ⚠ Solo FIREBASE_TOKEN — deploy parcial (Auth/Firestore manual o SA recomendada)\n");

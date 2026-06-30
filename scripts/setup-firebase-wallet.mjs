#!/usr/bin/env node
/**
 * Setup autónomo de Firebase para la wallet:
 * - Habilita APIs
 * - Configura Auth (email + Google + dominios)
 * - Crea Firestore si falta
 * - Despliega reglas, índices y Cloud Functions
 * - Siembra programa de fidelización
 *
 * Requiere FIREBASE_SERVICE_ACCOUNT (JSON) o GOOGLE_APPLICATION_CREDENTIALS
 * Alternativa parcial: FIREBASE_TOKEN (solo deploy, sin Auth/Firestore API)
 *
 * Uso:
 *   npm run wallet:setup
 *   npm run wallet:setup -- --dry-run
 *   npm run wallet:setup -- --skip-deploy
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  FIREBASE_PROJECT,
  authorizedDomains,
  configureAuthProviders,
  enableApis,
  ensureFirestoreDatabase,
  resolveServiceAccountJson,
  seedProgramInFirestore,
  writeTempServiceAccount,
  getAccessToken,
} from "./lib/firebase-setup-api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipDeploy = args.includes("--skip-deploy");

loadEnvLocal();

function log(step, msg) {
  console.log(`  ${dryRun ? "○" : "✓"} [${step}] ${msg}`);
}

function run(cmd, label) {
  console.log(`\n▸ ${label}\n`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Setup autónomo — Wallet Firebase");
console.log(`  Proyecto: ${FIREBASE_PROJECT}`);
if (dryRun) console.log("  MODO: dry-run (sin cambios)");
console.log("═══════════════════════════════════════════════════\n");

run("node scripts/wallet/sync-program.mjs", "Sincronizar programa → functions");

const sa = resolveServiceAccountJson();
const firebaseToken = process.env.FIREBASE_TOKEN?.trim();

if (!sa && !firebaseToken && !dryRun) {
  console.error(
    "✗ Falta FIREBASE_SERVICE_ACCOUNT (JSON) o FIREBASE_TOKEN.\n" +
      "  Recomendado: cuenta de servicio con roles Firebase Admin + Service Usage Admin.\n" +
      "  GitHub Secret: FIREBASE_SERVICE_ACCOUNT\n"
  );
  process.exit(1);
}

if (!sa && !firebaseToken && dryRun) {
  log("1-3", "APIs + Auth + Firestore — simulación");
  console.log(`      Dominios previstos: ${authorizedDomains().join(", ")}`);
  log("4-6", "Deploy + seed — omitido (dry-run)");
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Dry-run OK — configura FIREBASE_SERVICE_ACCOUNT para activar backend");
  console.log("═══════════════════════════════════════════════════\n");
  process.exit(0);
}

if (sa && !dryRun) {
  run("npm ci --prefix functions", "Dependencias Cloud Functions (Admin SDK)");
  writeTempServiceAccount(sa);
  const token = await getAccessToken(sa);

  log("1/6", "Habilitando APIs de Google Cloud…");
  const apis = await enableApis(token);
  for (const a of apis) {
    console.log(`      ${a.ok ? "✓" : "⚠"} ${a.service} (${a.status})`);
  }

  log("2/6", "Configurando Authentication (email + Google + dominios)…");
  const auth = await configureAuthProviders(token);
  console.log(`      Dominios: ${auth.authorizedDomains.join(", ")}`);

  log("3/6", "Verificando Firestore…");
  const fs = await ensureFirestoreDatabase(token);
  console.log(`      ${fs.created ? "Base creada" : "Base existente"} · ${fs.location}`);
} else if (sa && dryRun) {
  log("1-3", "APIs + Auth + Firestore — omitido (dry-run)");
  console.log(`      Dominios previstos: ${authorizedDomains().join(", ")}`);
} else {
  console.log("\n⚠ Solo FIREBASE_TOKEN: se omite configuración Auth/Firestore vía API.\n");
}

if (!skipDeploy && !dryRun) {
  run("npm ci --prefix functions", "Dependencias Cloud Functions");

  run("npm run build:firebase", "Build sitio + wallet para Firebase Hosting");

  log("4/6", "Desplegando hosting + functions + firestore…");
  const deployEnv = { ...process.env, FIREBASE_PROJECT };
  if (firebaseToken && !sa) deployEnv.FIREBASE_TOKEN = firebaseToken;

  try {
    execSync(
      `npx firebase-tools deploy --only hosting:mas-cafe-c8413,functions:wallet,firestore --project ${FIREBASE_PROJECT} --non-interactive`,
      { cwd: root, stdio: "inherit", env: deployEnv }
    );
  } catch (err) {
    console.error(
      "\n✗ Deploy falló. Si el error menciona billing, activa plan Blaze en Firebase Console.\n" +
        "  https://console.firebase.google.com/project/mas-cafe-c8413/usage/details\n"
    );
    throw err;
  }

  if (sa) {
    log("5/6", "Sembrando programa de fidelización en Firestore…");
    const seed = await seedProgramInFirestore(sa);
    console.log(
      seed.seeded
        ? `      Programa creado · PIN caja inicial: ${seed.defaultStaffPin}`
        : "      Programa ya existía (sin cambios)"
    );
  }

  log("6/6", "Verificando endpoints…");
  for (const route of ["/wallet/", "/caja/"]) {
    const url = `https://${FIREBASE_PROJECT}.web.app${route}`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`      ${url} → HTTP ${res.status}`);
    } catch (e) {
      console.log(`      ${url} → no verificado (${e.message})`);
    }
  }
} else {
  log("4-6", "Deploy + seed — omitido (dry-run o --skip-deploy)");
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Wallet lista para operar");
console.log("  Cliente:  /wallet/");
console.log("  Caja:     /caja/  (PIN inicial 123456)");
console.log("  Comando:  npm run wallet:setup");
console.log("═══════════════════════════════════════════════════\n");

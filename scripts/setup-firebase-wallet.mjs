#!/usr/bin/env node
/**
 * Setup autónomo de Firebase para la wallet:
 * - Diagnóstico y permisos Google Cloud (IAM, APIs, OAuth)
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
 *   npm run wallet:diagnose
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  FIREBASE_PROJECT,
  authorizedDomains,
  enableApis,
  configureAuthProviders,
  ensureFirestoreDatabase,
  resolveServiceAccountJson,
  seedProgramInFirestore,
  writeTempServiceAccount,
  getAccessToken,
} from "./lib/firebase-setup-api.mjs";
import {
  autoFixPermissions,
  runWalletDiagnostics,
} from "./lib/firebase-permissions.mjs";
import { LINKS } from "./lib/google-console-links.mjs";

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

function printBlockers(report) {
  console.error("\n✗ Setup bloqueado — corrige estos puntos:\n");
  for (const b of report.blockers) {
    console.error(`  · ${b.message}`);
    if (b.fix?.link) console.error(`    ${b.fix.link}`);
    if (b.fix?.steps) {
      for (const s of b.fix.steps) console.error(`    → ${s}`);
    }
  }
  console.error("\n  Diagnóstico completo: npm run wallet:diagnose");
  console.error(`  Facturación Blaze: ${LINKS.billingBlaze}`);
  console.error(`  Permisos IAM:      ${LINKS.iamGrant}`);
  console.error(`  OAuth Google:      ${LINKS.oauthConsent}\n`);
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
      `  GitHub Secret: ${LINKS.githubSecrets}\n` +
      `  Generar clave: ${LINKS.serviceAccounts}\n`
  );
  process.exit(1);
}

if (!sa && !firebaseToken && dryRun) {
  log("0-3", "Permisos + APIs + Auth + Firestore — simulación");
  console.log(`      Dominios previstos: ${authorizedDomains().join(", ")}`);
  log("4-6", "Deploy + seed — omitido (dry-run)");
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Dry-run OK — configura FIREBASE_SERVICE_ACCOUNT para activar backend");
  console.log(`  Diagnóstico: npm run wallet:diagnose`);
  console.log("═══════════════════════════════════════════════════\n");
  process.exit(0);
}

if (sa) {
  if (!dryRun) {
    run("npm ci --prefix functions", "Dependencias Cloud Functions (Admin SDK)");
  }
  writeTempServiceAccount(sa);

  log("0/6", dryRun ? "Diagnóstico de permisos (solo lectura)…" : "Permisos Google Cloud + auto-reparación…");

  if (!dryRun) {
    const fix = await autoFixPermissions(sa);
    if (!fix.billing.enabled) {
      console.log(`      ✗ Facturación inactiva — activa Blaze manualmente`);
      console.log(`        ${LINKS.billingBlaze}`);
    } else {
      console.log(`      ✓ Facturación activa`);
    }
    if (fix.iam.ok) {
      console.log(
        fix.iam.alreadyHadAll
          ? "      ✓ Roles IAM completos"
          : `      ✓ Roles IAM asignados: ${(fix.iam.granted || []).join(", ")}`
      );
    } else {
      console.log(`      ✗ IAM: ${fix.iam.error || fix.iam.missing?.join(", ")}`);
      console.log(`        ${LINKS.iamGrant}`);
    }
    const apisOk = fix.apis.filter((a) => a.ok).length;
    console.log(`      ${apisOk === fix.apis.length ? "✓" : "⚠"} APIs ${apisOk}/${fix.apis.length}`);
    console.log(`      ${fix.oauth.ok ? "✓" : "⚠"} OAuth consent`);
  }

  const report = await runWalletDiagnostics(sa, { checkOnly: dryRun });
  if (!dryRun && !report.canAutoSetup) {
    printBlockers(report);
    process.exit(1);
  }
  if (dryRun) {
    console.log(`      Dominios previstos: ${authorizedDomains().join(", ")}`);
    log("1-6", "APIs + Auth + Firestore + deploy — omitido (dry-run)");
  }
} else {
  console.log("\n⚠ Solo FIREBASE_TOKEN: se omite configuración Auth/Firestore vía API.\n");
  console.log(`  Para automatizar permisos Google Console usa FIREBASE_SERVICE_ACCOUNT`);
  console.log(`  ${LINKS.githubSecrets}\n`);
}

if (sa && !dryRun) {
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
        `  ${LINKS.billingBlaze}\n` +
        "  Diagnóstico: npm run wallet:diagnose\n"
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
} else if (!dryRun) {
  log("4-6", "Deploy + seed — omitido (--skip-deploy)");
} else if (dryRun && sa) {
  /* ya logueado arriba */
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Wallet lista para operar");
console.log("  Cliente:  /wallet/");
console.log("  Caja:     /caja/  (PIN inicial 123456)");
console.log("  Comando:  npm run wallet:setup");
console.log("  Diagnóstico permisos: npm run wallet:diagnose");
console.log("═══════════════════════════════════════════════════\n");

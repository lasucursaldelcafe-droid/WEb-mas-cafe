#!/usr/bin/env node
/**
 * Diagnóstico de permisos Google Cloud / Firebase para la wallet.
 * Muestra qué bloquea el setup automático y enlaces directos para corregirlo.
 *
 * Uso:
 *   npm run wallet:diagnose
 *   npm run wallet:diagnose -- --fix   (intentar reparar vía API)
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { resolveServiceAccountJson, FIREBASE_PROJECT } from "./lib/firebase-setup-api.mjs";
import {
  runWalletDiagnostics,
  autoFixPermissions,
} from "./lib/firebase-permissions.mjs";
import {
  LINKS,
  REQUIRED_CI_ROLES,
  serviceAccountKeyInstructions,
} from "./lib/google-console-links.mjs";

const args = process.argv.slice(2);
const tryFix = args.includes("--fix");

loadEnvLocal();

function icon(status) {
  if (status === "ok") return "✓";
  if (status === "warn") return "⚠";
  return "✗";
}

function printFix(fix) {
  if (!fix) return;
  if (typeof fix === "string") {
    console.log(`      → ${fix}`);
    return;
  }
  if (fix.link) console.log(`      → ${fix.link}`);
  if (fix.steps) {
    for (const step of fix.steps) console.log(`        · ${step}`);
  }
  if (fix.apis) {
    for (const a of fix.apis) console.log(`        · ${a.service}: ${a.link}`);
  }
  if (fix.missingRoles?.length) {
    for (const r of fix.missingRoles) console.log(`        · Rol faltante: ${r}`);
  }
}

function printReport(report) {
  console.log(`\n  Proyecto: ${report.project}`);
  console.log(`  Cuenta:   ${report.serviceAccount}\n`);

  for (const c of report.checks) {
    console.log(`  ${icon(c.status)} [${c.id}] ${c.message}`);
    printFix(c.fix);
  }

  console.log("\n── Enlaces rápidos ──");
  console.log(`  Facturación Blaze:  ${LINKS.billingBlaze}`);
  console.log(`  IAM / permisos:     ${LINKS.iamGrant}`);
  console.log(`  OAuth consent:      ${LINKS.oauthConsent}`);
  console.log(`  Auth providers:     ${LINKS.authProviders}`);
  console.log(`  APIs:               ${LINKS.apisDashboard}`);
  console.log(`  GitHub Secret:      ${LINKS.githubSecrets}`);
  console.log(`  Workflow setup:     ${LINKS.workflowSetup}`);

  console.log("\n── Roles IAM recomendados (cuenta de servicio CI) ──");
  for (const r of REQUIRED_CI_ROLES) {
    console.log(`  · ${r.id} — ${r.why}`);
  }

  if (report.blockers.length) {
    console.log("\n── Bloqueos (por qué no te deja avanzar) ──");
    for (const b of report.blockers) {
      console.log(`  ✗ ${b.message}`);
      printFix(b.fix);
    }
  }

  if (report.warnings.length) {
    console.log("\n── Advertencias ──");
    for (const w of report.warnings) {
      console.log(`  ⚠ ${w.message}`);
      printFix(w.fix);
    }
  }
}

console.log("\n═══════════════════════════════════════════════════");
console.log("  Diagnóstico — Wallet Firebase + Google Console");
console.log(`  Proyecto: ${FIREBASE_PROJECT}`);
if (tryFix) console.log("  Modo: --fix (auto-reparación vía API)");
console.log("═══════════════════════════════════════════════════");

const sa = resolveServiceAccountJson();

if (!sa) {
  console.log("\n  ✗ Falta FIREBASE_SERVICE_ACCOUNT (JSON completo de cuenta de servicio)\n");
  const keyHelp = serviceAccountKeyInstructions();
  for (const step of keyHelp.steps) console.log(`    · ${step}`);
  console.log("\n  Sin esto el script no puede pedir permisos ni activar APIs automáticamente.");
  console.log("  FIREBASE_TOKEN solo sirve para deploy parcial (sin Auth/Firestore API).\n");
  process.exit(1);
}

if (tryFix) {
  console.log("\n▸ Intentando reparar permisos automáticamente…\n");
  const fix = await autoFixPermissions(sa);

  if (!fix.billing.enabled) {
    console.log(`  ✗ Facturación: ${fix.billing.reason}`);
    console.log(`    Solo un Owner humano puede activar Blaze: ${LINKS.billingBlaze}`);
  } else {
    console.log(`  ✓ Facturación activa`);
  }

  if (fix.iam.ok) {
    console.log(
      fix.iam.alreadyHadAll
        ? "  ✓ Roles IAM ya estaban completos"
        : `  ✓ Roles IAM asignados: ${(fix.iam.granted || []).join(", ")}`
    );
  } else {
    console.log(`  ✗ IAM: ${fix.iam.error || fix.iam.missing?.join(", ")}`);
    console.log(`    → ${LINKS.iamGrant}`);
  }

  const apisOk = fix.apis.filter((a) => a.ok).length;
  console.log(`  ${apisOk === fix.apis.length ? "✓" : "⚠"} APIs: ${apisOk}/${fix.apis.length} habilitadas`);

  console.log(`  ${fix.oauth.ok ? "✓" : "⚠"} OAuth consent: ${fix.oauth.ok ? "OK" : fix.oauth.reason}`);
  console.log(`  ${fix.auth?.error ? "✗" : "✓"} Auth: ${fix.auth?.error || "OK"}`);
  console.log(`  ${fix.firestore?.error ? "✗" : "✓"} Firestore: ${fix.firestore?.error || "OK"}`);
}

const report = await runWalletDiagnostics(sa);
printReport(report);

console.log("\n═══════════════════════════════════════════════════");
if (report.canAutoSetup) {
  console.log("  Listo para: npm run wallet:setup");
} else {
  console.log("  Hay bloqueos — corrige lo marcado con ✗ y vuelve a ejecutar");
  console.log("  Comando: npm run wallet:diagnose -- --fix");
}
console.log("═══════════════════════════════════════════════════\n");

process.exit(report.canAutoSetup ? 0 : 1);

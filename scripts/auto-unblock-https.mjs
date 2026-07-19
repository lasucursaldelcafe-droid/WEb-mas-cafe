#!/usr/bin/env node
/**
 * Desbloqueo HTTPS totalmente automático.
 * 1. GitHub Pages kickstart nuclear (GoDaddy + GH_PAGES_PAT)
 * 2. Si sigue fallando y hay CLOUDFLARE_API_TOKEN → Cloudflare SSL
 *
 * Uso:
 *   npm run domain:auto-unblock
 */
import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

loadEnvLocal();

function runNode(script, args = []) {
  const r = spawnSync("node", [path.join("scripts", script), ...args], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  return r.status ?? 1;
}

function httpsReadyInSettings() {
  const p = path.join(root, "content/settings.json");
  if (!existsSync(p)) return false;
  const s = JSON.parse(readFileSync(p, "utf8"));
  return s.seo?.httpsReady === true;
}

async function httpsLive() {
  try {
    const res = await fetch(`https://www.xn--mascaf-gva.com/`, { method: "HEAD" });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Auto-desbloqueo HTTPS — mascafé.com");
  console.log("═══════════════════════════════════════════════════\n");

  if (await httpsLive() || httpsReadyInSettings()) {
    console.log("✅ HTTPS ya activo.\n");
    process.exit(0);
  }

  const hasGh =
    process.env.GH_PAGES_PAT || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const hasGodaddy = process.env.GODADDY_API_KEY && process.env.GODADDY_API_SECRET;
  const hasCf = process.env.CLOUDFLARE_API_TOKEN;

  if (hasGh) {
    console.log("▸ Fase 1: GitHub Pages kickstart nuclear (hasta 90 min)…\n");
    const code = runNode("enable-https.mjs", [
      "--wait",
      "--max-wait=90",
      "--kickstart",
      "--aggressive-kickstart",
      "--try-www",
      "--nuclear",
    ]);
    if (code === 0 && (await httpsLive() || httpsReadyInSettings())) {
      console.log("\n✅ HTTPS desbloqueado vía GitHub Pages.\n");
      process.exit(0);
    }
    console.log("\n○ GitHub Pages no emitió certificado aún.\n");
  } else {
    console.log("○ Sin GH_PAGES_PAT — omitiendo fase GitHub\n");
  }

  if (hasCf) {
    console.log("▸ Fase 2: Cloudflare SSL automático…\n");
    const code = runNode("setup-cloudflare-https.mjs", []);
    process.exit(code);
  }

  if (hasGodaddy && !hasGh) {
    console.log("▸ Solo GoDaddy — ejecutando domain:configure + enable-https…\n");
    runNode("configure-domain.mjs", []);
    runNode("enable-https.mjs", ["--kickstart", "--try-www", "--nuclear", "--wait", "--max-wait=45"]);
  }

  if (!hasGh && !hasCf) {
    console.error("❌ Faltan credenciales para desbloqueo automático.");
    console.error("   Mínimo: GH_PAGES_PAT en GitHub Secrets / .env.local");
    console.error("   Alternativa rápida: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID");
    console.error("   Guía: proyecto-mas-cafe/migracion/SOLUCION-HTTPS-BLOQUEADO.md\n");
    process.exit(1);
  }

  console.log("\n⏳ Ejecutado. Comprueba en 15 min: npm run domain:verify\n");
  process.exit(0);
}

main();

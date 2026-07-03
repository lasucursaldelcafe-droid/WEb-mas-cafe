#!/usr/bin/env node
/**
 * Punto de entrada para Cursor Cloud Agent — activa HTTPS en mascafé.com.
 *
 * 1. Si hay credenciales en .env.local o env → ejecuta enable-https localmente
 * 2. Si no → empuja rama cursor/* y abre PR para que GitHub Actions use los Secrets
 *
 * Uso:
 *   npm run domain:enable-https:cloud
 *   npm run domain:enable-https:cloud -- --wait --max-wait=45
 */
import { execSync, spawnSync } from "child_process";
import { existsSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import { upsertEnvLocal } from "./lib/upsert-env-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const BRANCH = "cursor/automatizar-https-eb8f";
const REPO = "lasucursaldelcafe-droid/WEb-mas-cafe";

loadEnvLocal();

function resolveGhToken() {
  return (
    process.env.GH_PAGES_PAT?.trim() ||
    process.env.GH_TOKEN?.trim() ||
    process.env.GITHUB_TOKEN?.trim() ||
    ""
  );
}

function hasGodaddyCreds() {
  return Boolean(process.env.GODADDY_API_KEY && process.env.GODADDY_API_SECRET);
}

function hasGithubToken() {
  return Boolean(resolveGhToken());
}

function runEnableHttps(extraArgs = []) {
  const base = ["node", "scripts/enable-https.mjs", "--kickstart", ...extraArgs];
  if (!extraArgs.includes("--no-wait")) {
    base.push("--wait");
    if (!extraArgs.some((a) => a.startsWith("--max-wait="))) {
      base.push("--max-wait=45");
    }
  }
  if (!hasGodaddyCreds()) base.push("--skip-godaddy");

  const result = spawnSync(base[0], base.slice(1), {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_TOKEN: resolveGhToken(),
    },
  });
  return result.status ?? 1;
}

function delegateToCi(extraArgs) {
  const marker = path.join(root, ".cloud-agent", "https-trigger.json");
  writeFileSync(
    marker,
    `${JSON.stringify({ triggeredAt: new Date().toISOString(), args: extraArgs }, null, 2)}\n`,
  );

  const ghToken = resolveGhToken();
  const env = { ...process.env, GH_TOKEN: ghToken, GITHUB_TOKEN: ghToken };

  console.log("\n▸ Delegando a GitHub Actions (Secrets: GODADDY_* + GH_PAGES_PAT)…\n");

  execSync("git fetch origin main", { cwd: root, stdio: "inherit", env });
  execSync(`git checkout -B ${BRANCH} origin/main`, { cwd: root, stdio: "inherit", env });
  execSync(`git add ${marker}`, { cwd: root, stdio: "inherit", env });
  execSync(`git commit -m "chore(domain): activar HTTPS mascafé.com vía CI [enable-https]"`, {
    cwd: root,
    stdio: "inherit",
    env,
  });
  execSync(`git push -u origin ${BRANCH} --force-with-lease`, { cwd: root, stdio: "inherit", env });

  let prUrl = "";
  try {
    prUrl = execSync(
      `gh pr list --head ${BRANCH} --json url --jq '.[0].url'`,
      { cwd: root, encoding: "utf8", env },
    ).trim();
  } catch {
    /* no existing PR */
  }

  if (!prUrl) {
    prUrl = execSync(
      `gh pr create --base main --head ${BRANCH} --title "Activar HTTPS mascafé.com" --body "Automatización Cloud Agent: ejecuta workflow enable-https con secrets del repo."`,
      { cwd: root, encoding: "utf8", env },
    ).trim();
  }

  console.log(`\n✅ PR creado/actualizado: ${prUrl}`);
  console.log("   Auto-merge fusionará → main → workflow «Activar HTTPS mascafé.com»\n");
  return 0;
}

function materializeEnvLocal() {
  const updates = {};
  if (process.env.GODADDY_API_KEY) updates.GODADDY_API_KEY = process.env.GODADDY_API_KEY;
  if (process.env.GODADDY_API_SECRET) updates.GODADDY_API_SECRET = process.env.GODADDY_API_SECRET;
  const gh = resolveGhToken();
  if (gh) {
    updates.GH_PAGES_PAT = gh;
    updates.GITHUB_TOKEN = gh;
  }
  if (Object.keys(updates).length) {
    upsertEnvLocal(updates);
    console.log("  ✓ .env.local materializado desde entorno\n");
  }
}

function main() {
  const extraArgs = process.argv.slice(2);

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Cloud Agent — HTTPS mascafé.com");
  console.log("═══════════════════════════════════════════════════");

  materializeEnvLocal();
  loadEnvLocal();

  if (hasGithubToken() && (hasGodaddyCreds() || extraArgs.includes("--skip-godaddy"))) {
    console.log("\n▸ Credenciales disponibles — ejecución local\n");
    process.exit(runEnableHttps(extraArgs));
  }

  if (hasGithubToken()) {
    console.log("\n▸ Sin GoDaddy local — intentando solo GitHub Pages API\n");
    const code = runEnableHttps([...extraArgs, "--skip-godaddy"]);
    if (code === 0) process.exit(0);
    console.log("\n▸ API local sin permisos Pages — delegando a CI…");
  } else {
    console.log("\n▸ Sin token con permisos — delegando a CI…");
  }

  if (!existsSync(path.join(root, ".git"))) {
    console.error("\n❌ No es un repositorio git\n");
    process.exit(1);
  }

  process.exit(delegateToCi(extraArgs));
}

main();

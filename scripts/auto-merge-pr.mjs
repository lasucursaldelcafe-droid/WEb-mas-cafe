#!/usr/bin/env node
/**
 * Fusiona automáticamente un PR de rama cursor/* tras validar el build.
 *
 * Uso:
 *   npm run pr:auto-merge              # fusiona el PR de la rama actual
 *   npm run pr:auto-merge -- 36        # fusiona el PR #36
 *   npm run pr:auto-merge -- --dry-run
 */
import { execSync } from "child_process";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const prArg = args.find((a) => /^\d+$/.test(a));

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", stdio: opts.inherit ? "inherit" : "pipe", ...opts });
}

function ghJson(cmd) {
  return JSON.parse(run(`gh ${cmd}`));
}

function validateBuild() {
  console.log("\n▸ Validando build antes de fusionar…\n");
  run("npm ci", { inherit: true });
  run("CI_SKIP_INFORME_SOURCE=1 npm run ci:validate", { inherit: true });
  console.log("\n✅ Validación OK\n");
}

function resolvePrNumber() {
  if (prArg) return Number(prArg);
  const branch = run("git branch --show-current").trim();
  const pr = ghJson(`pr list --head "${branch}" --json number --jq '.[0].number'`);
  if (!pr) throw new Error(`No hay PR abierto para la rama ${branch}`);
  return Number(pr);
}

function main() {
  const prNumber = resolvePrNumber();
  const pr = ghJson(
    `pr view ${prNumber} --json number,title,state,mergeable,isDraft,headRefName,baseRefName,url`,
  );

  console.log(`\n▸ PR #${pr.number}: ${pr.title}`);
  console.log(`  ${pr.url}`);
  console.log(`  Rama: ${pr.headRefName} → ${pr.baseRefName}`);

  if (pr.state !== "OPEN") {
    throw new Error(`PR #${prNumber} no está abierto (estado: ${pr.state})`);
  }
  if (!pr.headRefName.startsWith("cursor/")) {
    throw new Error(`Solo se fusionan ramas cursor/* (actual: ${pr.headRefName})`);
  }
  if (pr.mergeable === "CONFLICTING") {
    throw new Error(`PR #${prNumber} tiene conflictos`);
  }

  if (!dryRun) validateBuild();

  if (pr.isDraft) {
    console.log("▸ Marcando PR como listo para revisión…");
    if (!dryRun) run(`gh pr ready ${prNumber}`, { inherit: true });
  }

  const subject = pr.title.replace(/"/g, '\\"');
  const mergeCmd = `gh pr merge ${prNumber} --squash --delete-branch --subject "${subject}"`;

  if (dryRun) {
    console.log(`[dry-run] ${mergeCmd}`);
    return;
  }

  console.log("▸ Fusionando PR…");
  run(mergeCmd, { inherit: true });
  console.log("\n✅ PR fusionado. GitHub Actions publicará en ~1–2 min.\n");
}

main();

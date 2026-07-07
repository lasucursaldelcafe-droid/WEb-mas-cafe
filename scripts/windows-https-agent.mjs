#!/usr/bin/env node
/**
 * Puente npm → agente Python Windows (HTTPS mascafé.com).
 *
 * Uso:
 *   npm run domain:windows-agent -- status
 *   npm run domain:windows-agent -- fix
 *   npm run domain:windows-agent -- fix --ci
 *   npm run domain:windows-agent -- monitor --once
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const agentDir = path.join(root, "tools", "windows-https-agent");
const isWin = process.platform === "win32";
const venvPython = isWin
  ? path.join(agentDir, ".venv", "Scripts", "python.exe")
  : path.join(agentDir, ".venv", "bin", "python");
const venvPip = isWin
  ? path.join(agentDir, ".venv", "Scripts", "pip.exe")
  : path.join(agentDir, ".venv", "bin", "pip");

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { stdio: "inherit", cwd: root, ...opts });
}

function ensureVenv() {
  if (existsSync(venvPython)) return venvPython;

  const py = isWin ? "py" : "python3";
  const venvArgs = isWin
    ? ["-3", "-m", "venv", path.join(agentDir, ".venv")]
    : ["-m", "venv", path.join(agentDir, ".venv")];
  console.log("\n▸ Creando entorno Python del agente…\n");
  const created = run(py, venvArgs);
  if (created.status === 0 && existsSync(venvPython)) {
    run(venvPip, ["install", "-q", "-r", path.join(agentDir, "requirements.txt")]);
    return venvPython;
  }

  console.log("▸ venv no disponible — usando Python del sistema\n");
  run(py, ["-m", "pip", "install", "-q", "-r", path.join(agentDir, "requirements.txt")]);
  return py;
}

const python = ensureVenv();
const args = ["-m", "mascafe_agent", ...process.argv.slice(2)];

const result = spawnSync(python, args, {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    PYTHONPATH: agentDir,
  },
});

process.exit(result.status ?? 1);

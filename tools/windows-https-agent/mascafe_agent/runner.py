"""Ejecuta scripts Node/npm del repositorio y registra logs."""

from __future__ import annotations

import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from .env_loader import has_github_token, load_project_env, repo_root


def _log_dir(root: Path) -> Path:
    logs = root / "tools" / "windows-https-agent" / "logs"
    logs.mkdir(parents=True, exist_ok=True)
    return logs


def append_log(root: Path, message: str) -> None:
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{stamp}] {message}\n"
    log_file = _log_dir(root) / "agent.log"
    with log_file.open("a", encoding="utf-8") as fh:
        fh.write(line)
    print(line, end="")


def find_npm() -> str:
    npm = shutil.which("npm")
    if not npm:
        raise RuntimeError(
            "npm no está en PATH. Instala Node.js 22+ desde https://nodejs.org/"
        )
    return npm


def run_npm_script(
    root: Path,
    script: str,
    extra_args: list[str] | None = None,
    *,
    timeout_sec: int | None = None,
) -> int:
    npm = find_npm()
    cmd = [npm, "run", script]
    if extra_args:
        cmd.extend(["--", *extra_args])
    append_log(root, f"Ejecutando: {' '.join(cmd)}")
    try:
        proc = subprocess.run(
            cmd,
            cwd=root,
            env=None,
            timeout=timeout_sec,
        )
        append_log(root, f"Salida código {proc.returncode}")
        return proc.returncode
    except subprocess.TimeoutExpired:
        append_log(root, "TIMEOUT — proceso cancelado")
        return 124


def run_enable_https(
    root: Path,
    *,
    wait_minutes: int = 45,
    kickstart: bool = True,
    try_www: bool = True,
    skip_godaddy: bool = False,
) -> int:
    args = [
        "--wait",
        f"--max-wait={wait_minutes}",
    ]
    if kickstart:
        args.append("--kickstart")
        args.append("--aggressive-kickstart")
    if try_www:
        args.append("--try-www")
    if skip_godaddy:
        args.append("--skip-godaddy")
    timeout = (wait_minutes + 15) * 60
    return run_npm_script(
        root,
        "domain:enable-https",
        args,
        timeout_sec=timeout,
    )


def run_verify(root: Path) -> int:
    return run_npm_script(root, "domain:verify", timeout_sec=120)


def ensure_node_deps(root: Path) -> None:
    npm = find_npm()
    if not (root / "node_modules").is_dir():
        append_log(root, "Instalando dependencias npm (npm ci)…")
        subprocess.run([npm, "ci"], cwd=root, check=True)


def bootstrap_env(root: Path | None = None) -> Path:
    project_root = load_project_env(root)
    append_log(project_root, "Entorno cargado desde .env.local")
    return project_root


def python_executable() -> str:
    return sys.executable

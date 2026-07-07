"""Carga .env.local desde la raíz del repositorio."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


def repo_root(start: Path | None = None) -> Path:
    """Sube directorios hasta encontrar package.json del proyecto."""
    current = (start or Path(__file__)).resolve()
    if current.is_file():
        current = current.parent
    for parent in [current, *current.parents]:
        if (parent / "package.json").is_file() and (parent / "scripts").is_dir():
            return parent
    raise FileNotFoundError(
        "No se encontró la raíz del repo (package.json + scripts/). "
        "Ejecuta desde la carpeta WEb-mas-cafe clonada."
    )


def load_project_env(root: Path | None = None) -> Path:
    """Carga variables desde .env.local sin sobrescribir las ya definidas."""
    project_root = root or repo_root()
    env_path = project_root / ".env.local"
    if env_path.is_file():
        load_dotenv(env_path, override=False)
    return project_root


def github_token() -> str:
    return (
        os.environ.get("GH_PAGES_PAT", "").strip()
        or os.environ.get("GH_TOKEN", "").strip()
        or os.environ.get("GITHUB_TOKEN", "").strip()
    )


def has_godaddy_creds() -> bool:
    return bool(
        os.environ.get("GODADDY_API_KEY", "").strip()
        and os.environ.get("GODADDY_API_SECRET", "").strip()
    )


def has_github_token() -> bool:
    return bool(github_token())

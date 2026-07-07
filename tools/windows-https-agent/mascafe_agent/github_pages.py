"""Cliente mínimo GitHub Pages API (solo lectura + dispatch workflow)."""

from __future__ import annotations

import json
from typing import Any

import requests

from .config import GITHUB_OWNER, GITHUB_REPO_NAME, WORKFLOW_DISPATCH_URL
from .env_loader import github_token


class GitHubPagesClient:
    def __init__(self, token: str | None = None) -> None:
        self._token = token or github_token()
        if not self._token:
            raise ValueError(
                "Falta GH_PAGES_PAT o GITHUB_TOKEN en .env.local"
            )

    def _headers(self) -> dict[str, str]:
        return {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {self._token}",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    def get_pages_config(self) -> dict[str, Any] | None:
        url = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO_NAME}/pages"
        res = requests.get(url, headers=self._headers(), timeout=30)
        if res.status_code == 404:
            return None
        res.raise_for_status()
        return res.json()

    def cert_state(self) -> str:
        pages = self.get_pages_config()
        if not pages:
            return "no_pages"
        cert = pages.get("https_certificate") or {}
        return str(cert.get("state") or "unknown")

    def custom_domain(self) -> str | None:
        pages = self.get_pages_config()
        if not pages:
            return None
        return pages.get("cname")

    def https_enforced(self) -> bool:
        pages = self.get_pages_config()
        return bool(pages and pages.get("https_enforced"))

    def dispatch_enable_https(
        self,
        wait_minutes: int = 45,
        kickstart: bool = True,
    ) -> None:
        payload = {
            "ref": "main",
            "inputs": {
                "wait_minutes": str(wait_minutes),
                "kickstart": "true" if kickstart else "false",
            },
        }
        res = requests.post(
            WORKFLOW_DISPATCH_URL,
            headers={**self._headers(), "Content-Type": "application/json"},
            data=json.dumps(payload),
            timeout=30,
        )
        if res.status_code not in (200, 204):
            raise RuntimeError(
                f"workflow_dispatch falló ({res.status_code}): {res.text}"
            )

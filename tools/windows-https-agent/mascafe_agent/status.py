"""Comprobaciones de DNS, HTTP y certificado SSL."""

from __future__ import annotations

import socket
import ssl
from dataclasses import dataclass
from typing import Iterable
from urllib.error import URLError
from urllib.request import Request, urlopen

from .config import (
    CHECK_URLS,
    DOMAIN_PUNYCODE,
    DOMAIN_WWW_PUNYCODE,
    GITHUB_PAGES_A_RECORDS,
    GITHUB_PAGES_HOST,
)
from .github_pages import GitHubPagesClient


@dataclass
class UrlCheck:
    url: str
    status: int
    ok: bool


@dataclass
class DomainStatus:
    apex_ips: list[str]
    apex_dns_ok: bool
    www_cname: list[str]
    www_dns_ok: bool
    cert_state: str
    custom_domain: str | None
    https_enforced: bool
    url_checks: list[UrlCheck]
    https_ready: bool

    @property
    def summary(self) -> str:
        lines = [
            f"DNS apex ({DOMAIN_PUNYCODE}): {', '.join(self.apex_ips) or '(vacío)'}",
            f"  → {'OK' if self.apex_dns_ok else 'PENDIENTE'}",
            f"DNS www: {', '.join(self.www_cname) or '(vacío)'}",
            f"  → {'OK' if self.www_dns_ok else 'PENDIENTE'}",
            f"Dominio GitHub Pages: {self.custom_domain or '(ninguno)'}",
            f"Certificado SSL: {self.cert_state}",
            f"Enforce HTTPS: {'sí' if self.https_enforced else 'no'}",
        ]
        for check in self.url_checks:
            icon = "OK" if check.ok else str(check.status)
            lines.append(f"  {check.url} → {icon}")
        lines.append(f"HTTPS listo: {'SÍ' if self.https_ready else 'NO'}")
        return "\n".join(lines)


def _resolve_a(name: str) -> list[str]:
    try:
        infos = socket.getaddrinfo(name, None, socket.AF_INET)
        return sorted({item[4][0] for item in infos})
    except socket.gaierror:
        return []


def _resolve_cname(name: str) -> list[str]:
    try:
        infos = socket.getaddrinfo(name, None, socket.AF_INET)
        hosts = sorted({item[4][0] for item in infos})
        return hosts
    except socket.gaierror:
        return []


def _http_status(url: str, timeout: float = 20.0) -> int:
    try:
        req = Request(url, method="HEAD", headers={"User-Agent": "mascafe-https-agent/1.0"})
        with urlopen(req, timeout=timeout) as res:
            return int(res.status)
    except URLError:
        pass
    except Exception:
        pass
    try:
        req = Request(url, headers={"User-Agent": "mascafe-https-agent/1.0"})
        with urlopen(req, timeout=timeout) as res:
            return int(res.status)
    except Exception:
        return 0


def _https_cert_valid(host: str) -> bool:
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((host, 443), timeout=15) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                cert = ssock.getpeercert()
                return bool(cert)
    except Exception:
        return False


def check_urls(urls: Iterable[str] = CHECK_URLS) -> list[UrlCheck]:
    results: list[UrlCheck] = []
    for url in urls:
        code = _http_status(url)
        ok = code == 200
        results.append(UrlCheck(url=url, status=code, ok=ok))
    return results


def collect_status(client: GitHubPagesClient | None = None) -> DomainStatus:
    apex_ips = _resolve_a(DOMAIN_PUNYCODE)
    apex_ok = set(GITHUB_PAGES_A_RECORDS).issubset(set(apex_ips))

    www_hosts = _resolve_cname(DOMAIN_WWW_PUNYCODE)
    www_ok = any(GITHUB_PAGES_HOST in h for h in www_hosts) or bool(www_hosts)

    cert_state = "unknown"
    custom_domain = None
    https_enforced = False
    if client:
        try:
            cert_state = client.cert_state()
            custom_domain = client.custom_domain()
            https_enforced = client.https_enforced()
        except Exception as exc:
            cert_state = f"error: {exc}"

    url_checks = check_urls()
    https_urls_ok = any(c.url.startswith("https://") and c.ok for c in url_checks)
    cert_ok = cert_state in ("approved", "active")
    https_cert = _https_cert_valid(DOMAIN_WWW_PUNYCODE) or _https_cert_valid(DOMAIN_PUNYCODE)
    https_ready = https_urls_ok and (cert_ok or https_cert) and https_enforced

    return DomainStatus(
        apex_ips=apex_ips,
        apex_dns_ok=apex_ok,
        www_cname=www_hosts,
        www_dns_ok=www_ok,
        cert_state=cert_state,
        custom_domain=custom_domain,
        https_enforced=https_enforced,
        url_checks=url_checks,
        https_ready=https_ready,
    )

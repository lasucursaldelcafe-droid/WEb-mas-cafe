"""Constantes del dominio Más Café (alineadas con scripts/lib/domain-config.mjs)."""

from __future__ import annotations

DOMAIN_DISPLAY = "mascafé.com"
DOMAIN_WWW = "www.mascafé.com"
DOMAIN_PUNYCODE = "xn--mascaf-gva.com"
DOMAIN_WWW_PUNYCODE = f"www.{DOMAIN_PUNYCODE}"

GITHUB_PAGES_HOST = "lasucursaldelcafe-droid.github.io"
GITHUB_REPO = "lasucursaldelcafe-droid/WEb-mas-cafe"
GITHUB_OWNER, GITHUB_REPO_NAME = GITHUB_REPO.split("/")

GITHUB_PAGES_A_RECORDS = (
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
)

GITHUB_PAGES_SETTINGS = f"https://github.com/{GITHUB_REPO}/settings/pages"
GODADDY_DNS_PANEL = (
    f"https://dcc.godaddy.com/control/dnsmanagement?domainName={DOMAIN_PUNYCODE}"
)
WORKFLOW_ENABLE_HTTPS = "enable-https.yml"
WORKFLOW_DISPATCH_URL = (
    f"https://api.github.com/repos/{GITHUB_REPO}/actions/workflows/"
    f"{WORKFLOW_ENABLE_HTTPS}/dispatches"
)

CHECK_URLS = (
    f"https://{DOMAIN_PUNYCODE}/",
    f"https://{DOMAIN_WWW_PUNYCODE}/",
    f"http://{DOMAIN_PUNYCODE}/",
    f"http://{DOMAIN_WWW_PUNYCODE}/",
)

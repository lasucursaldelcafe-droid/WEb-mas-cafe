"""Punto de entrada CLI — agente HTTPS mascafé.com para Windows."""

from __future__ import annotations

import argparse
import sys
import time

from . import __version__
from .config import GITHUB_PAGES_SETTINGS, GODADDY_DNS_PANEL
from .env_loader import has_github_token, has_godaddy_creds, load_project_env
from .github_pages import GitHubPagesClient
from .runner import (
    append_log,
    bootstrap_env,
    ensure_node_deps,
    run_enable_https,
    run_verify,
)
from .status import collect_status


def cmd_status(_: argparse.Namespace) -> int:
    root = bootstrap_env()
    client = GitHubPagesClient() if has_github_token() else None
    status = collect_status(client)
    print("\n═══════════════════════════════════════════════════")
    print("  Estado — mascafé.com")
    print("═══════════════════════════════════════════════════\n")
    print(status.summary)
    print(f"\nGitHub Pages: {GITHUB_PAGES_SETTINGS}")
    print(f"DNS GoDaddy:  {GODADDY_DNS_PANEL}\n")
    return 0 if status.https_ready else 1


def cmd_fix(args: argparse.Namespace) -> int:
    root = bootstrap_env()
    append_log(root, "=== Inicio fix HTTPS ===")

    if args.ci:
        if not has_github_token():
            print("❌ Falta GH_PAGES_PAT en .env.local para disparar CI")
            return 1
        client = GitHubPagesClient()
        client.dispatch_enable_https(
            wait_minutes=args.wait,
            kickstart=not args.no_kickstart,
        )
        append_log(root, "Workflow enable-https disparado en GitHub Actions")
        print("\n✅ Workflow «Activar HTTPS mascafé.com» en ejecución.")
        print("   Monitor: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/enable-https.yml\n")
        return 0

    ensure_node_deps(root)
    skip_godaddy = args.skip_godaddy or not has_godaddy_creds()
    if skip_godaddy:
        append_log(root, "GoDaddy omitido (sin credenciales o --skip-godaddy)")

    code = run_enable_https(
        root,
        wait_minutes=args.wait,
        kickstart=not args.no_kickstart,
        try_www=not args.no_try_www,
        skip_godaddy=skip_godaddy,
    )
    run_verify(root)
    append_log(root, f"=== Fin fix HTTPS (código {code}) ===")
    return code


def cmd_monitor(args: argparse.Namespace) -> int:
    root = bootstrap_env()
    interval = max(args.interval, 60)
    append_log(root, f"Monitor iniciado — intervalo {interval}s")

    while True:
        client = GitHubPagesClient() if has_github_token() else None
        status = collect_status(client)
        append_log(root, f"Monitor: cert={status.cert_state} https_ready={status.https_ready}")

        if status.https_ready:
            append_log(root, "HTTPS listo — monitor en espera")
            print("\n✅ HTTPS activo. El monitor seguirá comprobando cada ciclo.\n")
        else:
            append_log(root, "HTTPS pendiente — ejecutando fix")
            ensure_node_deps(root)
            run_enable_https(
                root,
                wait_minutes=min(args.wait, 15),
                kickstart=True,
                try_www=True,
                skip_godaddy=not has_godaddy_creds(),
            )

        if args.once:
            break
        time.sleep(interval)

    return 0


def cmd_tray(_: argparse.Namespace) -> int:
    try:
        from .tray import run_tray
    except ImportError:
        print(
            "❌ Bandeja del sistema requiere dependencias opcionales:\n"
            "   pip install pystray Pillow\n"
        )
        return 1
    run_tray()
    return 0


def cmd_gui(_: argparse.Namespace) -> int:
    from .gui import run_gui

    run_gui()
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="mascafe-https-agent",
        description="Agente Windows para automatizar HTTPS en mascafé.com",
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("status", help="Mostrar estado DNS/SSL/HTTPS")

    fix = sub.add_parser("fix", help="Activar HTTPS (local npm o CI)")
    fix.add_argument("--ci", action="store_true", help="Disparar GitHub Actions en lugar de npm local")
    fix.add_argument("--wait", type=int, default=45, help="Minutos máximos esperando certificado")
    fix.add_argument("--no-kickstart", action="store_true", help="No forzar kickstart SSL")
    fix.add_argument("--no-try-www", action="store_true", help="No usar fallback www")
    fix.add_argument("--skip-godaddy", action="store_true", help="Omitir API GoDaddy")

    mon = sub.add_parser("monitor", help="Bucle: comprobar y reparar HTTPS periódicamente")
    mon.add_argument("--interval", type=int, default=10800, help="Segundos entre ciclos (default 3h)")
    mon.add_argument("--wait", type=int, default=15, help="Minutos de espera por ciclo de fix")
    mon.add_argument("--once", action="store_true", help="Un solo ciclo y salir")

    sub.add_parser("tray", help="Icono en bandeja del sistema (Windows)")
    sub.add_parser("gui", help="Abrir aplicación Windows con interfaz gráfica")

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    handlers = {
        "status": cmd_status,
        "fix": cmd_fix,
        "monitor": cmd_monitor,
        "tray": cmd_tray,
        "gui": cmd_gui,
    }
    return handlers[args.command](args)


if __name__ == "__main__":
    sys.exit(main())

"""Bandeja del sistema Windows — control manual del agente HTTPS."""

from __future__ import annotations

import threading
import webbrowser

import pystray
from PIL import Image, ImageDraw

from .config import GITHUB_PAGES_SETTINGS
from .runner import bootstrap_env, run_enable_https, run_verify
from .status import collect_status
from .env_loader import has_github_token, has_godaddy_creds
from .github_pages import GitHubPagesClient


def _icon_image() -> Image.Image:
    size = 64
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse((4, 4, size - 4, size - 4), fill=(101, 67, 33))
    draw.ellipse((18, 18, 46, 46), fill=(255, 248, 240))
    return img


def run_tray() -> None:
    root = bootstrap_env()
    state = {"busy": False}

    def worker(fn):
        if state["busy"]:
            return
        state["busy"] = True

        def task():
            try:
                fn()
            finally:
                state["busy"] = False

        threading.Thread(target=task, daemon=True).start()

    def on_status(_icon, _item):
        def do():
            client = GitHubPagesClient() if has_github_token() else None
            status = collect_status(client)
            print(status.summary)

        worker(do)

    def on_fix(_icon, _item):
        def do():
            run_enable_https(
                root,
                wait_minutes=15,
                kickstart=True,
                try_www=True,
                skip_godaddy=not has_godaddy_creds(),
            )
            run_verify(root)

        worker(do)

    def on_open_github(_icon, _item):
        webbrowser.open(GITHUB_PAGES_SETTINGS)

    def on_quit(icon, _item):
        icon.stop()

    menu = pystray.Menu(
        pystray.MenuItem("Estado HTTPS", on_status),
        pystray.MenuItem("Reparar ahora", on_fix),
        pystray.MenuItem("Abrir GitHub Pages", on_open_github),
        pystray.MenuItem("Salir", on_quit),
    )
    icon = pystray.Icon("mascafe-https", _icon_image(), "Más Café HTTPS", menu)
    icon.run()

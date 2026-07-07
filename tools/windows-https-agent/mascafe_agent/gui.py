"""Interfaz gráfica Windows (tkinter) — Agente HTTPS mascafé.com."""

from __future__ import annotations

import threading
import tkinter as tk
import webbrowser
from tkinter import messagebox, scrolledtext, ttk

from .config import DOMAIN_DISPLAY, GITHUB_PAGES_SETTINGS, GODADDY_DNS_PANEL
from .env_loader import has_github_token, has_godaddy_creds, load_project_env
from .github_pages import GitHubPagesClient
from .runner import append_log, bootstrap_env, ensure_node_deps, run_enable_https
from .status import collect_status, DomainStatus


class HttpsAgentApp(tk.Tk):
    AUTO_INTERVAL_MS = 3 * 60 * 60 * 1000  # 3 horas

    def __init__(self) -> None:
        super().__init__()
        self.title(f"Más Café — Agente HTTPS ({DOMAIN_DISPLAY})")
        self.geometry("640x520")
        self.minsize(520, 420)
        self._busy = False
        self._auto_job: str | None = None
        self._root = bootstrap_env()

        self._build_ui()
        self.after(300, self._refresh_status)

    def _build_ui(self) -> None:
        header = ttk.Label(
            self,
            text="Automatización HTTPS — mascafé.com",
            font=("Segoe UI", 14, "bold"),
        )
        header.pack(pady=(12, 4))

        creds = []
        if has_godaddy_creds():
            creds.append("GoDaddy ✓")
        else:
            creds.append("GoDaddy ✗")
        if has_github_token():
            creds.append("GitHub ✓")
        else:
            creds.append("GitHub ✗")
        ttk.Label(self, text="Credenciales: " + " · ".join(creds)).pack()

        self._status_var = tk.StringVar(value="Cargando…")
        status_frame = ttk.LabelFrame(self, text="Estado del dominio", padding=8)
        status_frame.pack(fill="both", expand=False, padx=12, pady=8)
        ttk.Label(
            status_frame,
            textvariable=self._status_var,
            justify="left",
            font=("Consolas", 10),
        ).pack(anchor="w")

        btn_frame = ttk.Frame(self)
        btn_frame.pack(fill="x", padx=12, pady=4)

        ttk.Button(btn_frame, text="Actualizar", command=self._refresh_status).pack(
            side="left", padx=2
        )
        ttk.Button(btn_frame, text="Reparar ahora", command=self._on_fix_local).pack(
            side="left", padx=2
        )
        ttk.Button(btn_frame, text="Reparar vía CI", command=self._on_fix_ci).pack(
            side="left", padx=2
        )
        ttk.Button(btn_frame, text="GitHub Pages", command=self._open_github).pack(
            side="left", padx=2
        )
        ttk.Button(btn_frame, text="DNS GoDaddy", command=self._open_godaddy).pack(
            side="left", padx=2
        )

        self._auto_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(
            self,
            text="Auto-reparar cada 3 horas mientras la app esté abierta",
            variable=self._auto_var,
            command=self._toggle_auto,
        ).pack(anchor="w", padx=12)

        self._progress = ttk.Progressbar(self, mode="indeterminate")
        self._progress.pack(fill="x", padx=12, pady=4)

        log_frame = ttk.LabelFrame(self, text="Registro", padding=4)
        log_frame.pack(fill="both", expand=True, padx=12, pady=8)
        self._log = scrolledtext.ScrolledText(
            log_frame, height=8, font=("Consolas", 9), state="disabled"
        )
        self._log.pack(fill="both", expand=True)

        self.protocol("WM_DELETE_WINDOW", self._on_close)

    def _log_line(self, msg: str) -> None:
        self._log.configure(state="normal")
        self._log.insert("end", msg + "\n")
        self._log.see("end")
        self._log.configure(state="disabled")

    def _set_busy(self, busy: bool) -> None:
        self._busy = busy
        if busy:
            self._progress.start(12)
        else:
            self._progress.stop()

    def _run_bg(self, label: str, fn) -> None:
        if self._busy:
            messagebox.showinfo("Ocupado", "Espera a que termine la tarea actual.")
            return

        def worker() -> None:
            self.after(0, lambda: self._set_busy(True))
            self.after(0, lambda: self._log_line(f"▸ {label}…"))
            try:
                fn()
                self.after(0, lambda: self._log_line(f"✓ {label} completado"))
            except Exception as exc:
                self.after(0, lambda: self._log_line(f"✗ Error: {exc}"))
            finally:
                self.after(0, lambda: self._set_busy(False))
                self.after(0, self._refresh_status)

        threading.Thread(target=worker, daemon=True).start()

    def _format_status(self, status: DomainStatus) -> str:
        https_icon = "✅ LISTO" if status.https_ready else "❌ PENDIENTE"
        return (
            f"HTTPS: {https_icon}\n"
            f"DNS apex: {'OK' if status.apex_dns_ok else 'PENDIENTE'}\n"
            f"DNS www:  {'OK' if status.www_dns_ok else 'PENDIENTE'}\n"
            f"Dominio GitHub: {status.custom_domain or '(ninguno)'}\n"
            f"Certificado SSL: {status.cert_state}\n"
            f"Enforce HTTPS: {'sí' if status.https_enforced else 'no'}"
        )

    def _refresh_status(self) -> None:
        def do() -> None:
            client = GitHubPagesClient() if has_github_token() else None
            status = collect_status(client)
            text = self._format_status(status)
            self.after(0, lambda: self._status_var.set(text))
            if status.https_ready:
                append_log(self._root, "GUI: HTTPS listo")

        threading.Thread(target=do, daemon=True).start()

    def _on_fix_local(self) -> None:
        def do() -> None:
            append_log(self._root, "GUI: fix local")
            ensure_node_deps(self._root)
            run_enable_https(
                self._root,
                wait_minutes=15,
                kickstart=True,
                try_www=True,
                skip_godaddy=not has_godaddy_creds(),
            )

        self._run_bg("Reparar HTTPS (local)", do)

    def _on_fix_ci(self) -> None:
        if not has_github_token():
            messagebox.showerror(
                "Sin token",
                "Añade GH_PAGES_PAT en .env.local para disparar GitHub Actions.",
            )
            return

        def do() -> None:
            client = GitHubPagesClient()
            client.dispatch_enable_https(wait_minutes=45, kickstart=True)
            append_log(self._root, "GUI: workflow CI disparado")

        self._run_bg("Reparar vía GitHub Actions", do)

    def _open_github(self) -> None:
        webbrowser.open(GITHUB_PAGES_SETTINGS)

    def _open_godaddy(self) -> None:
        webbrowser.open(GODADDY_DNS_PANEL)

    def _auto_cycle(self) -> None:
        if not self._auto_var.get():
            return
        self._log_line("▸ Ciclo automático…")

        def do() -> None:
            client = GitHubPagesClient() if has_github_token() else None
            status = collect_status(client)
            if status.https_ready:
                append_log(self._root, "Auto: HTTPS OK")
                return
            if has_github_token() and not has_godaddy_creds():
                GitHubPagesClient().dispatch_enable_https(wait_minutes=15, kickstart=True)
                append_log(self._root, "Auto: CI disparado")
            else:
                ensure_node_deps(self._root)
                run_enable_https(
                    self._root,
                    wait_minutes=10,
                    kickstart=True,
                    try_www=True,
                    skip_godaddy=not has_godaddy_creds(),
                )
                append_log(self._root, "Auto: fix local")

        def worker() -> None:
            try:
                do()
            except Exception as exc:
                self.after(0, lambda: self._log_line(f"✗ Auto: {exc}"))
            self.after(0, self._refresh_status)
            self._schedule_auto()

        threading.Thread(target=worker, daemon=True).start()

    def _schedule_auto(self) -> None:
        if self._auto_job:
            self.after_cancel(self._auto_job)
            self._auto_job = None
        if self._auto_var.get():
            self._auto_job = self.after(self.AUTO_INTERVAL_MS, self._auto_cycle)

    def _toggle_auto(self) -> None:
        if self._auto_var.get():
            self._log_line("Auto-reparación activada (cada 3 h)")
            self._schedule_auto()
        else:
            if self._auto_job:
                self.after_cancel(self._auto_job)
                self._auto_job = None
            self._log_line("Auto-reparación desactivada")

    def _on_close(self) -> None:
        if self._auto_job:
            self.after_cancel(self._auto_job)
        self.destroy()


def run_gui() -> None:
    load_project_env()
    app = HttpsAgentApp()
    app._schedule_auto()
    app.mainloop()

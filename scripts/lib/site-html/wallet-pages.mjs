/**
 * Genera páginas /wallet/ (cliente) y /caja/ (mostrador).
 */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadSite, faviconHead } from "./shared.mjs";
import { FIREBASE_CONFIG, FUNCTIONS_REGION } from "../../wallet/firebase-shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firebaseBootScript() {
  return `<script>
window.FIREBASE_CONFIG = ${JSON.stringify(FIREBASE_CONFIG, null, 2)};
window.FIREBASE_FUNCTIONS_REGION = ${JSON.stringify(FUNCTIONS_REGION)};
</script>`;
}

export function generateWalletPage() {
  const site = loadSite();
  const brand = site.brand?.name || "Más Café";
  const logo = "../images/brand/horizontal-azul.png";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <meta name="theme-color" content="#073954"/>
  <meta name="description" content="Tarjeta de fidelización ${escapeHtml(brand)} — acumula puntos y canjea premios"/>
  <title>Mi wallet · ${escapeHtml(brand)}</title>
  ${faviconHead(1)}
  <link rel="stylesheet" href="./wallet.css"/>
  <link rel="manifest" href="./manifest.webmanifest"/>
  ${firebaseBootScript()}
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js" defer></script>
</head>
<body>
  <div class="wallet-shell">
    <header class="wallet-top">
      <div class="wallet-brand">
        <img src="${logo}" alt="${escapeHtml(brand)}"/>
        <span>Mi wallet</span>
      </div>
      <button type="button" class="btn btn-ghost hidden" id="btn-logout">Salir</button>
    </header>

    <main class="wallet-main">
      <section id="view-auth">
        <div class="card">
          <h2 class="section">Programa de fidelización</h2>
          <p style="font-size:.88rem;color:var(--muted);margin-bottom:1rem">
            Regístrate o inicia sesión para ver tu saldo, QR en mostrador y canjear premios.
          </p>
          <div id="auth-msg" class="msg msg-error hidden" role="alert"></div>
          <div class="field">
            <label for="auth-name">Nombre (solo registro)</label>
            <input id="auth-name" type="text" autocomplete="name" placeholder="Tu nombre"/>
          </div>
          <div class="field">
            <label for="auth-email">Correo</label>
            <input id="auth-email" type="email" autocomplete="email" placeholder="tu@correo.com"/>
          </div>
          <div class="field">
            <label for="auth-password">Contraseña</label>
            <input id="auth-password" type="password" autocomplete="current-password" placeholder="Mínimo 6 caracteres"/>
          </div>
          <button type="button" class="btn btn-primary btn-block" id="btn-login">Iniciar sesión</button>
          <button type="button" class="btn btn-blue btn-block" id="btn-register" style="margin-top:.5rem">Crear cuenta</button>
          <button type="button" class="btn btn-ghost btn-block" id="btn-google" style="margin-top:.5rem">Continuar con Google</button>
        </div>
      </section>

      <section id="view-app" class="hidden">
        <div id="app-msg" class="msg msg-error hidden" role="alert"></div>
        <p id="program-hint" style="font-size:.78rem;color:var(--muted);margin-bottom:.75rem"></p>

        <div class="card pass-card">
          <p class="pass-label">Puntos disponibles</p>
          <p class="pass-points" id="points-balance">0 <small>pts</small></p>
          <div class="pass-meta">
            <div><span>Miembro</span><strong id="member-name">—</strong></div>
            <div><span>ID</span><strong id="member-id">—</strong></div>
            <div><span>Nivel</span><strong id="member-tier">—</strong></div>
            <div><span>Correo</span><strong id="member-email">—</strong></div>
          </div>
          <div class="pass-progress">
            <p id="progress-label" style="font-size:.78rem;opacity:.9"></p>
            <div class="pass-progress-bar"><div class="pass-progress-fill" id="progress-fill" style="width:0"></div></div>
          </div>
        </div>

        <nav class="tabs" aria-label="Secciones wallet">
          <button type="button" class="tab active" data-tab="tarjeta">QR</button>
          <button type="button" class="tab" data-tab="historial">Historial</button>
          <button type="button" class="tab" data-tab="premios">Premios</button>
          <button type="button" class="tab" data-tab="canje">Canje</button>
        </nav>

        <div data-panel="tarjeta">
          <div class="card">
            <h2 class="section">Muestra este QR en caja</h2>
            <div class="qr-wrap" id="qr-box"></div>
            <p style="text-align:center;font-size:.82rem;color:var(--muted);margin-top:.5rem">
              También puedes dictar tu ID: <strong id="member-id-copy">—</strong>
            </p>
          </div>
        </div>

        <div data-panel="historial" class="hidden">
          <div class="card"><div id="ledger-list"></div></div>
        </div>

        <div data-panel="premios" class="hidden">
          <div id="rewards-list"></div>
        </div>

        <div data-panel="canje" class="hidden">
          <div class="card hidden" id="pending-box">
            <h2 class="section">Código activo</h2>
            <p style="font-size:.85rem;margin-bottom:.35rem" id="pending-reward"></p>
            <div class="code-box"><span class="code" id="pending-code"></span></div>
            <p style="font-size:.78rem;color:var(--muted)">Válido 30 minutos en mostrador</p>
          </div>
          <div id="redeem-msg" class="msg msg-error hidden" role="alert"></div>
        </div>
      </section>
    </main>

    <footer class="wallet-footer">${escapeHtml(brand)} · Fidelización digital</footer>
  </div>
  <script type="module" src="./wallet-app.js"></script>
</body>
</html>`;
}

export function generateCajaPage() {
  const site = loadSite();
  const brand = site.brand?.name || "Más Café";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="robots" content="noindex, nofollow"/>
  <meta name="theme-color" content="#073954"/>
  <title>Modo caja · ${escapeHtml(brand)}</title>
  ${faviconHead(1)}
  <link rel="stylesheet" href="../wallet/wallet.css"/>
  ${firebaseBootScript()}
</head>
<body>
  <div class="caja-shell">
    <header class="wallet-top" style="padding-left:0;padding-right:0">
      <div class="wallet-brand">
        <span>Modo caja · ${escapeHtml(brand)}</span>
      </div>
      <button type="button" class="btn btn-ghost hidden" id="btn-lock">Cerrar sesión</button>
    </header>

    <section id="pin-gate" class="pin-gate card">
      <h2 class="section">PIN de mostrador</h2>
      <p style="font-size:.85rem;color:var(--muted);margin-bottom:1rem">
        Solo personal autorizado. PIN inicial: <code>123456</code> (cámbialo desde admin).
      </p>
      <div id="pin-msg" class="msg msg-error hidden" role="alert"></div>
      <div class="field">
        <label for="staff-pin">PIN</label>
        <input id="staff-pin" type="password" inputmode="numeric" autocomplete="off" placeholder="••••••"/>
      </div>
      <button type="button" class="btn btn-blue btn-block" id="btn-unlock">Entrar</button>
    </section>

    <section id="caja-app" class="hidden">
      <p id="program-rules" style="font-size:.78rem;color:var(--muted);margin-bottom:1rem"></p>
      <div class="caja-grid caja-grid-2">
        <div class="card">
          <h2 class="section">Buscar cliente</h2>
          <div id="search-msg" class="msg msg-error hidden" role="alert"></div>
          <div class="field">
            <label for="search-query">ID o correo</label>
            <input id="search-query" type="text" placeholder="MC-000001 o correo"/>
          </div>
          <button type="button" class="btn btn-blue btn-block" id="btn-search">Buscar</button>
          <div id="search-result"></div>
        </div>

        <div class="card">
          <h2 class="section">Sumar puntos (automático)</h2>
          <div id="purchase-msg" class="msg msg-error hidden" role="alert"></div>
          <div class="field">
            <label for="purchase-member">ID miembro</label>
            <input id="purchase-member" type="text" placeholder="MC-000001"/>
          </div>
          <div class="field">
            <label for="purchase-amount">Monto compra (COP)</label>
            <input id="purchase-amount" type="number" min="0" step="1000" placeholder="25000"/>
          </div>
          <div class="field">
            <label for="purchase-note">Nota (opcional)</label>
            <input id="purchase-note" type="text" placeholder="Compra mostrador"/>
          </div>
          <button type="button" class="btn btn-primary btn-block" id="btn-add-points">Acreditar puntos</button>
          <div id="purchase-result"></div>
        </div>
      </div>

      <div class="card" style="margin-top:1rem">
        <h2 class="section">Validar canje</h2>
        <div id="redeem-msg" class="msg msg-error hidden" role="alert"></div>
        <div class="field">
          <label for="redeem-code">Código del cliente</label>
          <input id="redeem-code" type="text" placeholder="ABC123" style="text-transform:uppercase"/>
        </div>
        <button type="button" class="btn btn-blue btn-block" id="btn-confirm-code">Confirmar canje</button>
        <div id="redeem-result"></div>
      </div>
    </section>
  </div>
  <script type="module" src="./caja-app.js"></script>
</body>
</html>`;
}

export function generateWalletManifest() {
  const site = loadSite();
  return JSON.stringify(
    {
      name: `Wallet ${site.brand?.name || "Más Café"}`,
      short_name: "Wallet",
      start_url: "./",
      display: "standalone",
      background_color: "#f6f5ef",
      theme_color: "#073954",
      lang: "es-CO",
      icons: [
        { src: "../apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    null,
    2
  );
}

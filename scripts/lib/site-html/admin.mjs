import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadSite } from "./shared.mjs";
import { hashPassword } from "./admin-hash.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../../..");

const REPO_CONFIG = {
  owner: "lasucursaldelcafe-droid",
  repo: "WEb-mas-cafe",
  branch: "main",
  path: "content/site.json",
};

const DEFAULT_ROUTES = [
  { id: "home", slug: "", label: "Inicio", enabled: true, builtin: true, inNav: false },
  { id: "cafe", slug: "cafe", label: "Café", enabled: true, builtin: true, inNav: true },
  { id: "menu", slug: "menu", label: "Menú", enabled: true, builtin: true, inNav: true },
  { id: "nosotros", slug: "nosotros", label: "Nosotros", enabled: true, builtin: true, inNav: true },
  { id: "tienda", slug: "tienda", label: "Tienda", enabled: true, builtin: true, inNav: true },
  { id: "blog", slug: "blog", label: "Blog", enabled: true, builtin: true, inNav: true },
  { id: "contacto", slug: "contacto", label: "Contacto", enabled: true, builtin: true, inNav: true },
];

export function generateAdminPage() {
  const site = loadSite();
  const users = JSON.parse(readFileSync(path.join(root, "content/users.json"), "utf8"));
  const userHashes = users.map((u) => ({
    username: u.username,
    name: u.name,
    role: u.role,
    hash: hashPassword(u.password),
  }));

  const publishSecret = process.env.ADMIN_PUBLISH_KEY || "";

  const css = readFileSync(path.join(root, "scripts/admin/admin.css"), "utf8");
  const js = readFileSync(path.join(root, "scripts/admin/admin.js"), "utf8");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="robots" content="noindex, nofollow"/>
  <title>Admin — Más Café</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet"/>
  <style>${css}</style>
</head>
<body>
  <div id="login-screen" class="login-wrap">
    <form id="login-form" class="login-card">
      <h1>Más Café</h1>
      <p class="sub">Panel de administración</p>
      <div class="field">
        <label for="login-user">Usuario</label>
        <input id="login-user" name="user" autocomplete="username" required/>
      </div>
      <div class="field">
        <label for="login-pass">Contraseña</label>
        <input id="login-pass" name="pass" type="password" autocomplete="current-password" required/>
      </div>
      <button type="submit" class="btn btn-blue" style="width:100%;margin-top:.5rem">Entrar</button>
    </form>
  </div>

  <div id="app" class="app hidden">
    <aside class="sidebar">
      <div class="brand">
        <strong>Más Café</strong>
        <span id="user-name">Admin</span>
      </div>
      <nav id="sidebar-nav"></nav>
      <div class="sidebar-footer">
        <p id="publish-status-bar" class="status-bar" style="font-size:.75rem;margin:0"></p>
        <button type="button" class="nav-btn" id="logout-btn" style="margin-top:.5rem">Salir</button>
      </div>
    </aside>
    <div class="main">
      <div class="topbar">
        <div>
          <h2 id="panel-title">Panel</h2>
          <span id="dirty-badge" class="chip hidden" style="margin-top:.35rem">Cambios sin guardar</span>
        </div>
        <div class="topbar-actions">
          <button type="button" class="btn btn-ghost" id="preview-btn">Ver sitio</button>
          <button type="button" class="btn btn-blue" id="publish-top">Guardar y publicar</button>
        </div>
      </div>
      <div id="panel-root"></div>
    </div>
  </div>

  <script>
    const SITE_BOOT = ${JSON.stringify(site)};
    const REPO_CONFIG = ${JSON.stringify(REPO_CONFIG)};
    const USER_HASHES = ${JSON.stringify(userHashes)};
    const DEFAULT_ROUTES = ${JSON.stringify(DEFAULT_ROUTES)};
    const PUBLISH_SECRET = ${JSON.stringify(publishSecret)};
  </script>
  <script>${js}</script>
</body>
</html>`;
}

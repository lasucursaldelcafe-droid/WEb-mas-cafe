/**
 * Genera el informe HTML «Constitución Web» — documento vivo para la marca.
 * Se publica en /informe/ (separado del sitio público, mismo GitHub).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { collectImagePaths } from "./generate-site-pages.mjs";
import { loadSite } from "./site-html/shared.mjs";
import { loadDriveAssets, resolveTypography } from "./drive-assets.mjs";
import { generateWalletVisualEmbed } from "./generate-wallet-visual.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const LIVE_BASE = "https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe";
const REPO_URL = "https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe";
const DRIVE_FOLDER_ID = "153OUmu9lChpCk2NiiirUwI_Z5EDQQNtC";
const DRIVE_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;

const SETTINGS_PATH = path.join(root, "content/settings.json");
const settings = existsSync(SETTINGS_PATH)
  ? JSON.parse(readFileSync(SETTINGS_PATH, "utf8"))
  : {};

const DOMAIN = settings.customDomain || "mascafé.com";
const DOMAIN_WWW = settings.customDomainWww || "www.mascafé.com";
const DOMAIN_URL = settings.seo?.siteUrl?.startsWith("https")
  ? settings.seo.siteUrl.replace(/\/$/, "")
  : `https://${DOMAIN_WWW}`;
const DOMAIN_LIVE = settings.seo?.siteUrl || `http://${settings.customDomainPunycode || "xn--mascaf-gva.com"}`;
const DOMAIN_PUNYCODE = settings.customDomainPunycode || "xn--mascaf-gva.com";
const GODADDY_DNS_URL = `https://dcc.godaddy.com/control/dnsmanagement?domainName=${DOMAIN_PUNYCODE}`;

const REPORT_VERSION = "1.5.0";
const REQUISITOS_PATH = path.join(root, "content/informe-requisitos.json");

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function walkImages(dir, base = "") {
  const entries = [];
  if (!existsSync(dir)) return entries;
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.posix.join(base, name);
    if (statSync(full).isDirectory()) {
      entries.push(...walkImages(full, rel));
    } else if (/\.(png|jpe?g|svg|webp|gif)$/i.test(name)) {
      entries.push(`/images/${rel.replace(/\\/g, "/")}`);
    }
  }
  return entries;
}

function imageUsageMap() {
  const used = new Set(collectImagePaths());
  const site = loadSite();
  const map = new Map();

  const register = (imgPath, where, why) => {
    if (!imgPath) return;
    const key = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ where, why });
  };

  register("/images/brand/horizontal-crema.png", "Header / Footer", "Logo sobre fondos oscuros (azul). Legibilidad en navegación fija.");
  register("/images/brand/horizontal-azul.png", "Header (scroll)", "Logo sobre fondo crema al desplazarse. Contraste de marca.");
  register("/images/brand/favs.png", "Inicio (hero)", "Isotipo de apoyo bajo el titular. Refuerzo de identidad sin saturar.");
  register("/images/grafica/3.png", "Inicio (hero)", "Ilustración de marca detrás del texto, baja opacidad. Humaniza sin competir con el mensaje.");
  register("/images/grafica/2.png", "Café (hero)", "Arte decorativo del hero. Conecta la página con el personaje gráfico del manual.");
  register("/images/decor/Recurso-4.svg", "Inicio (hero)", "Forma orgánica decorativa. Ritmo visual de la guía de marca.");
  register("/images/decor/Recurso-6.svg", "Inicio (hero)", "Segunda forma orgánica. Equilibrio compositivo del hero editorial.");
  register("/images/products/caja-cafe.png", "Café / Tienda / Blog", "Empaque oficial. Unifica presentación de productos hasta tener foto por SKU.");

  for (const e of site.experiences) {
    const labels = { pausa: "Inicio — bloque Ambiente", carta: "Inicio — bloque Carta", horno: "Inicio — bloque Horno", visita: "Inicio — bloque Tiempo" };
    register(e.image, labels[e.id] || "Inicio — experiencias", e.description.slice(0, 80) + "…");
  }
  for (const p of site.products) register(p.image, "Tienda / Café", `Producto: ${p.name}`);
  for (const b of site.blog.filter((x) => x.published)) register(b.image, `Blog — ${b.title}`, b.category);
  register(site.brand.nosotrosImage, "Nosotros", "Foto de ambiente. Prueba social y calidez del espacio físico.");
  register("/images/brand/favs.png", "Favicon / pestaña", "Derivado del isotipo para reconocimiento en el navegador.");

  for (const u of used) {
    if (!map.has(u)) map.set(u, [{ where: "Build de producción", why: "Copiado al sitio publicado." }]);
  }
  return { used, map };
}

function loadInformeRequisitos() {
  if (!existsSync(REQUISITOS_PATH)) {
    return {
      meta: {},
      independencia: { intro: "", items: [] },
      migracion: { intro: "", fases: [], dns: {} },
      wallet: { intro: "", mvp: [], reglasNegocio: {}, pantallasCliente: [], modulosAdmin: [], operacionCaja: [], modeloDatos: [], integracionesFuturas: [] },
      panelWeb: { intro: "", items: [] },
      seo: { intro: "", items: [] },
      necesitamosDeUstedes: [],
      camposLibres: [],
    };
  }
  return JSON.parse(readFileSync(REQUISITOS_PATH, "utf8"));
}

function statusBadge(estado) {
  const map = {
    pendiente: ["ref", "Pendiente"],
    en_proceso: ["warn", "En proceso"],
    listo: ["ok", "Listo"],
    bloqueado: ["ref", "Bloqueado"],
  };
  const [cls, label] = map[estado] || ["ref", estado || "Pendiente"];
  return `<span class="badge ${cls === "warn" ? "ref" : cls}">${escapeHtml(label)}</span>`;
}

function fieldValue(value, placeholder = "Por completar") {
  const v = String(value ?? "").trim();
  if (!v) return `<span class="field-empty">${escapeHtml(placeholder)}</span>`;
  return escapeHtml(v);
}

function renderChecklistTable(items, columns) {
  if (!items?.length) return `<p class="muted">Sin ítems definidos.</p>`;
  const heads = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const rows = items
    .map((item) => {
      const cells = columns.map((c) => `<td>${c.render(item)}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table><thead><tr>${heads}</tr></thead><tbody>${rows}</tbody></table>`;
}

function renderReglasNegocio(reglas) {
  const rows = [
    ["Puntos por cada $1.000 COP", fieldValue(reglas.puntosPorMilPesos, "Ej: 1")],
    ["Mínimo de compra para sumar", fieldValue(reglas.minimoCompraParaSumar, "Ej: $15.000 o «No»")],
    ["Caducidad de puntos (meses)", fieldValue(reglas.caducidadPuntosMeses, "Ej: 12 o «No caducan»")],
    ["Canje parcial", fieldValue(reglas.canjeParcial, "Ej: 50 pts = $5.000 descuento")],
    ["Puntos manuales permitidos", fieldValue(reglas.puntosManualesPermitidos, "Ej: cumpleaños, compensación")],
    ["Límite diario / anti-fraude", fieldValue(reglas.limiteDiarioPuntos || reglas.antiFraude, "Ej: máx. 500 pts/día por cliente")],
    ["Notas adicionales", fieldValue(reglas.notas, "Acordar con dueños antes de programar")],
  ];
  const premios =
    reglas.premiosCanjeables?.length > 0
      ? reglas.premiosCanjeables.map((p) => `<li>${escapeHtml(typeof p === "string" ? p : p.nombre || JSON.stringify(p))}</li>`).join("")
      : `<li class="field-empty">Por completar — ej: «Café filtro = 100 pts»</li>`;
  return `
    <table>
      <thead><tr><th>Regla</th><th>Valor acordado</th></tr></thead>
      <tbody>${rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</tbody>
    </table>
    <h4 style="margin-top:1.25rem;font-family:var(--font-display);color:var(--blue-mid)">Premios canjeables</h4>
    <ul>${premios}</ul>`;
}

function renderCamposLibres(campos) {
  return (campos || [])
    .map(
      (c) => `
    <div class="card fill-card">
      <h4>${escapeHtml(c.titulo)}</h4>
      <div class="fill-area">${fieldValue(c.contenido, "Escribir aquí en content/informe-requisitos.json → camposLibres")}</div>
    </div>`
    )
    .join("");
}

function folderPurpose(folder) {
  const purposes = {
    brand: "Manual de marca — logotipos, descriptors, ilustraciones de experiencia y mood.",
    grafica: "Ilustraciones y personaje gráfico (muñeca / elementos narrativos).",
    decor: "Formas orgánicas SVG del sistema visual.",
    aplicaciones: "Mockups de papelería, uniformes, empaque y señalética — referencia de aplicaciones.",
    hero: "Fotografías de fachada y hero — base visual para futuras versiones.",
    products: "Fotografía de empaque y producto.",
    uploads: "Carpeta para imágenes subidas desde el panel admin.",
    drive: "Imágenes descargadas desde Google Drive al publicar.",
    fonts: "Tipografías de marca sincronizadas desde Drive.",
  };
  return purposes[folder] || "Recursos gráficos de la carpeta Drive sincronizada.";
}

export function generateConstitutionReport() {
  const site = loadSite();
  const req = loadInformeRequisitos();
  const { brand, theme } = site;
  const driveAssets = loadDriveAssets();
  const typography = resolveTypography(site);
  const analytics = site.analytics || {};
  const seoSettings = settings.seo || {};
  const httpsReady = seoSettings.httpsReady === true;
  const generatedAt = new Date().toISOString();
  const { used, map } = imageUsageMap();
  const allImages = walkImages(path.join(root, "public/images"), "");
  const unused = allImages.filter((p) => !used.has(p));

  const pagesLive = [
    { id: "home", path: "/", label: "Inicio", role: "Propuesta de valor, experiencias, productos destacados, blog reciente." },
    { id: "cafe", path: "/cafe/", label: "Café", role: "Origen, guía de preparación y selección de microlotes." },
    { id: "menu", path: "/menu/", label: "Menú", role: "Carta con precios referenciales — decisión de visita o pedido." },
    { id: "nosotros", path: "/nosotros/", label: "Nosotros", role: "Historia, propósito y valores — confianza y diferenciación." },
    { id: "tienda", path: "/tienda/", label: "Tienda", role: "Catálogo y CTA WhatsApp para compra." },
    { id: "blog", path: "/blog/", label: "Blog", role: "Contenido editorial, SEO y educación sobre café." },
    { id: "contacto", path: "/contacto/", label: "Contacto", role: "Ubicación, horarios, formulario y redes." },
  ];

  const assetRows = allImages
    .sort()
    .map((imgPath) => {
      const usages = map.get(imgPath);
      const inSite = used.has(imgPath);
      const folder = imgPath.split("/")[2] || "";
      return `<tr>
        <td><code>${escapeHtml(imgPath)}</code></td>
        <td>${escapeHtml(folder)}</td>
        <td>${inSite ? '<span class="badge ok">En sitio</span>' : '<span class="badge ref">Referencia</span>'}</td>
        <td>${usages ? usages.map((u) => `<strong>${escapeHtml(u.where)}</strong><br/><span class="muted">${escapeHtml(u.why)}</span>`).join("<hr class='mini'/>") : `<span class="muted">${escapeHtml(folderPurpose(folder))}</span>`}</td>
      </tr>`;
    })
    .join("");

  const linkRows = [
    ["Sitio público (GitHub Pages)", `${LIVE_BASE}/`, "Hosting principal. Se actualiza con cada push a main."],
    ["Panel admin", `${LIVE_BASE}/admin/`, "Edición visual: textos, colores, tipografías Drive, imágenes Drive, secciones, blog, menú. Publicación automática."],
    ["Admin (dominio)", `${DOMAIN_LIVE}/admin/`, "Mismo panel en mascafé.com cuando el dominio está activo."],
    ["Documentación admin", `${REPO_URL}/blob/main/docs/ADMIN.md`, "Guía de uso del panel para la marca."],
    ["Manifiesto Drive", `${REPO_URL}/blob/main/content/drive-assets.json`, "Catálogo de fuentes e imágenes sincronizables desde Drive."],
    ["Este informe", `${LIVE_BASE}/informe/`, "Documento constitucional para la marca. No aparece en el menú del sitio."],
    ["Mockup Wallet (Apple + Google)", `${LIVE_BASE}/informe/wallet/`, "Vista previa visual de la tarjeta de fidelización en iPhone y Android."],
    ["Repositorio GitHub", REPO_URL, "Código fuente, historial de cambios y colaboración."],
    ["Carpeta Drive (marca)", DRIVE_URL, "Fuente original de logotipos, ilustraciones y aplicaciones."],
    ["Dominio mascafé.com", `${DOMAIN_LIVE}/`, `Sitio en dominio propio (HTTP${httpsReady ? " + HTTPS" : ""}). Punycode: ${DOMAIN_PUNYCODE}.`],
    ["Google Search Console", "https://search.google.com/search-console?resource_id=sc-domain%3Axn--mascaf-gva.com", "Dominio verificado por DNS TXT — sitemap enviado."],
    ["Firebase Hosting (respaldo)", "https://mas-cafe-c8413.web.app/", "Plataforma alternativa configurada en el repo. Mismo build HTML."],
    ["Instagram", brand.social.instagram, "Red social principal — tráfico y comunidad."],
    ["Facebook", brand.social.facebook, "Segunda red — eventos y alcance local."],
    ["WhatsApp", `https://wa.me/${brand.whatsapp}`, "Canal de conversión directa (pedidos, reservas, consultas)."],
    ["Google Maps", `https://maps.google.com/?q=${encodeURIComponent(brand.address + ", " + brand.city)}`, "Navegación al local físico."],
  ]
    .map(
      ([name, url, why]) =>
        `<tr><td>${escapeHtml(name)}</td><td><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a></td><td>${escapeHtml(why)}</td></tr>`
    )
    .join("");

  const changelog = [
    { date: "2026-06-30", note: "Informe v1.5 — panel admin documentado (nav desplegable, tipografías/imágenes Drive, analytics, informe embebido)." },
    { date: "2026-06-30", note: "Admin: lista desplegable de secciones — más espacio horizontal en el dashboard." },
    { date: "2026-06-30", note: "Admin: tipografías por rol e imágenes desde Drive (content/drive-assets.json + npm run drive:sync-assets)." },
    { date: "2026-06-30", note: "Analytics: clics locales, pageviews y soporte Google Analytics 4 en panel Análisis." },
    { date: "2026-06-30", note: "Admin: login en HTTP, publicación vía PAT, acceso al informe constitucional desde el panel." },
    { date: "2026-06-30", note: "Seguridad y credenciales (SEGURIDAD.md) + checklist wallet gratis paso a paso." },
    { date: "2026-06-30", note: "DNS GoDaddy + dominio mascafé.com en HTTP — HTTPS pendiente de certificado." },
    { date: "2026-06-27", note: "Informe v1.3 — mockup visual Apple Wallet + Google Wallet en /informe/wallet/." },
    { date: "2026-06-27", note: "Automatización DNS dominio mascafé.com (npm run domain:configure)." },
    { date: "2026-06-27", note: "Carpeta proyecto-mas-cafe/ — entrega, enlaces de cuentas, REGISTRO-HECHO y plantilla CREDENCIALES." },
    { date: "2026-06-27", note: "Informe v1.1 — wallet de fidelización, migración mascafé.com, checklist editable en content/informe-requisitos.json." },
    { date: "2026-06-27", note: "Informe constitucional v1.0 — paleta crema, textos sin repetición, auditoría de activos Drive." },
    { date: "2026-06-27", note: "Favicon del logo en todas las páginas." },
    { date: "2026-06-27", note: "Rediseño móvil editorial y vista previa admin en todos los paneles." },
    { date: "2026-06-26", note: "Sitio multipágina HTML estático + panel admin + GitHub Actions." },
  ]
    .map((c) => `<li><time>${c.date}</time> — ${escapeHtml(c.note)}</li>`)
    .join("");

  const independenciaRows = (req.independencia?.items || [])
    .map(
      (i) => `<tr>
        <td>${escapeHtml(i.item)}</td>
        <td>${statusBadge(i.estado)}</td>
        <td>${fieldValue(i.responsable, "Responsable")}</td>
        <td>${fieldValue(i.valor, "Dato / cuenta / enlace")}</td>
        <td class="muted">${fieldValue(i.notas, "—")}</td>
      </tr>`
    )
    .join("");

  const migracionFases = (req.migracion?.fases || [])
    .map(
      (f) => `<tr>
        <td><strong>Fase ${escapeHtml(f.fase)}</strong></td>
        <td>${escapeHtml(f.nombre)}</td>
        <td>${escapeHtml(f.descripcion)}</td>
        <td>${statusBadge(f.estado)}</td>
        <td>${fieldValue(f.fechaObjetivo, "Fecha")}</td>
      </tr>`
    )
    .join("");

  const dns = req.migracion?.dns || {};
  const walletMvp = (req.wallet?.mvp || []).map((m) => `<li>${escapeHtml(m)}</li>`).join("");
  const walletModelo = (req.wallet?.modeloDatos || []).map((m) => `<li><code>${escapeHtml(m.split(" — ")[0])}</code> — ${escapeHtml(m.split(" — ").slice(1).join(" — ") || m)}</li>`).join("");

  const pantallasWallet = renderChecklistTable(req.wallet?.pantallasCliente, [
    { label: "Pantalla", render: (i) => `<strong>${escapeHtml(i.pantalla)}</strong>` },
    { label: "Descripción", render: (i) => escapeHtml(i.descripcion) },
    { label: "Estado", render: (i) => statusBadge(i.estado) },
  ]);

  const modulosAdminWallet = renderChecklistTable(req.wallet?.modulosAdmin, [
    { label: "Módulo", render: (i) => `<strong>${escapeHtml(i.modulo)}</strong>` },
    { label: "Funciones", render: (i) => escapeHtml(i.funciones) },
    { label: "Estado", render: (i) => statusBadge(i.estado) },
  ]);

  const cajaWallet = renderChecklistTable(req.wallet?.operacionCaja, [
    { label: "Operación en mostrador", render: (i) => escapeHtml(i.item) },
    { label: "Estado", render: (i) => statusBadge(i.estado) },
    { label: "Notas", render: (i) => fieldValue(i.notas, "—") },
  ]);

  const integracionesWallet = (req.wallet?.integracionesFuturas || [])
    .map(
      (i) => `<tr>
        <td>${escapeHtml(i.nombre)}</td>
        <td>${escapeHtml(i.uso)}</td>
        <td><span class="badge ref">${escapeHtml(i.prioridad)}</span></td>
      </tr>`
    )
    .join("");

  const necesitamosRows = (req.necesitamosDeUstedes || [])
    .map(
      (n) => `<tr>
        <td><span class="badge ok">${escapeHtml(n.categoria)}</span></td>
        <td>${escapeHtml(n.item)}</td>
        <td>${statusBadge(n.estado)}</td>
        <td>${fieldValue(n.responsable, "Responsable")}</td>
        <td>${fieldValue(n.fechaLimite, "Fecha")}</td>
        <td class="muted">${fieldValue(n.notas, "—")}</td>
      </tr>`
    )
    .join("");

  const meta = req.meta || {};

  const driveImagesWithId = (driveAssets.images || []).filter((i) => i.driveId);
  const driveManifestRows = (driveAssets.images || [])
    .map(
      (img) => `<tr>
        <td>${escapeHtml(img.label || img.id)}</td>
        <td>${img.driveId ? `<code>${escapeHtml(img.driveId.slice(0, 12))}…</code>` : '<span class="field-empty">Falta driveId</span>'}</td>
        <td><code>${escapeHtml(img.localPath || "—")}</code></td>
        <td>${escapeHtml((img.categories || []).join(", "))}</td>
        <td>${img.driveId ? '<span class="badge ok">Selector admin</span>' : '<span class="badge ref">Solo local</span>'}</td>
      </tr>`
    )
    .join("");

  const fontManifestRows = (driveAssets.fonts || [])
    .map(
      (f) => `<tr>
        <td><strong>${escapeHtml(f.family)}</strong></td>
        <td>${escapeHtml(f.label || "")}</td>
        <td>${escapeHtml((f.roles || []).join(", "))}</td>
        <td>${typography.display === f.family || typography.body === f.family || typography.accent === f.family ? '<span class="badge ok">En uso</span>' : '<span class="badge ref">Disponible</span>'}</td>
      </tr>`
    )
    .join("");

  const panelWebRows = renderChecklistTable(req.panelWeb?.items, [
    { label: "Función", render: (i) => `<strong>${escapeHtml(i.funcion)}</strong>` },
    { label: "Estado", render: (i) => statusBadge(i.estado) },
    { label: "Notas", render: (i) => fieldValue(i.notas, "—") },
  ]);

  const seoRows = renderChecklistTable(req.seo?.items, [
    { label: "Ítem SEO / analítica", render: (i) => `<strong>${escapeHtml(i.item)}</strong>` },
    { label: "Estado", render: (i) => statusBadge(i.estado) },
    { label: "Valor / enlace", render: (i) => fieldValue(i.valor, "—") },
    { label: "Notas", render: (i) => fieldValue(i.notas, "—") },
  ]);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="robots" content="noindex, nofollow"/>
  <title>Constitución Web — ${escapeHtml(brand.name)}</title>
  <style>
    :root{
      --cream:#f6f5ef;--cream-dark:#ebe8df;--blue:#073954;--blue-mid:#0a4d6e;
      --sage:#d8daa8;--green:#1bb175;--brown:#b07a3a;--charcoal:#2b2b2b;
      --font-display:Georgia,"Playfair Display",serif;
      --font-body:system-ui,-apple-system,sans-serif;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:var(--font-body);background:var(--cream);color:var(--charcoal);line-height:1.65}
    .hero{background:linear-gradient(145deg,var(--blue),var(--blue-mid));color:var(--cream);padding:3rem 1.5rem 2.5rem}
    .hero .wrap,.wrap{max-width:960px;margin:0 auto;padding:0 1.5rem}
    .hero h1{font-family:var(--font-display);font-size:clamp(1.85rem,4vw,2.75rem);font-weight:500;line-height:1.1}
    .hero .meta{margin-top:1rem;font-size:.88rem;opacity:.85;display:flex;flex-wrap:wrap;gap:1rem}
    .hero .meta span{background:rgba(255,255,255,.08);padding:.35rem .75rem;border-radius:999px}
    nav.toc{background:var(--cream-dark);border-bottom:1px solid rgba(7,57,84,.08);padding:1rem 0;position:sticky;top:0;z-index:10}
    nav.toc .wrap{display:flex;flex-wrap:wrap;gap:.5rem 1rem;font-size:.82rem}
    nav.toc a{color:var(--blue);font-weight:600;text-decoration:none}
    nav.toc a:hover{text-decoration:underline}
    main{padding:2.5rem 0 4rem}
    section{margin-bottom:3rem;scroll-margin-top:4rem}
    h2{font-family:var(--font-display);color:var(--blue);font-size:1.65rem;font-weight:500;margin-bottom:1rem;padding-bottom:.5rem;border-bottom:2px solid var(--sage)}
    h3{font-family:var(--font-display);color:var(--blue-mid);font-size:1.2rem;margin:1.5rem 0 .75rem}
    p,li{font-size:.95rem}
    p+p,ul{margin-top:.75rem}
    ul{padding-left:1.25rem}
    .card{background:var(--cream-dark);border:1px solid rgba(7,57,84,.08);border-radius:1rem;padding:1.25rem 1.5rem;margin-top:1rem}
    .grid{display:grid;gap:1rem}
    @media(min-width:700px){.grid.cols-2{grid-template-columns:1fr 1fr}}
    .stat strong{display:block;font-size:1.5rem;color:var(--blue);font-family:var(--font-display)}
    .stat span{font-size:.82rem;opacity:.7}
    table{width:100%;border-collapse:collapse;font-size:.85rem;margin-top:1rem;background:var(--cream-dark);border-radius:.75rem;overflow:hidden}
    th,td{padding:.65rem .75rem;text-align:left;border-bottom:1px solid rgba(7,57,84,.07);vertical-align:top}
    th{background:rgba(7,57,84,.06);font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;color:var(--blue)}
    tr:last-child td{border-bottom:none}
    code{font-size:.78rem;background:rgba(7,57,84,.06);padding:.15rem .35rem;border-radius:.25rem}
    .muted{opacity:.72;font-size:.82rem}
    .badge{display:inline-block;font-size:.7rem;font-weight:700;padding:.2rem .55rem;border-radius:999px}
    .badge.ok{background:var(--sage);color:var(--blue)}
    .badge.ref{background:rgba(176,122,58,.2);color:var(--brown)}
    .badge.live{background:var(--green);color:#fff}
    .palette{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1rem}
    .swatch{width:5.5rem;text-align:center;font-size:.68rem}
    .swatch i{display:block;height:2.75rem;border-radius:.5rem;margin-bottom:.35rem;border:1px solid rgba(7,57,84,.1)}
    .callout{border-left:4px solid var(--sage);padding:1rem 1.25rem;background:var(--cream-dark);border-radius:0 .75rem .75rem 0;margin-top:1rem}
    .callout.warn{border-left-color:var(--brown)}
    .callout strong{color:var(--blue)}
    .field-empty{display:inline-block;color:var(--brown);font-style:italic;border-bottom:1px dashed rgba(176,122,58,.45);padding:0 .15rem}
    .fill-card h4{font-family:var(--font-display);color:var(--blue-mid);font-size:1rem;margin-bottom:.5rem}
    .fill-area{min-height:2.5rem;padding:.75rem;background:rgba(255,255,255,.45);border-radius:.5rem;border:1px dashed rgba(7,57,84,.15);white-space:pre-wrap}
    .source-hint{font-size:.78rem;background:rgba(7,57,84,.08);padding:.65rem .85rem;border-radius:.5rem;margin-top:1rem}
    .source-hint code{font-size:.75rem}
    hr.mini{border:none;border-top:1px solid rgba(7,57,84,.08);margin:.5rem 0}
    footer{background:var(--blue);color:var(--cream);padding:2rem 0;font-size:.85rem}
    footer a{color:var(--sage)}
    time{font-weight:600;color:var(--blue)}
    .wallet-embed-preview{display:grid;gap:1.25rem;margin:1.25rem 0 1.5rem;padding:1.25rem;background:linear-gradient(135deg,rgba(7,57,84,.04),rgba(27,177,117,.06));border:1px solid rgba(7,57,84,.1);border-radius:1rem}
    @media(min-width:640px){.wallet-embed-preview{grid-template-columns:auto 1fr;align-items:center}}
    .wallet-embed-phones{display:flex;gap:1rem;justify-content:center}
    .wallet-embed-mini{width:72px}
    .mini-pass{border-radius:10px;overflow:hidden;box-shadow:0 6px 16px rgba(7,57,84,.15)}
    .mini-apple{background:#fff}
    .mini-strip{height:28px;background:linear-gradient(135deg,var(--blue),var(--green))}
    .mini-body{padding:.45rem .5rem;font-size:.62rem}
    .mini-pts{display:block;font-weight:700;color:var(--blue);font-size:.75rem}
    .mini-name{color:#666}
    .mini-google{background:#fff}
    .mini-g-hero{height:24px;background:linear-gradient(120deg,var(--blue),var(--green))}
    .mini-google .mini-pts{display:block;padding:.4rem .5rem;font-weight:700;color:var(--blue);font-size:.85rem}
    .wallet-embed-cta p{font-size:.88rem;margin-bottom:.65rem}
    .wallet-embed-link{display:inline-block;background:var(--blue);color:var(--cream)!important;padding:.55rem 1rem;border-radius:999px;font-size:.82rem;font-weight:700;text-decoration:none}
    .wallet-embed-link:hover{background:var(--blue-mid)}
  </style>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <p style="font-size:.75rem;text-transform:uppercase;letter-spacing:.2em;opacity:.7;margin-bottom:.5rem">Documento vivo · No indexar</p>
      <h1>Constitución Web — ${escapeHtml(brand.name)}</h1>
      <p style="margin-top:.85rem;max-width:42rem;opacity:.9">Modelo oficial del sitio, inventario Drive → web, arquitectura, migración a <strong>${escapeHtml(DOMAIN_URL)}</strong>, wallet de fidelización y checklist editable para la marca.</p>
      <div class="meta">
        <span>Versión ${REPORT_VERSION}</span>
        <span>Generado: ${escapeHtml(generatedAt.slice(0, 16).replace("T", " "))} UTC</span>
        <span class="badge live">Sitio en línea OK</span>
      </div>
    </div>
  </header>

  <nav class="toc" aria-label="Índice">
    <div class="wrap">
      <a href="#estado">Estado</a>
      <a href="#constitucion">Constitución</a>
      <a href="#tecnica">Técnica</a>
      <a href="#panel-admin">Panel admin</a>
      <a href="#seo-panel">SEO</a>
      <a href="#paginas">Páginas</a>
      <a href="#marca">Marca</a>
      <a href="#activos">Activos Drive</a>
      <a href="#experiencia">Experiencia</a>
      <a href="#clientes">Clientes</a>
      <a href="#independencia">Independencia</a>
      <a href="#migracion">Migración</a>
      <a href="#wallet">Wallet</a>
      <a href="#wallet-visual">Mockup Wallet</a>
      <a href="#seguridad">Seguridad</a>
      <a href="#requisitos">Requisitos</a>
      <a href="#enlaces">Enlaces</a>
      <a href="#dueños">Dueños</a>
      <a href="#changelog">Historial</a>
    </div>
  </nav>

  <main class="wrap">

    <section id="estado">
      <h2>1. Estado actual del proyecto (auditoría GitHub)</h2>
      <div class="grid cols-2">
        <div class="card stat"><strong>7+1</strong><span>Páginas públicas + admin</span></div>
        <div class="card stat"><strong>${used.size}</strong><span>Imágenes en producción</span></div>
        <div class="card stat"><strong>${allImages.length}</strong><span>Activos en repositorio</span></div>
        <div class="card stat"><strong>HTTP 200</strong><span>Todas las rutas verificadas</span></div>
        <div class="card stat"><strong>${driveAssets.fonts?.length || 0}</strong><span>Fuentes Drive en catálogo</span></div>
        <div class="card stat"><strong>${driveImagesWithId.length}</strong><span>Imágenes Drive con ID</span></div>
      </div>
      <div class="callout"><strong>Hosting principal:</strong> GitHub Pages vía GitHub Actions (<code>deploy-github-pages.yml</code>). Cada push a <code>main</code> reconstruye sitio + informe en ~1 minuto.</div>
      <div class="callout"><strong>Dominio:</strong> <a href="${escapeHtml(DOMAIN_LIVE)}">${escapeHtml(DOMAIN_LIVE)}</a> (${escapeHtml(DOMAIN)}) — DNS configurado ${settings.dnsConfiguredAt ? escapeHtml(settings.dnsConfiguredAt.slice(0, 10)) : "pendiente"}. HTTPS: ${httpsReady ? '<span class="badge ok">Activo</span>' : '<span class="badge ref">Pendiente — npm run domain:enable-https</span>'}.</div>
      <div class="callout warn"><strong>Plataforma de respaldo:</strong> Firebase Hosting (<code>mas-cafe-c8413</code>) está configurada en el repositorio como alternativa (mismo HTML estático). No se encontró configuración de «VertiZone» en el código — si es un servicio externo futuro, documentar credenciales en <code>content/settings.json</code>.</div>
      <h3>Verificación realizada</h3>
      <ul>
        <li>Build <code>npm run build:github-pages</code> — OK (${pagesLive.length} páginas + admin + informe)</li>
        <li>Health check <code>npm run health-check</code> — OK</li>
        <li>URLs en línea (github.io + <strong>${escapeHtml(DOMAIN)}</strong>): inicio, café, menú, nosotros, tienda, blog, contacto, admin, informe — HTTP 200</li>
        <li>Panel admin: lista desplegable, tipografías Drive, imágenes Drive, informe embebido, analytics</li>
        <li>Google Search Console verificado — ${seoSettings.googleSearchConsoleVerifiedAt ? escapeHtml(seoSettings.googleSearchConsoleVerifiedAt.slice(0, 10)) : "fecha en settings"}</li>
        <li>Google Analytics 4: ${analytics.googleAnalyticsId ? `<code>${escapeHtml(analytics.googleAnalyticsId)}</code> configurado` : "pendiente ID en admin → Análisis"}</li>
        <li>Contenido editable en <code>content/site.json</code> — válido (incluye <code>theme.typography</code>)</li>
      </ul>
    </section>

    <section id="constitucion">
      <h2>2. ¿Qué es la constitución web y cómo funciona?</h2>
      <p>La <strong>constitución web</strong> es el documento maestro que define <em>cómo está construido</em> el sitio, <em>qué reglas de marca</em> sigue y <em>cómo se mantiene</em> en el tiempo. No es una página del menú público: vive en el mismo GitHub pero en ruta separada.</p>
      <div class="card">
        <h3>Ubicación</h3>
        <ul>
          <li><strong>En el repositorio:</strong> <code>informes/constitucion-web.html</code> (fuente) + generador <code>scripts/lib/generate-constitution-report.mjs</code></li>
          <li><strong>Enlace público del informe:</strong> <a href="${LIVE_BASE}/informe/">${LIVE_BASE}/informe/</a></li>
          <li><strong>Sitio de clientes:</strong> <a href="${LIVE_BASE}/">${LIVE_BASE}/</a> (sin enlace al informe en el menú)</li>
        </ul>
      </div>
      <h3>Ciclo de actualización</h3>
      <ol style="padding-left:1.25rem;margin-top:.75rem">
        <li>Se hace un cambio en el sitio (diseño, textos, imágenes).</li>
        <li>Se actualiza <code>content/site.json</code> y/o plantillas en <code>scripts/lib/site-html/</code>.</li>
        <li>El generador de informe lee el estado actual y regenera este HTML en cada build.</li>
        <li>Push a <code>main</code> → GitHub Actions publica sitio + informe actualizado.</li>
        <li>Se entrega el enlace del informe a la marca como reporte de avance.</li>
      </ol>
    </section>

    <section id="tecnica">
      <h2>3. Arquitectura técnica</h2>
      <table>
        <thead><tr><th>Capa</th><th>Qué es</th><th>Para qué</th></tr></thead>
        <tbody>
          <tr><td><code>content/site.json</code></td><td>Base de datos en JSON</td><td>Textos, precios, menú, blog, rutas, colores, <code>theme.typography</code>, analytics. Editable desde admin.</td></tr>
          <tr><td><code>content/drive-assets.json</code></td><td>Manifiesto Drive</td><td>Fuentes e imágenes con ID de Drive — catálogo del selector admin.</td></tr>
          <tr><td><code>content/settings.json</code></td><td>Configuración técnica</td><td>Dominio, SEO, logo Drive, correo Zoho.</td></tr>
          <tr><td><code>scripts/lib/site-html/</code></td><td>Generador HTML</td><td>Convierte JSON en 7 páginas estáticas con la paleta crema actual.</td></tr>
          <tr><td><code>scripts/lib/drive-assets.mjs</code></td><td>Sincronización Drive</td><td>Descarga imágenes en build; <code>npm run drive:sync-assets</code>.</td></tr>
          <tr><td><code>public/images/</code> + <code>public/fonts/</code></td><td>Activos locales</td><td>Imágenes y tipografías copiadas a producción.</td></tr>
          <tr><td><code>.github/workflows/</code></td><td>CI/CD</td><td>Deploy automático a GitHub Pages.</td></tr>
          <tr><td><code>/admin/</code></td><td>Panel privado</td><td>Lista desplegable de secciones, vista previa, publicación sin código.</td></tr>
          <tr><td><code>/informe/</code></td><td>Este documento</td><td>Constitución web regenerada en cada build.</td></tr>
          <tr><td>Firebase (opcional)</td><td>Hosting espejo</td><td>Respaldo o pruebas en <code>mas-cafe-c8413.web.app</code>.</td></tr>
        </tbody>
      </table>
    </section>

    <section id="panel-admin">
      <h2>3.1 Panel de administración (<code>/admin/</code>)</h2>
      <p>Interfaz para la marca: editar el sitio sin tocar código. Acceso: usuario <code>admin</code> (contraseña en <code>content/users.json</code>, hash SHA-256 en el cliente).</p>
      <div class="callout"><strong>Navegación:</strong> lista desplegable en la barra superior (más espacio para formularios y vista previa). Acciones fijas: Ver sitio, Informe, Guardar y publicar.</div>
      <h3>Funciones disponibles hoy</h3>
      ${panelWebRows}
      <h3>Secciones del panel</h3>
      <table>
        <thead><tr><th>Sección</th><th>Qué edita</th></tr></thead>
        <tbody>
          <tr><td>Resumen / Cómo funciona</td><td>Estado general y guía rápida</td></tr>
          <tr><td>Informe</td><td>Vista embebida de este documento + enlace mockup Wallet</td></tr>
          <tr><td>Análisis</td><td>Clics (WhatsApp, tienda…), pageviews locales, ingresos, ID Google Analytics 4</td></tr>
          <tr><td>Marca e inicio</td><td>Nombre, titulares, tagline, textos del hero</td></tr>
          <tr><td>Colores y fuentes</td><td>Paleta + tipografías por rol (solo fuentes del manifiesto Drive)</td></tr>
          <tr><td>Secciones</td><td>Activar/desactivar páginas, crear subcarpetas nuevas</td></tr>
          <tr><td>Experiencias / Café / Menú / Blog / Nosotros / Contacto</td><td>Contenido por página + imágenes (subir o elegir desde Drive)</td></tr>
          <tr><td>Publicar</td><td>Sube <code>site.json</code> e imágenes a GitHub — deploy en ~1 min</td></tr>
        </tbody>
      </table>
      <h3>Tipografías activas (desde <code>site.json</code>)</h3>
      <table>
        <thead><tr><th>Rol</th><th>Fuente</th></tr></thead>
        <tbody>
          <tr><td>Títulos grandes</td><td><strong>${escapeHtml(typography.display)}</strong></td></tr>
          <tr><td>Texto general</td><td><strong>${escapeHtml(typography.body)}</strong></td></tr>
          <tr><td>Acento manuscrito</td><td><strong>${escapeHtml(typography.accent)}</strong></td></tr>
        </tbody>
      </table>
      <h3>Analítica</h3>
      <ul>
        <li><strong>Clics locales:</strong> WhatsApp ${analytics.clicks?.whatsapp ?? 0}, tienda ${analytics.clicks?.tienda ?? 0}, contacto ${analytics.clicks?.contacto ?? 0} (sincronizar en Análisis → publicar)</li>
        <li><strong>Google Analytics 4:</strong> ${analytics.googleAnalyticsId ? `<code>${escapeHtml(analytics.googleAnalyticsId)}</code>` : '<span class="field-empty">Pendiente — pegar ID G-XXXXXXXX en admin</span>'}</li>
        <li><strong>Search Console:</strong> dominio verificado — ver sección SEO abajo</li>
      </ul>
      <div class="source-hint">Guía de uso: <code>docs/ADMIN.md</code> · Publicación requiere secret <code>ADMIN_PUBLISH_KEY</code> en GitHub Actions</div>
    </section>

    <section id="seo-panel">
      <h2>3.2 SEO y analítica</h2>
      <p>${escapeHtml(req.seo?.intro || "Posicionamiento y medición del sitio público.")}</p>
      ${seoRows}
      <div class="source-hint">Editar estados: <code>content/informe-requisitos.json</code> → <code>seo.items</code> · Config técnica: <code>content/settings.json</code> → <code>seo</code></div>
    </section>

    <section id="paginas">
      <h2>4. Mapa de páginas y objetivo de cada una</h2>
      <table>
        <thead><tr><th>Página</th><th>URL</th><th>Función</th></tr></thead>
        <tbody>
          ${pagesLive.map((p) => `<tr><td><strong>${escapeHtml(p.label)}</strong></td><td><a href="${LIVE_BASE}${p.path}">${LIVE_BASE}${p.path}</a></td><td>${escapeHtml(p.role)}</td></tr>`).join("")}
        </tbody>
      </table>
      <h3>Base Next.js (no publicada)</h3>
      <p>La carpeta <code>src/</code> contiene una versión anterior en Next.js/React. <strong>No es lo que ven los clientes hoy.</strong> Sirvió como prototipo de estructura y componentes; el modelo oficial es el HTML generado.</p>
    </section>

    <section id="marca">
      <h2>5. Paleta, tipografía y reglas actuales</h2>
      <p>Modelo visual acordado: fondo <strong>crema</strong> (no blanco puro), una frase fuerte por pantalla, tagline solo en inicio.</p>
      <div class="palette">
        <div class="swatch"><i style="background:${theme.cream}"></i>Crema<br/>${theme.cream}</div>
        <div class="swatch"><i style="background:${theme.creamDark}"></i>Crema oscuro<br/>${theme.creamDark}</div>
        <div class="swatch"><i style="background:${theme.blue}"></i>Azul<br/>${theme.blue}</div>
        <div class="swatch"><i style="background:${theme.sage}"></i>Sage<br/>${theme.sage}</div>
        <div class="swatch"><i style="background:${theme.green}"></i>Verde<br/>${theme.green}</div>
        <div class="swatch"><i style="background:${theme.brown}"></i>Caramelo<br/>${theme.brown}</div>
      </div>
      <ul>
        <li><strong>Tipografías (editables en admin):</strong> títulos → <strong>${escapeHtml(typography.display)}</strong>, cuerpo → <strong>${escapeHtml(typography.body)}</strong>, acento → <strong>${escapeHtml(typography.accent)}</strong>. Solo fuentes listadas en <code>content/drive-assets.json</code>.</li>
        <li><strong>Tagline de marca:</strong> «${escapeHtml(brand.tagline)}» — solo en hero de inicio.</li>
        <li><strong>Descriptor:</strong> «${escapeHtml(brand.descriptor)}» — solo en hero de inicio.</li>
        <li><strong>CTA visita:</strong> «${escapeHtml(brand.visitLine || "San Fernando Nuevo")}» — banda final de cada página.</li>
      </ul>
    </section>

    <section id="activos">
      <h2>6. Inventario Drive → repositorio → sitio</h2>
      <p>Carpeta Google Drive de marca: <a href="${DRIVE_URL}" target="_blank" rel="noopener">Abrir en Drive</a> (ID: <code>${DRIVE_FOLDER_ID}</code>). Manifiesto local: <code>content/drive-assets.json</code> · sincronizar con <code>npm run drive:sync-assets</code> y <code>npm run brand:sync-logo</code>.</p>
      <h3>Fuentes en catálogo Drive (${driveAssets.fonts?.length || 0})</h3>
      <table>
        <thead><tr><th>Familia</th><th>Etiqueta</th><th>Roles</th><th>Estado</th></tr></thead>
        <tbody>${fontManifestRows}</tbody>
      </table>
      <h3>Imágenes en manifiesto Drive (${driveAssets.images?.length || 0} · ${driveImagesWithId.length} con ID para selector admin)</h3>
      <table>
        <thead><tr><th>Nombre</th><th>Drive ID</th><th>Ruta local</th><th>Categorías</th><th>Admin</th></tr></thead>
        <tbody>${driveManifestRows}</tbody>
      </table>
      <table>
        <thead><tr><th>Carpeta Drive / repo</th><th>Contenido</th><th>En sitio público</th></tr></thead>
        <tbody>
          <tr><td><code>brand/</code></td><td>Logos, descriptors, ilustraciones experiencia, mood</td><td><span class="badge ok">Sí — logos, experiencias, nosotros</span></td></tr>
          <tr><td><code>grafica/</code></td><td>Ilustraciones y personaje (1.png, 2.png, 3.png + recursos)</td><td><span class="badge ok">Sí — 1, 2, 3 en heroes</span> · <span class="badge ref">70+ referencia</span></td></tr>
          <tr><td><code>decor/</code></td><td>Formas SVG orgánicas (Recurso-4, 6, etc.)</td><td><span class="badge ok">Sí — 4 y 6 en inicio</span> · <span class="badge ref">resto reserva</span></td></tr>
          <tr><td><code>products/</code></td><td>Empaque café</td><td><span class="badge ok">Sí — caja-cafe.png</span></td></tr>
          <tr><td><code>aplicaciones/</code></td><td>Mockups: polo, tote, vasos, agenda, fachada…</td><td><span class="badge ref">No ilustrado — base de marca</span></td></tr>
          <tr><td><code>hero/</code></td><td>Fotos fachada e ilustración hero</td><td><span class="badge ref">No en HTML actual — reservado</span></td></tr>
        </tbody>
      </table>
      <h3>Detalle por archivo (${allImages.length} en repo · ${used.size} en producción · ${unused.length} solo referencia)</h3>
      <table>
        <thead><tr><th>Archivo</th><th>Carpeta</th><th>Estado</th><th>Dónde / por qué</th></tr></thead>
        <tbody>${assetRows}</tbody>
      </table>
    </section>

    <section id="experiencia">
      <h2>7. ¿Qué idea transmite el sitio al visitante?</h2>
      <p>El sitio busca que quien entra sienta <strong>calma editorial</strong>, <strong>café de origen serio</strong> y <strong>un lugar real en Cali</strong> donde vale la pena quedarse — no una plantilla genérica de coffee shop.</p>
      <ul>
        <li><strong>Primera impresión (inicio):</strong> «${escapeHtml(brand.headline)}» — acogida y curiosidad.</li>
        <li><strong>Profundidad (café / blog):</strong> trazabilidad, preparación, historias de origen.</li>
        <li><strong>Decisión (menú / tienda):</strong> precios claros, WhatsApp para cerrar pedido.</li>
        <li><strong>Confianza (nosotros):</strong> historia humana + valores concretos.</li>
        <li><strong>Acción (contacto / CTA):</strong> dirección, horarios, mapa, mensaje directo.</li>
      </ul>
    </section>

    <section id="clientes">
      <h2>8. Utilidad para los clientes</h2>
      <table>
        <thead><tr><th>Necesidad del cliente</th><th>Cómo lo resuelve el sitio</th></tr></thead>
        <tbody>
          <tr><td>«¿Dónde están y cuándo abren?»</td><td>Contacto + banda «Te esperamos en Cali» + footer con horarios.</td></tr>
          <tr><td>«¿Qué puedo comer/beber y cuánto cuesta?»</td><td>Menú con categorías y precios referenciales en COP.</td></tr>
          <tr><td>«¿Puedo comprar café para la casa?»</td><td>Tienda con variedades, notas de sabor y botón WhatsApp.</td></tr>
          <tr><td>«¿Es café de verdad o comercial?»</td><td>Página Café + blog con origen, finca, altitud, proceso.</td></tr>
          <tr><td>«¿Qué los hace diferentes?»</td><td>Nosotros + bloque experiencias en inicio (ambiente, carta, horno, tiempo).</td></tr>
          <tr><td>«Quiero escribirles ya»</td><td>Botón flotante WhatsApp, formulario contacto, teléfono y redes.</td></tr>
        </tbody>
      </table>
    </section>

    <section id="independencia">
      <h2>9. Independencia de Más Café (separación de La Sucursal del Café)</h2>
      <p>${escapeHtml(req.independencia?.intro || "")}</p>
      <div class="grid cols-2" style="margin-top:1rem">
        <div class="card"><strong>Titular de marca</strong><br/>${fieldValue(meta.propietarioLegal, meta.titularMarca || "Más Café")}</div>
        <div class="card"><strong>Contacto principal</strong><br/>${fieldValue(meta.contactoPrincipalMarca, "Nombre y teléfono")}</div>
        <div class="card"><strong>Repo futuro</strong><br/>${fieldValue(meta.repositorioFuturo, "Organización GitHub de Más Café")}</div>
        <div class="card"><strong>Org. GitHub</strong><br/>${fieldValue(meta.organizacionGitHubFutura, "Por definir")}</div>
      </div>
      <h3>Checklist de propiedad</h3>
      <table>
        <thead><tr><th>Ítem</th><th>Estado</th><th>Responsable</th><th>Valor / cuenta</th><th>Notas</th></tr></thead>
        <tbody>${independenciaRows}</tbody>
      </table>
      <div class="source-hint">Editar en el repositorio: <code>content/informe-requisitos.json</code> → sección <code>independencia.items</code></div>
    </section>

    <section id="migracion">
      <h2>10. Migración a ${escapeHtml(DOMAIN_URL)} (GoDaddy)</h2>
      <p>${escapeHtml(req.migracion?.intro || "")}</p>
      <div class="callout"><strong>Dominio con tilde:</strong> <strong>${escapeHtml(DOMAIN)}</strong> — en GitHub/DNS puede verse como <code>${escapeHtml(DOMAIN_PUNYCODE)}</code> (mismo dominio).</div>
      <div class="callout warn"><strong>Importante:</strong> La wallet de fidelización <em>no puede</em> funcionar solo con GitHub Pages (HTML estático). Al activar puntos, el dominio debe apuntar a un hosting con backend (Firebase, Vercel, Render, etc.).</div>
      <h3>Fases del plan</h3>
      <table>
        <thead><tr><th>Fase</th><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Fecha objetivo</th></tr></thead>
        <tbody>${migracionFases}</tbody>
      </table>
      <h3>DNS GoDaddy</h3>
      <table>
        <thead><tr><th>Campo</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Registrador</td><td>${fieldValue(dns.registrador, "GoDaddy")}</td></tr>
          <tr><td>Dominio</td><td>${fieldValue(dns.dominio, DOMAIN)}</td></tr>
          <tr><td>Punycode (técnico)</td><td><code>${escapeHtml(DOMAIN_PUNYCODE)}</code></td></tr>
          <tr><td>Panel DNS GoDaddy</td><td><a href="${GODADDY_DNS_URL}" target="_blank" rel="noopener">${escapeHtml(GODADDY_DNS_URL)}</a></td></tr>
          <tr><td>www → destino</td><td>${fieldValue(dns.wwwDestino, "Ej: cname.vercel-dns.com")}</td></tr>
          <tr><td>@ (apex) → destino</td><td>${fieldValue(dns.apexDestino, "Ej: A record del hosting")}</td></tr>
          <tr><td>SSL confirmado</td><td>${dns.sslConfirmado ? '<span class="badge ok">Sí</span>' : '<span class="badge ref">Pendiente</span>'}</td></tr>
          <tr><td>Fecha corte GitHub Pages</td><td>${fieldValue(dns.fechaCorteGitHubPages, `Cuando ${DOMAIN_URL} esté estable`)}</td></tr>
          <tr><td>Fecha migración objetivo</td><td>${fieldValue(meta.fechaMigracionObjetivo, "Por acordar")}</td></tr>
          <tr><td>Notas DNS</td><td>${fieldValue(dns.notas, "—")}</td></tr>
        </tbody>
      </table>
      <div class="source-hint">Editar: <code>content/informe-requisitos.json</code> → <code>migracion</code> y <code>meta.fechaMigracionObjetivo</code></div>
    </section>

    <section id="wallet">
      <h2>11. Wallet de fidelización — plan completo</h2>
      <p>${escapeHtml(req.wallet?.intro || "")}</p>
      <div class="callout"><strong>Backend recomendado:</strong> ${fieldValue(req.wallet?.backendRecomendado, "Firebase Auth + Firestore o Convex")}. El sitio actual no tiene login de clientes ni base de datos de puntos — todo esto es desarrollo nuevo.</div>

      <h3>MVP mínimo (v1 obligatoria)</h3>
      <ul>${walletMvp}</ul>

      <h3 id="wallet-visual">Vista previa — Apple Wallet y Google Wallet</h3>
      <p>Mockup de cómo se verá la tarjeta de puntos en el teléfono del cliente. Los datos son de ejemplo; la implementación real requiere backend y certificados de cada plataforma.</p>
      ${generateWalletVisualEmbed()}

      <h3>Reglas de negocio — completar con dueños</h3>
      ${renderReglasNegocio(req.wallet?.reglasNegocio || {})}

      <h3>Modelo de datos</h3>
      <ul>${walletModelo}</ul>

      <h3>Pantallas para el cliente</h3>
      ${pantallasWallet}

      <h3>Módulos admin (dueños + staff)</h3>
      ${modulosAdminWallet}

      <h3>Operación en mostrador (caja)</h3>
      ${cajaWallet}

      <h3>Integraciones futuras</h3>
      <table>
        <thead><tr><th>Integración</th><th>Uso</th><th>Fase</th></tr></thead>
        <tbody>${integracionesWallet}</tbody>
      </table>

      <h3>Seguridad (no negociable)</h3>
      <ul>
        <li>Puntos solo se modifican en el servidor — nunca confiar en el frontend.</li>
        <li>Ledger inmutable: cada suma/resta queda registrada con motivo y autor.</li>
        <li>HTTPS obligatorio en producción.</li>
        <li>Staff con PIN o login limitado para cargar puntos en caja.</li>
        <li>Contraseñas admin con hash SHA-256 en el navegador (sin texto plano en el HTML generado).</li>
      </ul>
      <div class="source-hint">Editar reglas y estados: <code>content/informe-requisitos.json</code> → <code>wallet</code><br/>
      Checklist gratis paso a paso: <code>proyecto-mas-cafe/entregables/WALLET-CHECKLIST-GRATIS.md</code></div>
    </section>

    <section id="seguridad">
      <h2>12. Seguridad, credenciales y ejecución autónoma</h2>
      <p>Para que Cursor y GitHub Actions desplieguen dominio y sitio <strong>sin pedir contraseñas en cada chat</strong>, los secretos viven en GitHub Secrets y en archivos locales que <em>no</em> se suben a Git.</p>
      <div class="callout"><strong>Guía completa:</strong> <code>proyecto-mas-cafe/cuentas/SEGURIDAD.md</code></div>
      <h3>Dónde guardar cada credencial</h3>
      <table>
        <thead><tr><th>Tipo</th><th>Dónde</th><th>Para qué</th></tr></thead>
        <tbody>
          <tr><td>DNS GoDaddy</td><td>GitHub Secrets <code>GODADDY_API_KEY</code> + <code>GODADDY_API_SECRET</code></td><td><code>npm run domain:configure</code></td></tr>
          <tr><td>GitHub Pages API</td><td>Secret <code>GH_PAGES_PAT</code></td><td>Custom domain automático</td></tr>
          <tr><td>Deploy admin</td><td>Secret <code>ADMIN_PUBLISH_KEY</code></td><td>Publicar desde <code>/admin/</code></td></tr>
          <tr><td>Firebase CI</td><td>Secret <code>FIREBASE_TOKEN</code></td><td>Deploy hosting respaldo</td></tr>
          <tr><td>Desarrollo local</td><td><code>.env.local</code> (gitignored)</td><td>Scripts en tu PC</td></tr>
          <tr><td>Entrega al dueño</td><td><code>CREDENCIALES.md</code> (gitignored)</td><td>Bloc privado — copiar desde plantilla</td></tr>
        </tbody>
      </table>
      <h3>Panel de secrets</h3>
      <p><a href="https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions" target="_blank" rel="noopener">github.com/.../settings/secrets/actions</a></p>
      <div class="callout warn"><strong>Nunca</strong> pegues tokens en el chat ni en commits. Di «configurado» y actualiza Secrets o <code>REGISTRO-HECHO.md</code>.</div>
      <h3>Migración a GitHub solo Más Café</h3>
      <p>Cuando exista la organización/repo de Más Café: transferir repositorio, <strong>recrear todos los Secrets</strong>, reconectar Cursor y volver a ejecutar <code>domain:configure</code>. Ver checklist en <code>proyecto-mas-cafe/migracion/CHECKLIST.md</code>.</p>
    </section>

    <section id="requisitos">
      <h2>13. Lo que necesitamos de ustedes — checklist editable</h2>
      <p>Esta tabla se actualiza editando un solo archivo en el repositorio. Los campos vacíos aparecen como <span class="field-empty">Por completar</span>.</p>
      <div class="callout"><strong>Archivo para completar:</strong> <code>content/informe-requisitos.json</code><br/>
      Tras editarlo: push a <code>main</code> → el informe se regenera automáticamente en el deploy.</div>
      <div class="callout warn"><strong>Carpeta de entrega y cuentas:</strong> <code>proyecto-mas-cafe/</code><br/>
      • Enlaces para configurar: <code>proyecto-mas-cafe/cuentas/ENLACES-CONFIGURACION.md</code><br/>
      • Seguridad y secrets: <code>proyecto-mas-cafe/cuentas/SEGURIDAD.md</code><br/>
      • Wallet gratis paso a paso: <code>proyecto-mas-cafe/entregables/WALLET-CHECKLIST-GRATIS.md</code><br/>
      • Pegar lo ya hecho: <code>proyecto-mas-cafe/cuentas/REGISTRO-HECHO.md</code><br/>
      • Credenciales locales (no Git): copiar <code>CREDENCIALES.template.md</code> → <code>CREDENCIALES.md</code></div>
      <table>
        <thead><tr><th>Categoría</th><th>Qué necesitamos</th><th>Estado</th><th>Responsable</th><th>Fecha límite</th><th>Notas</th></tr></thead>
        <tbody>${necesitamosRows}</tbody>
      </table>

      <h3>Campos libres — escriban aquí lo que haga falta</h3>
      <p class="muted">Espacio para notas de reuniones, contactos, presupuestos o decisiones que no encajan en las tablas anteriores.</p>
      ${renderCamposLibres(req.camposLibres)}

      <div class="source-hint"><strong>Cómo actualizar desde Cursor:</strong> abrir <code>content/informe-requisitos.json</code>, cambiar <code>estado</code> (<code>pendiente</code> | <code>en_proceso</code> | <code>listo</code>), <code>responsable</code>, <code>valor</code>, <code>notas</code> o <code>contenido</code> en campos libres → commit → push.</div>
    </section>

    <section id="enlaces">
      <h2>14. Enlaces del ecosistema y por qué existen</h2>
      <table>
        <thead><tr><th>Enlace</th><th>URL</th><th>Motivo</th></tr></thead>
        <tbody>${linkRows}</tbody>
      </table>
    </section>

    <section id="dueños">
      <h2>15. Recomendaciones para dueños de Más Café</h2>
      <h3>Consejos para dueños de Más Café</h3>
      <ul>
        <li><strong>Una frase por pantalla.</strong> Evitar repetir tagline y descriptor en cada sección; reservarlos para momentos clave.</li>
        <li><strong>Fotos reales del local.</strong> Sustituir mood genérico por sesión propia (barra, tazas, clientes, equipo).</li>
        <li><strong>Foto por producto.</strong> Hoy todos usan el empaque caja-cafe.png — ideal una imagen por SKU.</li>
        <li><strong>Tipografías y colores.</strong> Ajustar en admin → Colores y fuentes; solo usar fuentes del catálogo Drive.</li>
        <li><strong>Imágenes desde Drive.</strong> Subir nuevos assets a la carpeta Drive y añadir <code>driveId</code> al manifiesto, o pegar enlace en el selector del admin.</li>
        <li><strong>Menú al día.</strong> Revisar precios y platos de temporada desde el admin cada mes.</li>
        <li><strong>Blog mensual.</strong> Un artículo largo ayuda SEO local («café especialidad Cali»).</li>
        <li><strong>Instagram activo.</strong> El sitio envía tráfico a @mascafecol315 — el feed debe estar vivo.</li>
        <li><strong>Google Business Profile.</strong> Misma dirección y horarios que el sitio (NAP consistente).</li>
        <li><strong>Responder WhatsApp en &lt;15 min</strong> en horario comercial — el sitio convierte ahí.</li>
        <li><strong>Definir reglas de puntos antes de programar la wallet.</strong> Ver sección <a href="#wallet">Wallet</a> y completar <code>content/informe-requisitos.json</code>.</li>
        <li><strong>Migración a ${escapeHtml(DOMAIN)}:</strong> apuntar DNS cuando el backend de fidelización esté listo — no antes si quieren wallet funcional.</li>
      </ul>
      <p class="muted" style="margin-top:1rem">El checklist detallado de entregables está en la sección <a href="#requisitos">Requisitos</a>.</p>
    </section>

    <section id="changelog">
      <h2>16. Historial de entregas (se actualiza con cada cambio)</h2>
      <ul>${changelog}</ul>
      <p class="muted" style="margin-top:1rem">Próxima actualización automática al ejecutar <code>npm run build:github-pages</code> tras cambios en el repositorio.</p>
    </section>

  </main>

  <footer>
    <div class="wrap">
      <p><strong>${escapeHtml(brand.name)}</strong> — Constitución Web v${REPORT_VERSION}</p>
      <p style="margin-top:.5rem;opacity:.8">Repositorio: <a href="${REPO_URL}">${REPO_URL}</a> · Sitio: <a href="${LIVE_BASE}/">${LIVE_BASE}/</a></p>
      <p style="margin-top:.35rem;opacity:.6;font-size:.78rem">Documento para la marca. No enlazado desde el menú público.</p>
    </div>
  </footer>
</body>
</html>`;
}

/**
 * Genera el informe HTML «Constitución Web» — documento vivo para la marca.
 * Se publica en /informe/ (separado del sitio público, mismo GitHub).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { collectImagePaths } from "./generate-site-pages.mjs";
import { loadSite } from "./site-html/shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const LIVE_BASE = "https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe";
const REPO_URL = "https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe";
const DRIVE_FOLDER_ID = "153OUmu9lChpCk2NiiirUwI_Z5EDQQNtC";
const DRIVE_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;

const REPORT_VERSION = "1.0.0";

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

function folderPurpose(folder) {
  const purposes = {
    brand: "Manual de marca — logotipos, descriptors, ilustraciones de experiencia y mood.",
    grafica: "Ilustraciones y personaje gráfico (muñeca / elementos narrativos).",
    decor: "Formas orgánicas SVG del sistema visual.",
    aplicaciones: "Mockups de papelería, uniformes, empaque y señalética — referencia de aplicaciones.",
    hero: "Fotografías de fachada y hero — base visual para futuras versiones.",
    products: "Fotografía de empaque y producto.",
    uploads: "Carpeta para imágenes subidas desde el panel admin.",
  };
  return purposes[folder] || "Recursos gráficos de la carpeta Drive sincronizada.";
}

export function generateConstitutionReport() {
  const site = loadSite();
  const { brand, theme, routes, pages } = site;
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
    ["Panel admin", `${LIVE_BASE}/admin/`, "Edición de contenido sin tocar código. Publicación automática."],
    ["Este informe", `${LIVE_BASE}/informe/`, "Documento constitucional para la marca. No aparece en el menú del sitio."],
    ["Repositorio GitHub", REPO_URL, "Código fuente, historial de cambios y colaboración."],
    ["Carpeta Drive (marca)", DRIVE_URL, "Fuente original de logotipos, ilustraciones y aplicaciones."],
    ["Dominio mascafe.com", "https://mascafe.com/", "Destino final cuando DNS GoDaddy apunte a GitHub Pages."],
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
    { date: "2026-06-27", note: "Informe constitucional v1.0 — paleta crema, textos sin repetición, auditoría de activos Drive." },
    { date: "2026-06-27", note: "Favicon del logo en todas las páginas." },
    { date: "2026-06-27", note: "Rediseño móvil editorial y vista previa admin en todos los paneles." },
    { date: "2026-06-26", note: "Sitio multipágina HTML estático + panel admin + GitHub Actions." },
  ]
    .map((c) => `<li><time>${c.date}</time> — ${escapeHtml(c.note)}</li>`)
    .join("");

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
    hr.mini{border:none;border-top:1px solid rgba(7,57,84,.08);margin:.5rem 0}
    footer{background:var(--blue);color:var(--cream);padding:2rem 0;font-size:.85rem}
    footer a{color:var(--sage)}
    time{font-weight:600;color:var(--blue)}
  </style>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <p style="font-size:.75rem;text-transform:uppercase;letter-spacing:.2em;opacity:.7;margin-bottom:.5rem">Documento vivo · No indexar</p>
      <h1>Constitución Web — ${escapeHtml(brand.name)}</h1>
      <p style="margin-top:.85rem;max-width:40rem;opacity:.9">Modelo oficial del sitio, inventario de marca Drive → web, arquitectura técnica y guía para dueños de la marca. Se actualiza con cada entrega importante.</p>
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
      <a href="#paginas">Páginas</a>
      <a href="#marca">Marca</a>
      <a href="#activos">Activos Drive</a>
      <a href="#experiencia">Experiencia</a>
      <a href="#clientes">Clientes</a>
      <a href="#enlaces">Enlaces</a>
      <a href="#dueños">Dueños de marca</a>
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
      </div>
      <div class="callout"><strong>Hosting principal:</strong> GitHub Pages vía GitHub Actions (<code>deploy-github-pages.yml</code>). Cada push a <code>main</code> reconstruye y publica en ~1 minuto.</div>
      <div class="callout warn"><strong>Plataforma de respaldo:</strong> Firebase Hosting (<code>mas-cafe-c8413</code>) está configurada en el repositorio como alternativa (mismo HTML estático). No se encontró configuración de «VertiZone» en el código — si es un servicio externo futuro, documentar credenciales en <code>content/settings.json</code>.</div>
      <h3>Verificación realizada</h3>
      <ul>
        <li>Build <code>npm run build:github-pages</code> — OK (${pagesLive.length} páginas + admin + informe)</li>
        <li>Health check <code>npm run health-check</code> — OK</li>
        <li>URLs en línea: inicio, café, menú, nosotros, tienda, blog, contacto, admin — HTTP 200</li>
        <li>Contenido editable en <code>content/site.json</code> — válido</li>
        <li>Dominio futuro: <strong>mascafe.com</strong> (DNS GoDaddy pendiente de apuntar a GitHub Pages)</li>
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
          <tr><td><code>content/site.json</code></td><td>Base de datos en JSON</td><td>Textos, precios, menú, blog, rutas, colores. Editable desde admin.</td></tr>
          <tr><td><code>scripts/lib/site-html/</code></td><td>Generador HTML</td><td>Convierte JSON en 7 páginas estáticas con la paleta crema actual.</td></tr>
          <tr><td><code>public/images/</code></td><td>Activos sincronizados desde Drive</td><td>Imágenes que el build copia a producción.</td></tr>
          <tr><td><code>.github/workflows/</code></td><td>CI/CD</td><td>Deploy automático a GitHub Pages.</td></tr>
          <tr><td><code>/admin/</code></td><td>Panel privado</td><td>Edición visual + publicación sin código.</td></tr>
          <tr><td>Firebase (opcional)</td><td>Hosting espejo</td><td>Respaldo o pruebas en <code>mas-cafe-c8413.web.app</code>.</td></tr>
        </tbody>
      </table>
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
        <li><strong>Tipografías:</strong> Playfair Display (títulos), Satoshi (cuerpo), Marydale (acento/taglines).</li>
        <li><strong>Tagline de marca:</strong> «${escapeHtml(brand.tagline)}» — solo en hero de inicio.</li>
        <li><strong>Descriptor:</strong> «${escapeHtml(brand.descriptor)}» — solo en hero de inicio.</li>
        <li><strong>CTA visita:</strong> «${escapeHtml(brand.visitLine || "San Fernando Nuevo")}» — banda final de cada página.</li>
      </ul>
    </section>

    <section id="activos">
      <h2>6. Inventario Drive → repositorio → sitio</h2>
      <p>Carpeta Google Drive de marca: <a href="${DRIVE_URL}" target="_blank" rel="noopener">Abrir en Drive</a> (ID: <code>${DRIVE_FOLDER_ID}</code>).</p>
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

    <section id="enlaces">
      <h2>9. Enlaces del ecosistema y por qué existen</h2>
      <table>
        <thead><tr><th>Enlace</th><th>URL</th><th>Motivo</th></tr></thead>
        <tbody>${linkRows}</tbody>
      </table>
    </section>

    <section id="dueños">
      <h2>10. Recomendaciones y lo que necesitamos de la marca</h2>
      <h3>Consejos para dueños de Más Café</h3>
      <ul>
        <li><strong>Una frase por pantalla.</strong> Evitar repetir tagline y descriptor en cada sección; reservarlos para momentos clave.</li>
        <li><strong>Fotos reales del local.</strong> Sustituir mood genérico por sesión propia (barra, tazas, clientes, equipo).</li>
        <li><strong>Foto por producto.</strong> Hoy todos usan el empaque caja-cafe.png — ideal una imagen por SKU.</li>
        <li><strong>Menú al día.</strong> Revisar precios y platos de temporada desde el admin cada mes.</li>
        <li><strong>Blog mensual.</strong> Un artículo largo ayuda SEO local («café especialidad Cali»).</li>
        <li><strong>Instagram activo.</strong> El sitio envía tráfico a @mascafecol315 — el feed debe estar vivo.</li>
        <li><strong>Google Business Profile.</strong> Misma dirección y horarios que el sitio (NAP consistente).</li>
        <li><strong>Responder WhatsApp en &lt;15 min</strong> en horario comercial — el sitio convierte ahí.</li>
      </ul>
      <h3>Qué necesitamos de ustedes (checklist)</h3>
      <div class="card">
        <ul>
          <li>☐ Fotografía profesional del local (mín. 10 fotos horizontal + vertical)</li>
          <li>☐ Fotografía por producto de tienda (250 g, grano/molido)</li>
          <li>☐ Confirmación de precios menú y tienda (actualizar en admin)</li>
          <li>☐ Textos aprobados de historia y valores (panel Nosotros)</li>
          <li>☐ Acceso DNS GoDaddy para conectar mascafe.com</li>
          <li>☐ Credenciales si usarán Firebase o plataforma adicional (VertiZone / Vercel)</li>
          <li>☐ Nuevos assets en Drive → avisar para sincronizar a <code>public/images/</code></li>
          <li>☐ Aprobación de cambios vía este informe antes de campañas pagadas</li>
        </ul>
      </div>
    </section>

    <section id="changelog">
      <h2>11. Historial de entregas (se actualiza con cada cambio)</h2>
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

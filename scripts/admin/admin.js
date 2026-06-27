/* global SITE_BOOT, REPO_CONFIG, USER_HASHES, PUBLISH_SECRET, DEFAULT_ROUTES */

(function () {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  let content = structuredClone(SITE_BOOT);
  let dirty = false;
  let currentPanel = "overview";
  const pendingUploads = [];

  if (!content.theme) {
    content.theme = {
      cream: "#f6f5ef", creamDark: "#ebe8df", blue: "#073954", blueMid: "#0a4d6e",
      green: "#1bb175", sage: "#d8daa8", brown: "#b07a3a", brownDark: "#8a4a24",
      cherry: "#e84545", charcoal: "#2b2b2b",
    };
  }
  if (!content.pages) content.pages = {};
  if (!content.brewGuide) content.brewGuide = [];
  if (!content.routes?.length) content.routes = structuredClone(DEFAULT_ROUTES);
  if (!content.analytics) {
    content.analytics = {
      clicks: { whatsapp: 0, tienda: 0, contacto: 0, instagram: 0, facebook: 0 },
      monthlyIncome: [],
    };
  }

  const SESSION_MAX_MS = 8 * 60 * 60 * 1000;

  function getSession() {
    const raw = sessionStorage.getItem("mc_admin");
    if (!raw) return null;
    try {
      const s = JSON.parse(raw);
      if (!s.user || Date.now() - (s.at || 0) > SESSION_MAX_MS) {
        sessionStorage.removeItem("mc_admin");
        return null;
      }
      return s;
    } catch {
      sessionStorage.removeItem("mc_admin");
      return null;
    }
  }

  function requireAuth() {
    if (!getSession()) {
      document.body.classList.remove("admin-authed");
      $("#app")?.classList.add("hidden");
      $("#login-screen")?.classList.remove("hidden");
      $("#panel-root") && ($("#panel-root").innerHTML = "");
      toast("Sesión expirada. Inicia sesión de nuevo.", "error");
      return false;
    }
    return true;
  }

  function ensureRoutes() {
    const byId = new Map(content.routes.map((r) => [r.id, r]));
    content.routes = DEFAULT_ROUTES.map((def) => ({ ...def, ...byId.get(def.id) }));
    for (const r of byId.values()) {
      if (!r.builtin && !content.routes.find((m) => m.id === r.id)) {
        content.routes.push({ ...r });
      }
    }
  }
  ensureRoutes();

  function slugify(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  }

  const IMAGE_SPECS = {
    experience: "800 × 1000 px (vertical 4:5). PNG o WebP. Máx. 500 KB. Luz natural, sin texto encima.",
    product: "600 × 600 px (cuadrada). PNG con fondo transparente. Máx. 400 KB.",
    blog: "1200 × 750 px (horizontal 16:10). JPG o WebP. Máx. 600 KB.",
    nosotros: "800 × 1000 px (vertical 4:5). JPG o WebP. Máx. 500 KB. Ambiente del local.",
  };

  const PANELS = [
    { id: "overview", label: "Resumen", icon: "◉" },
    { id: "help", label: "Cómo funciona", icon: "?" },
    { id: "analytics", label: "Análisis", icon: "▤" },
    { id: "brand", label: "Marca e inicio", icon: "◇" },
    { id: "theme", label: "Colores", icon: "◐" },
    { id: "sections", label: "Secciones", icon: "▣" },
    { id: "pages", label: "Textos de páginas", icon: "¶" },
    { id: "experiences", label: "Experiencias", icon: "◎" },
    { id: "products", label: "Café / Tienda", icon: "☕" },
    { id: "menu", label: "Menú coffee shop", icon: "≡" },
    { id: "blog", label: "Blog", icon: "✎" },
    { id: "nosotros", label: "Nosotros", icon: "♡" },
    { id: "contacto", label: "Contacto", icon: "✉" },
    { id: "marquee", label: "Marquee", icon: "∞" },
    { id: "config", label: "Publicar", icon: "⚙" },
  ];

  const PREVIEW_PANELS = new Set(PANELS.map((p) => p.id));

  const THEME_FIELDS = [
    ["cream", "Crema (fondo)"],
    ["creamDark", "Crema oscura"],
    ["blue", "Azul principal"],
    ["blueMid", "Azul medio"],
    ["green", "Verde WhatsApp"],
    ["sage", "Verde salvia"],
    ["brown", "Marrón acento"],
    ["charcoal", "Texto oscuro"],
  ];

  function toast(msg, type = "") {
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4500);
  }

  function markDirty() {
    dirty = true;
    $("#dirty-badge")?.classList.remove("hidden");
    updateContextPreview(currentPanel);
  }

  function formatCop(n) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  function wrapPanel(html, panelId) {
    if (!PREVIEW_PANELS.has(panelId)) return html;
    return `<div class="panel-split">
      <div class="panel-editor">${html}</div>
      <aside class="panel-preview-col" aria-label="Vista previa de ${panelId}">
        <div class="panel-preview-sticky">
          <div class="panel-preview-head">
            <span class="panel-preview-label">Así se verá al publicar</span>
            <span class="chip chip-warn${dirty ? "" : " hidden"}">Sin publicar</span>
          </div>
          <div class="panel-preview-frame" id="context-preview" data-panel="${panelId}"></div>
        </div>
      </aside>
    </div>`;
  }

  function previewBrand() {
    const b = content.brand;
    return `<div class="ctx-preview ctx-hero">
      <p class="ctx-tagline">${escapeHtml(b.tagline || "")}</p>
      <h2 class="ctx-title">${escapeHtml(b.headline || "")}</h2>
      <p class="ctx-sub">${escapeHtml(b.subheadline || "")}</p>
      <p class="ctx-desc">${escapeHtml(b.descriptor || "")}</p>
      <span class="ctx-btn">Comprar café fresco</span>
    </div>`;
  }

  function previewTheme() {
    const t = content.theme;
    return `<div class="ctx-preview ctx-swatches">
      ${[["Crema", t.cream], ["Azul", t.blue], ["Salvia", t.sage], ["Marrón", t.brown]]
        .map(([label, color]) => `<div class="ctx-swatch" style="background:${color}"><span>${label}</span></div>`).join("")}
      <div class="ctx-hero ctx-hero-mini" style="margin-top:.75rem">
        <span class="ctx-btn">Botón salvia</span>
      </div>
    </div>`;
  }

  function previewSections() {
    const nav = content.routes.filter((r) => r.enabled && r.inNav && r.id !== "home");
    return `<div class="ctx-preview ctx-nav">
      <p class="ctx-label">Menú del sitio</p>
      <div class="ctx-nav-links">${nav.map((r) => `<span>${escapeHtml(r.label)}</span>`).join("") || "<span class='ctx-muted'>Sin secciones en menú</span>"}
        <span class="ctx-btn ctx-btn-sm">Comprar café</span>
      </div>
      <p class="ctx-note">${content.routes.filter((r) => r.enabled && r.id !== "home").length} secciones activas</p>
    </div>`;
  }

  function previewOverview() {
    const lines = (content.marquee || []).slice(0, 3).join(" · ");
    return `<div class="ctx-preview-stack">
      ${previewBrand()}
      <div class="ctx-preview ctx-marquee">
        <p class="ctx-label">Marquee del inicio</p>
        <div class="ctx-marquee-track">${escapeHtml(lines || "Texto del marquee")}</div>
      </div>
      <div class="ctx-preview ctx-stats">
        <p class="ctx-label">Resumen del sitio</p>
        <p class="ctx-body">${content.experiences.length} experiencias · ${content.products.length} productos · ${content.menu.length} categorías de menú</p>
      </div>
    </div>`;
  }

  function previewHelp() {
    return `<div class="ctx-preview ctx-help">
      <p class="ctx-label">Cómo editar</p>
      <ol class="ctx-steps">
        <li>Elige una sección del menú lateral</li>
        <li>Edita los campos a la izquierda</li>
        <li>Revisa la vista previa a la derecha</li>
        <li>Pulsa «Guardar y publicar»</li>
      </ol>
      <div class="ctx-preview ctx-hero ctx-hero-mini" style="margin-top:.75rem">
        <p class="ctx-sub" style="opacity:.7">Cada sección tiene su propia vista previa</p>
      </div>
    </div>`;
  }

  function previewAnalytics() {
    const c = content.analytics.clicks;
    const total = Object.values(c).reduce((a, b) => a + b, 0);
    const income = [...(content.analytics.monthlyIncome || [])].sort((a, b) => a.month.localeCompare(b.month)).slice(-3);
    const maxIncome = Math.max(...income.map((i) => i.amount), 1);
    return `<div class="ctx-preview ctx-analytics">
      <p class="ctx-label">Clics · ${total} total</p>
      ${Object.entries(c).map(([k, v]) => `
        <div class="ctx-bar-row"><span>${k}</span><div class="ctx-bar"><i style="width:${total ? (v / total) * 100 : 0}%"></i></div><strong>${v}</strong></div>`).join("")}
      ${income.length ? `<p class="ctx-label" style="margin-top:.75rem">Ingresos recientes</p>
        ${income.map((row) => `<div class="ctx-bar-row"><span>${row.month}</span><div class="ctx-bar ctx-bar-brown"><i style="width:${(row.amount / maxIncome) * 100}%"></i></div></div>`).join("")}` : ""}
    </div>`;
  }

  function previewConfig() {
    return `<div class="ctx-preview-stack">
      ${previewBrand()}
      <div class="ctx-preview ctx-publish-status">
        <p class="ctx-label">Estado de publicación</p>
        <p class="ctx-body">${dirty ? "Hay cambios sin publicar. Pulsa «Guardar y publicar»." : "Sin cambios pendientes."}</p>
        <p class="ctx-note">${content.routes.filter((r) => r.enabled && r.id !== "home").length} secciones activas</p>
      </div>
    </div>`;
  }

  function previewPages() {
    const blocks = [
      ["home", "Inicio", content.pages?.home],
      ["cafe", "Café", content.pages?.cafe],
      ["menu", "Menú", content.pages?.menu],
      ["nosotros", "Nosotros", content.pages?.nosotros],
      ["tienda", "Tienda", content.pages?.tienda],
      ["blog", "Blog", content.pages?.blog],
      ["contacto", "Contacto", content.pages?.contacto],
    ];
    return `<div class="ctx-preview ctx-pages-list">
      ${blocks.map(([key, label, pg]) => `
        <div class="ctx-page-block">
          <p class="ctx-label">${label}</p>
          <p class="ctx-soul" style="text-align:left;font-size:.78rem">${escapeHtml(pg?.tagline || "—")}</p>
          <h3 class="ctx-h3">${escapeHtml(pg?.headline || "—")}</h3>
        </div>`).join("")}
    </div>`;
  }

  function previewExperiences() {
    const exp = content.experiences[0];
    if (!exp) return `<p class="ctx-muted">Añade una experiencia para ver la vista previa.</p>`;
    const src = imgPreviewSrc(exp.image);
    return `<div class="ctx-preview ctx-card-row">
      ${src ? `<img src="${src}" alt="" class="ctx-thumb"/>` : ""}
      <div>
        <h3 class="ctx-h3">${escapeHtml(exp.title)}</h3>
        <p class="ctx-sub">${escapeHtml(exp.subtitle || "")}</p>
        <p class="ctx-body">${escapeHtml((exp.description || "").slice(0, 120))}${(exp.description || "").length > 120 ? "…" : ""}</p>
      </div>
    </div>`;
  }

  function previewProducts() {
    const p = content.products.find((x) => x.featured) || content.products[0];
    if (!p) return `<p class="ctx-muted">Añade un producto para ver la vista previa.</p>`;
    const src = imgPreviewSrc(p.image);
    return `<div class="ctx-preview ctx-product">
      ${src ? `<img src="${src}" alt="" class="ctx-product-img"/>` : ""}
      <h3 class="ctx-h3">${escapeHtml(p.name)}</h3>
      <p class="ctx-meta">${escapeHtml(p.variety || "")} · ${escapeHtml(p.region || "")}</p>
      <p class="ctx-price">${formatCop(p.price)}</p>
    </div>`;
  }

  function previewMenu() {
    const pm = content.pages?.menu || {};
    const cat = content.menu[0];
    const items = (cat?.items || []).slice(0, 4);
    return `<div class="ctx-preview ctx-menu">
      <p class="ctx-soul">${escapeHtml(pm.tagline || content.brand.tagline || "")}</p>
      <h2 class="ctx-menu-h">${escapeHtml(pm.headline || "Menú")}</h2>
      ${pm.intro ? `<p class="ctx-body">${escapeHtml(pm.intro)}</p>` : ""}
      ${cat ? `<p class="ctx-cat">${escapeHtml(cat.name)}</p>` : ""}
      ${items.map((i) => `<div class="ctx-menu-item"><span>${escapeHtml(i.name)}</span><span>${formatCop(i.price)}</span></div>`).join("")}
    </div>`;
  }

  function previewBlog() {
    const post = content.blog.find((p) => p.published) || content.blog[0];
    if (!post) return `<p class="ctx-muted">Añade un artículo para ver la vista previa.</p>`;
    const src = imgPreviewSrc(post.image);
    return `<div class="ctx-preview ctx-blog">
      ${src ? `<img src="${src}" alt="" class="ctx-blog-img"/>` : ""}
      <p class="ctx-label">${escapeHtml(post.category || "")} · ${escapeHtml(post.date || "")}</p>
      <h3 class="ctx-h3">${escapeHtml(post.title)}</h3>
      <p class="ctx-body">${escapeHtml(post.excerpt || "")}</p>
    </div>`;
  }

  function previewNosotros() {
    const b = content.brand;
    const src = imgPreviewSrc(b.nosotrosImage || "/images/brand/mood.png");
    const val = b.values?.[0];
    return `<div class="ctx-preview ctx-nosotros">
      ${src ? `<img src="${src}" alt="" class="ctx-blog-img"/>` : ""}
      <p class="ctx-body">${escapeHtml((b.story || b.purpose || "Tu historia aparecerá aquí.").slice(0, 160))}${(b.story || b.purpose || "").length > 160 ? "…" : ""}</p>
      ${b.quote ? `<blockquote class="ctx-quote">${escapeHtml(b.quote)}</blockquote>` : ""}
      ${val ? `<div class="ctx-value"><strong>${escapeHtml(val.title)}</strong><p>${escapeHtml(val.text)}</p></div>` : ""}
    </div>`;
  }

  function previewContacto() {
    const b = content.brand;
    return `<div class="ctx-preview ctx-contact">
      <h3 class="ctx-h3">Visítanos</h3>
      <p class="ctx-body">${escapeHtml(b.address || "")}<br/>${escapeHtml(b.city || "")}</p>
      <p class="ctx-body">${escapeHtml(b.hours || "")}</p>
      <p class="ctx-body" style="margin-top:.75rem">${escapeHtml(b.phone || "")}<br/>${escapeHtml(b.email || "")}</p>
      <div class="ctx-links">
        <span>WhatsApp</span>
        ${b.social?.instagram ? "<span>Instagram</span>" : ""}
        ${b.social?.facebook ? "<span>Facebook</span>" : ""}
      </div>
    </div>`;
  }

  function previewMarquee() {
    const lines = (content.marquee || []).slice(0, 4);
    return `<div class="ctx-preview ctx-marquee">
      <p class="ctx-label">Banda inferior del inicio</p>
      <div class="ctx-marquee-track">${escapeHtml(lines.join(" · ") || "Texto del marquee")}</div>
    </div>`;
  }

  function buildContextPreview(panelId) {
    const map = {
      overview: previewOverview,
      help: previewHelp,
      analytics: previewAnalytics,
      config: previewConfig,
      brand: previewBrand,
      theme: previewTheme,
      sections: previewSections,
      pages: previewPages,
      experiences: previewExperiences,
      products: previewProducts,
      menu: previewMenu,
      blog: previewBlog,
      nosotros: previewNosotros,
      contacto: previewContacto,
      marquee: previewMarquee,
    };
    return (map[panelId] || (() => ""))();
  }

  function updateContextPreview(panelId) {
    const frame = $("#context-preview");
    if (!frame || frame.dataset.panel !== panelId) return;
    frame.innerHTML = buildContextPreview(panelId);
    const chip = frame.closest(".panel-preview-sticky")?.querySelector(".chip-warn");
    if (chip) chip.classList.toggle("hidden", !dirty);
  }

  function imgPreviewSrc(path) {
    if (!path) return "";
    if (path.startsWith("data:")) return path;
    const pending = pendingUploads.find((u) => u.path === path);
    if (pending) return `data:${pending.mime};base64,${pending.base64}`;
    return "../" + path.replace(/^\//, "");
  }

  function imageField(id, label, value, specKey, onChange) {
    const spec = IMAGE_SPECS[specKey] || IMAGE_SPECS.blog;
    const src = imgPreviewSrc(value);
    return `<div class="img-field" data-img-field="${id}">
      <label>${label}</label>
      <div class="img-preview-wrap">
        ${src ? `<img src="${src}" alt="Vista previa" class="img-preview" data-preview="${id}"/>` : `<div class="img-preview img-preview-empty" data-preview="${id}">Sin imagen</div>`}
      </div>
      <input type="text" id="${id}" class="img-path-input" value="${escapeAttr(value || "")}" placeholder="/images/..."/>
      <label class="btn btn-ghost img-upload-btn">
        Subir imagen
        <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden-file" data-upload="${id}" data-spec="${specKey}"/>
      </label>
      <small class="img-spec">${spec}</small>
    </div>`;
  }

  function bindImageField(root, id, getPath, setPath) {
    const input = $(`#${id}`, root);
    const fileInput = $(`[data-upload="${id}"]`, root);
    if (input) {
      input.addEventListener("input", () => {
        setPath(input.value);
        updatePreview(root, id, input.value);
        markDirty();
      });
    }
    if (fileInput) {
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        try {
          const result = await processImageUpload(file, fileInput.dataset.spec);
          const newPath = `/images/uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
          const existing = pendingUploads.findIndex((u) => u.path === getPath());
          const upload = { path: newPath, base64: result.base64, mime: result.mime };
          if (existing >= 0) pendingUploads.splice(existing, 1, upload);
          else pendingUploads.push(upload);
          setPath(newPath);
          if (input) input.value = newPath;
          updatePreview(root, id, newPath);
          markDirty();
          toast("Imagen lista para publicar", "success");
        } catch (e) {
          toast(e.message, "error");
        }
        fileInput.value = "";
      });
    }
  }

  function updatePreview(root, id, path) {
    const wrap = $(`[data-img-field="${id}"] .img-preview-wrap`, root);
    if (!wrap) return;
    const src = imgPreviewSrc(path);
    wrap.innerHTML = src
      ? `<img src="${src}" alt="Vista previa" class="img-preview" data-preview="${id}"/>`
      : `<div class="img-preview img-preview-empty" data-preview="${id}">Sin imagen</div>`;
  }

  async function processImageUpload(file, specKey) {
    const limits = { experience: 500, product: 400, blog: 600, nosotros: 500 };
    const maxKb = limits[specKey] || 500;
    if (file.size > maxKb * 1024) throw new Error(`La imagen supera ${maxKb} KB. Comprímela antes de subir.`);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      throw new Error("Formato no válido. Usa PNG, JPG o WebP.");
    }
    const base64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = () => rej(new Error("No se pudo leer la imagen"));
      r.readAsDataURL(file);
    });
    return { base64, mime: file.type };
  }

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function login(e) {
    e.preventDefault();
    const user = $("#login-user").value.trim();
    const pass = $("#login-pass").value;
    const hash = await sha256(`mas-cafe-admin-v1:${pass}`);
    const match = USER_HASHES.find((u) => u.username === user && u.hash === hash);
    if (!match) { toast("Usuario o contraseña incorrectos", "error"); return; }
    sessionStorage.setItem("mc_admin", JSON.stringify({
      user: match.username, name: match.name, role: match.role, at: Date.now(),
    }));
    document.body.classList.add("admin-authed");
    showApp(match);
  }

  function showApp(session) {
    if (!session?.user) return;
    document.body.classList.add("admin-authed");
    $("#login-screen").classList.add("hidden");
    $("#app").classList.remove("hidden");
    $("#user-name").textContent = session.name;
    buildNav();
    renderPanel(currentPanel);
    updateStatus();
    refreshFromServer();
  }

  async function refreshFromServer() {
    if (!requireAuth()) return;
    const latest = await fetchLatestContent();
    if (!latest || dirty) return;
    content = mergeForPublish(latest, content);
    renderPanel(currentPanel);
  }

  function logout() {
    sessionStorage.removeItem("mc_admin");
    document.body.classList.remove("admin-authed");
    location.reload();
  }

  function buildNav() {
    const nav = $("#sidebar-nav");
    nav.innerHTML = PANELS.map(
      (p) => `<button type="button" class="nav-btn${p.id === currentPanel ? " active" : ""}" data-panel="${p.id}">${p.icon} ${p.label}</button>`
    ).join("");
    nav.onclick = (e) => {
      const btn = e.target.closest("[data-panel]");
      if (!btn) return;
      currentPanel = btn.dataset.panel;
      $$(".nav-btn", nav).forEach((b) => b.classList.toggle("active", b.dataset.panel === currentPanel));
      renderPanel(currentPanel);
    };
  }

  function field(label, id, value, type = "text", hint = "") {
    const v = value ?? "";
    if (type === "textarea") {
      return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" data-field="${id}">${escapeHtml(String(v))}</textarea>${hint ? `<small>${hint}</small>` : ""}</div>`;
    }
    return `<div class="field"><label for="${id}">${label}</label><input type="${type}" id="${id}" data-field="${id}" value="${escapeAttr(String(v))}"/>${hint ? `<small>${hint}</small>` : ""}</div>`;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  function bindFields(container, obj, prefix = "") {
    container.querySelectorAll("[data-field]").forEach((el) => {
      const key = el.dataset.field.replace(prefix, "");
      const keys = key.split(".");
      el.addEventListener("input", () => {
        let ref = obj;
        for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
        const last = keys[keys.length - 1];
        if (el.type === "number") ref[last] = Number(el.value);
        else if (el.type === "checkbox") ref[last] = el.checked;
        else ref[last] = el.value;
        markDirty();
        if (currentPanel === "theme") applyThemePreview();
        else updateContextPreview(currentPanel);
      });
      if (el.type === "color") {
        el.addEventListener("input", () => applyThemePreview());
      }
    });
  }

  function applyThemePreview() {
    const t = content.theme;
    const root = document.documentElement;
    root.style.setProperty("--cream", t.cream);
    root.style.setProperty("--cream-dark", t.creamDark);
    root.style.setProperty("--blue", t.blue);
    root.style.setProperty("--blue-mid", t.blueMid);
    root.style.setProperty("--green", t.green);
    root.style.setProperty("--sage", t.sage);
    root.style.setProperty("--brown", t.brown);
    root.style.setProperty("--charcoal", t.charcoal);
    updateContextPreview("theme");
  }

  function finishPanel(id, main, html, bindFn) {
    main.innerHTML = wrapPanel(html, id);
    if (bindFn) bindFn(main);
    updateContextPreview(id);
  }

  function renderPanel(id) {
    if (!requireAuth()) return;
    const main = $("#panel-root");
    const titles = {
      overview: "Panel de administración", help: "Cómo funciona",
      analytics: "Análisis e ingresos", brand: "Marca e inicio",
      sections: "Secciones del sitio", theme: "Colores del sitio", pages: "Textos de páginas", experiences: "Experiencias",
      products: "Café y tienda", menu: "Menú coffee shop", blog: "Blog", nosotros: "Nosotros",
      contacto: "Contacto", marquee: "Texto marquee", config: "Publicar cambios",
    };
    $("#panel-title").textContent = titles[id] || id;

    const handlers = {
      overview: () => finishPanel("overview", main, renderOverview()),
      help: () => finishPanel("help", main, renderHelp()),
      analytics: () => finishPanel("analytics", main, renderAnalytics(), bindAnalyticsEvents),
      brand: () => finishPanel("brand", main, renderBrand(), (root) => bindFields(root, content.brand)),
      sections: () => finishPanel("sections", main, renderSections(), bindSectionsEvents),
      theme: () => finishPanel("theme", main, renderTheme(), (root) => { bindThemeEvents(root); applyThemePreview(); }),
      pages: () => finishPanel("pages", main, renderPages(), bindPagesEvents),
      experiences: () => finishPanel("experiences", main, renderExperiences(), bindExperienceEvents),
      products: () => finishPanel("products", main, renderProducts(), bindProductEvents),
      menu: () => finishPanel("menu", main, renderMenu(), bindMenuEvents),
      blog: () => finishPanel("blog", main, renderBlog(), bindBlogEvents),
      nosotros: () => finishPanel("nosotros", main, renderNosotros(), bindNosotrosEvents),
      contacto: () => finishPanel("contacto", main, renderContacto(), (root) => {
        bindFields(root, content.brand);
        bindFields(root, content.brand.social, "social.");
      }),
      marquee: () => finishPanel("marquee", main, renderMarquee(), (root) => {
        $("#marquee-lines", root)?.addEventListener("input", (e) => {
          content.marquee = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
          markDirty();
        });
      }),
      config: () => finishPanel("config", main, renderConfig(), bindConfigEvents),
    };
    (handlers[id] || handlers.overview)();
  }

  function mergePendingClicks() {
    try {
      const pending = JSON.parse(localStorage.getItem("mc_clicks_pending") || "{}");
      for (const [k, v] of Object.entries(pending)) {
        if (typeof v === "number" && content.analytics.clicks[k] !== undefined) {
          content.analytics.clicks[k] += v;
        }
      }
      localStorage.removeItem("mc_clicks_pending");
    } catch { /* ignore */ }
  }

  function renderAnalytics() {
    mergePendingClicks();
    const c = content.analytics.clicks;
    const totalClicks = Object.values(c).reduce((a, b) => a + b, 0);
    const income = [...(content.analytics.monthlyIncome || [])].sort((a, b) => a.month.localeCompare(b.month));
    const maxIncome = Math.max(...income.map((i) => i.amount), 1);
    return `<div class="card"><h3>Clics registrados</h3>
      <p class="analytics-stat">${totalClicks}</p>
      <p style="opacity:.7;font-size:.85rem;margin-bottom:1rem">Interacciones en el sitio público (WhatsApp, tienda, contacto, redes)</p>
      ${Object.entries(c).map(([k, v]) => `
        <div style="margin-bottom:.65rem">
          <div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.25rem">
            <span>${k}</span><strong>${v}</strong>
          </div>
          <div class="analytics-bar-wrap"><div class="analytics-bar" style="width:${totalClicks ? (v / totalClicks) * 100 : 0}%"></div></div>
        </div>`).join("")}
    </div>
    <div class="card"><h3>Tendencia de ingresos (COP)</h3>
      ${income.length ? income.map((row) => `
        <div style="margin-bottom:.75rem">
          <div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.25rem">
            <span>${row.month}</span><strong>${formatCop(row.amount)}</strong>
          </div>
          <div class="analytics-bar-wrap"><div class="analytics-bar" style="width:${(row.amount / maxIncome) * 100}%;background:var(--brown)"></div></div>
        </div>`).join("") : '<p style="opacity:.7">Aún no hay registros. Añade el primer mes abajo.</p>'}
      <div class="grid-2" style="margin-top:1rem">
        <div class="field"><label>Mes (AAAA-MM)</label><input id="income-month" placeholder="2025-06" value="${new Date().toISOString().slice(0, 7)}"/></div>
        <div class="field"><label>Monto COP</label><input id="income-amount" type="number" placeholder="4500000"/></div>
      </div>
      <button type="button" class="btn btn-blue" id="add-income" style="margin-top:.75rem">Registrar ingreso del mes</button>
    </div>`;
  }

  function bindAnalyticsEvents(root) {
    $("#add-income", root)?.addEventListener("click", () => {
      const month = $("#income-month", root)?.value.trim();
      const amount = Number($("#income-amount", root)?.value);
      if (!/^\d{4}-\d{2}$/.test(month)) { toast("Mes inválido. Usa formato 2025-06", "error"); return; }
      if (!amount || amount < 0) { toast("Monto inválido", "error"); return; }
      const existing = content.analytics.monthlyIncome.findIndex((r) => r.month === month);
      if (existing >= 0) content.analytics.monthlyIncome[existing].amount = amount;
      else content.analytics.monthlyIncome.push({ month, amount });
      markDirty();
      renderPanel("analytics");
    });
  }

  function renderOverview() {
    return `
    <div class="status-bar"><span class="status-dot"></span> Sitio público activo · <a href="../" target="_blank" rel="noopener">Ver sitio →</a></div>
    <div class="grid-2">
      <div class="card"><h3>Contenido</h3>
        <p>${content.experiences.length} experiencias · ${content.products.length} productos</p>
        <p>${content.menu.length} categorías · ${content.blog.filter((b) => b.published).length} posts publicados</p>
      </div>
      <div class="card"><h3>Acciones rápidas</h3>
        <div class="row" style="margin-top:.75rem;flex-wrap:wrap;gap:.5rem;display:flex">
          <button type="button" class="btn btn-primary" data-goto="brand">Editar marca</button>
          <button type="button" class="btn btn-ghost" data-goto="theme">Colores</button>
          <button type="button" class="btn btn-ghost" data-goto="sections">Secciones</button>
          <button type="button" class="btn btn-ghost" data-goto="menu">Menú</button>
          <button type="button" class="btn btn-blue" data-goto="config">Publicar</button>
        </div>
      </div>
    </div>
    <div class="card"><h3>Secciones</h3>
      <p style="opacity:.75;margin-bottom:1rem">Cada sección corresponde a una página del sitio público.</p>
      <div class="row" style="display:flex;flex-wrap:wrap;gap:.5rem">${PANELS.filter((p) => !["overview", "help", "config"].includes(p.id)).map((p) => `<button type="button" class="btn btn-ghost" data-goto="${p.id}">${p.label}</button>`).join("")}</div>
    </div>`;
  }

  function renderHelp() {
    return `
    <div class="card"><h3>Guía rápida</h3>
      <ol class="help-steps">
        <li><strong>Edita</strong> el contenido en las secciones del menú lateral. Cada sección muestra a la derecha una vista previa de lo que estás cambiando.</li>
        <li><strong>Gestiona secciones</strong> — activa, desactiva o crea subcarpetas nuevas en «Secciones».</li>
        <li><strong>Revisa imágenes</strong> — cada campo muestra la imagen actual y las medidas recomendadas.</li>
        <li><strong>Publica</strong> con el botón azul «Guardar y publicar». El sitio se actualiza en ~1 minuto.</li>
      </ol>
    </div>
    <div class="card"><h3>Imágenes — especificaciones</h3>
      <ul class="help-list">
        <li><strong>Experiencias / Nosotros:</strong> ${IMAGE_SPECS.experience}</li>
        <li><strong>Productos / Tienda:</strong> ${IMAGE_SPECS.product}</li>
        <li><strong>Blog:</strong> ${IMAGE_SPECS.blog}</li>
      </ul>
      <p style="margin-top:1rem;opacity:.75;font-size:.9rem">Al subir una imagen, se guarda automáticamente al publicar. No necesitas subir archivos manualmente a GitHub.</p>
    </div>
    <div class="card"><h3>Colores</h3>
      <p>En <strong>Colores</strong> puedes cambiar la paleta completa del sitio. Los cambios se ven en la vista previa de esa sección y se aplican al publicar.</p>
    </div>
    <div class="card"><h3>Acceso al panel</h3>
      <p>Desde el sitio público: pie de página → <strong>Administración</strong>.</p>
      <p style="margin-top:.5rem">URL directa: <code>/admin/</code></p>
    </div>`;
  }

  function renderBrand() {
    const b = content.brand;
    return `<div class="card"><h3>Textos de inicio</h3><div class="grid-2">
      ${field("Nombre", "name", b.name)}
      ${field("Descriptor", "descriptor", b.descriptor)}
      ${field("Tagline", "tagline", b.tagline)}
      ${field("Titular principal", "headline", b.headline)}
      ${field("Subtítulo", "subheadline", b.subheadline, "textarea")}
    </div></div>`;
  }

  function renderSections() {
    ensureRoutes();
    const rows = content.routes
      .filter((r) => r.id !== "home")
      .map((r) => {
        const idx = content.routes.indexOf(r);
        return `<tr data-route-idx="${idx}">
          <td><strong>${escapeHtml(r.label)}</strong>${r.builtin ? ' <span class="chip" style="font-size:.65rem">integrada</span>' : ""}</td>
          <td><code>/${escapeHtml(r.slug || "")}/</code></td>
          <td><label class="checkbox-row"><input type="checkbox" data-route-enabled="${idx}" ${r.enabled ? "checked" : ""}/> Activa</label></td>
          <td><label class="checkbox-row"><input type="checkbox" data-route-nav="${idx}" ${r.inNav ? "checked" : ""} ${!r.enabled ? "disabled" : ""}/> En menú</label></td>
          <td>${r.builtin ? "—" : `<button type="button" class="btn btn-ghost" data-del-route="${idx}">Eliminar</button>`}</td>
        </tr>`;
      })
      .join("");

    return `<div class="card"><h3>Subcarpetas del sitio</h3>
      <p style="opacity:.75;margin-bottom:1rem;line-height:1.65">Activa o desactiva cada sección. Las desactivadas no aparecen en el menú ni se publican como página.</p>
      <table class="data-table" style="width:100%;border-collapse:collapse;font-size:.9rem">
        <thead><tr><th align="left">Nombre</th><th align="left">URL</th><th>Estado</th><th>Menú</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="card"><h3>Nueva sección</h3>
      <div class="grid-2">
        <div class="field"><label for="new-route-label">Nombre visible</label><input id="new-route-label" placeholder="Ej. Eventos"/></div>
        <div class="field"><label for="new-route-slug">URL (subcarpeta)</label><input id="new-route-slug" placeholder="eventos"/></div>
      </div>
      <button type="button" class="btn btn-blue" id="add-route-btn" style="margin-top:1rem">Crear sección</button>
      <p style="margin-top:.75rem;font-size:.85rem;opacity:.7">Solo letras minúsculas, números y guiones. Se creará en <code>/tu-seccion/</code></p>
    </div>`;
  }

  function bindSectionsEvents(root) {
    root.querySelectorAll("[data-route-enabled]").forEach((el) => {
      el.addEventListener("change", () => {
        const r = content.routes[Number(el.dataset.routeEnabled)];
        r.enabled = el.checked;
        if (!r.enabled) r.inNav = false;
        markDirty();
        renderPanel("sections");
      });
    });
    root.querySelectorAll("[data-route-nav]").forEach((el) => {
      el.addEventListener("change", () => {
        content.routes[Number(el.dataset.routeNav)].inNav = el.checked;
        markDirty();
      });
    });
    root.querySelectorAll("[data-del-route]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.delRoute);
        const r = content.routes[idx];
        if (r.builtin) return;
        if (!confirm(`¿Eliminar la sección «${r.label}»?`)) return;
        content.routes.splice(idx, 1);
        delete content.pages[r.slug];
        markDirty();
        renderPanel("sections");
      });
    });
    const labelInput = $("#new-route-label", root);
    const slugInput = $("#new-route-slug", root);
    if (labelInput && slugInput) {
      labelInput.addEventListener("input", () => {
        if (!slugInput.dataset.touched) slugInput.value = slugify(labelInput.value);
      });
      slugInput.addEventListener("input", () => { slugInput.dataset.touched = "1"; });
    }
    $("#add-route-btn", root)?.addEventListener("click", () => {
      const label = labelInput?.value.trim();
      const slug = slugify(slugInput?.value || label);
      if (!label || !slug) { toast("Nombre y URL son obligatorios", "error"); return; }
      if (content.routes.some((r) => r.slug === slug)) { toast("Ya existe una sección con esa URL", "error"); return; }
      const id = `custom-${slug}-${Date.now()}`;
      content.routes.push({ id, slug, label, enabled: true, builtin: false, inNav: true });
      content.pages[slug] = { tagline: label, headline: label, intro: "" };
      markDirty();
      toast("Sección creada", "success");
      renderPanel("sections");
    });
  }

  function renderTheme() {
    return `<div class="card"><h3>Paleta de colores</h3>
      <p style="opacity:.75;margin-bottom:1rem;font-size:.9rem">Estos colores se aplican en todo el sitio: encabezado, botones, fondos y textos.</p>
      <div class="color-grid">${THEME_FIELDS.map(([key, label]) => `
        <div class="field color-field">
          <label for="theme-${key}">${label}</label>
          <div class="color-input-row">
            <input type="color" id="theme-${key}" data-field="${key}" value="${content.theme[key]}"/>
            <input type="text" data-field="${key}" value="${content.theme[key]}" style="font-family:monospace"/>
          </div>
        </div>`).join("")}
      </div>
      <button type="button" class="btn btn-ghost" id="reset-theme" style="margin-top:1rem">Restaurar colores originales</button>
    </div>`;
  }

  function renderPages() {
    const pg = content.pages;
    const sections = [
      ["home", "Inicio", ["experiencesLabel", "experiencesTitle", "productsLabel", "productsTitle", "blogLabel", "blogTitle"]],
      ["cafe", "Café", ["tagline", "headline", "brewTitle", "productsNote"]],
      ["menu", "Menú", ["tagline", "headline", "intro", "disclaimer"]],
      ["nosotros", "Nosotros", ["tagline", "headline", "valuesLabel", "valuesTitle"]],
      ["tienda", "Tienda", ["tagline", "headline"]],
      ["blog", "Blog", ["tagline", "headline"]],
      ["contacto", "Contacto", ["tagline", "headline", "visitTitle", "writeTitle", "formTitle"]],
    ];
    const custom = content.routes.filter((r) => !r.builtin && r.id !== "home");
    for (const r of custom) {
      sections.push([r.slug, r.label, ["tagline", "headline", "intro"]]);
    }
    return sections.map(([key, title, fields]) => `
      <div class="card" data-page-section="${key}">
        <h3>${title}</h3>
        ${fields.map((f) => field(f, `pg-${key}-${f}`, pg[key]?.[f] || "", ["intro", "disclaimer", "body"].includes(f) || f.includes("Note") ? "textarea" : "text")).join("")}
      </div>`).join("") + `
    <div class="card"><h3>Guía de preparación (página Café)</h3>
      <textarea id="brew-guide" style="width:100%;min-height:140px;font:inherit;padding:1rem;border-radius:.6rem;border:1px solid rgba(7,57,84,.15)">${content.brewGuide.join("\n")}</textarea>
      <small>Un paso por línea</small>
    </div>`;
  }

  function bindPagesEvents(root) {
    Object.keys(content.pages).forEach((key) => {
      Object.keys(content.pages[key] || {}).forEach((f) => {
        const el = $(`#pg-${key}-${f}`, root);
        if (!el) return;
        el.addEventListener("input", () => {
          if (!content.pages[key]) content.pages[key] = {};
          content.pages[key][f] = el.value;
          markDirty();
        });
      });
    });
    const brew = $("#brew-guide", root);
    if (brew) brew.addEventListener("input", () => {
      content.brewGuide = brew.value.split("\n").map((s) => s.trim()).filter(Boolean);
      markDirty();
    });
  }

  function bindThemeEvents(root) {
    THEME_FIELDS.forEach(([key]) => {
      const colorEl = $(`#theme-${key}`, root);
      const textInputs = $$(`input[data-field="${key}"]`, root);
      if (colorEl) {
        colorEl.addEventListener("input", () => {
          content.theme[key] = colorEl.value;
          textInputs.forEach((t) => { if (t.type === "text") t.value = colorEl.value; });
          markDirty();
          applyThemePreview();
        });
      }
      textInputs.forEach((t) => {
        if (t.type !== "text") return;
        t.addEventListener("input", () => {
          if (/^#[0-9a-fA-F]{6}$/.test(t.value)) {
            content.theme[key] = t.value;
            if (colorEl) colorEl.value = t.value;
            markDirty();
            applyThemePreview();
          }
        });
      });
    });
    $("#reset-theme", root)?.addEventListener("click", () => {
      content.theme = {
        cream: "#f6f5ef", creamDark: "#ebe8df", blue: "#073954", blueMid: "#0a4d6e",
        green: "#1bb175", sage: "#d8daa8", brown: "#b07a3a", brownDark: "#8a4a24",
        cherry: "#e84545", charcoal: "#2b2b2b",
      };
      markDirty();
      renderPanel("theme");
    });
  }

  function renderExperiences() {
    return `<button type="button" class="btn btn-primary" id="add-exp" style="margin-bottom:1rem">+ Nueva experiencia</button>
    ${content.experiences.map((exp, i) => `
    <div class="list-item" data-exp="${i}">
      <div class="list-item-header"><strong>${escapeHtml(exp.title)}</strong>
        <button type="button" class="btn btn-danger btn-sm" data-del-exp="${i}">Eliminar</button></div>
      <div class="grid-2">
        ${field("Título", `exp-${i}-title`, exp.title)}
        ${field("Subtítulo", `exp-${i}-sub`, exp.subtitle)}
        ${field("Descripción", `exp-${i}-desc`, exp.description, "textarea")}
      </div>
      ${imageField(`exp-${i}-img`, "Imagen", exp.image, "experience")}
    </div>`).join("")}`;
  }

  function bindExperienceEvents(root) {
    content.experiences.forEach((exp, i) => {
      const map = { title: `exp-${i}-title`, subtitle: `exp-${i}-sub`, description: `exp-${i}-desc` };
      Object.entries(map).forEach(([key, id]) => {
        const input = $(`#${id}`, root);
        if (input) input.addEventListener("input", () => { exp[key] = input.value; markDirty(); });
      });
      bindImageField(root, `exp-${i}-img`, () => exp.image, (v) => { exp.image = v; });
    });
    root.querySelectorAll("[data-del-exp]").forEach((btn) => {
      btn.onclick = () => { content.experiences.splice(Number(btn.dataset.delExp), 1); markDirty(); renderPanel("experiences"); };
    });
    $("#add-exp", root)?.addEventListener("click", () => {
      content.experiences.push({ id: "nueva-" + Date.now(), title: "Nueva", subtitle: "", description: "", image: "/images/brand/pausa.png", layout: "left" });
      markDirty(); renderPanel("experiences");
    });
  }

  function renderProducts() {
    return `
    <div class="card"><h3>Guía de preparación en casa</h3>
      <textarea id="brew-guide-prod" style="width:100%;min-height:120px;font:inherit;padding:1rem;border-radius:.6rem;border:1px solid rgba(7,57,84,.15)">${content.brewGuide.join("\n")}</textarea>
      <small>Un paso por línea (aparece en la página Café)</small>
    </div>
    <button type="button" class="btn btn-primary" id="add-prod">+ Nuevo producto</button>
    ${content.products.map((p, i) => `
    <div class="list-item" data-prod="${i}">
      <div class="list-item-header"><strong>${escapeHtml(p.name)}</strong>
        <span class="chip">${p.featured ? "Destacado" : "Normal"}</span>
        <button type="button" class="btn btn-danger" data-del-prod="${i}">Eliminar</button></div>
      <div class="grid-2">
        ${field("Nombre", `p-${i}-name`, p.name)}
        ${field("Precio COP", `p-${i}-price`, p.price, "number")}
        ${field("Variedad", `p-${i}-var`, p.variety)}
        ${field("Región", `p-${i}-reg`, p.region)}
        ${field("Origen", `p-${i}-orig`, p.origin)}
        ${field("Finca", `p-${i}-farm`, p.farm || "")}
        ${field("Notas (coma)", `p-${i}-notes`, p.notes.join(", "))}
      </div>
      ${imageField(`p-${i}-img`, "Imagen del producto", p.image, "product")}
      <label class="checkbox-row"><input type="checkbox" id="p-${i}-feat" ${p.featured ? "checked" : ""}/> Destacado en inicio</label>
      <label class="checkbox-row"><input type="checkbox" id="p-${i}-sub" ${p.subscription ? "checked" : ""}/> Suscripción</label>
    </div>`).join("")}`;
  }

  function bindProductEvents(root) {
    const brew = $("#brew-guide-prod", root);
    if (brew) brew.addEventListener("input", () => {
      content.brewGuide = brew.value.split("\n").map((s) => s.trim()).filter(Boolean);
      markDirty();
    });
    content.products.forEach((p, i) => {
      const bind = (id, fn) => { const el = $(`#${id}`, root); if (el) el.addEventListener("input", () => { fn(el); markDirty(); }); };
      bind(`p-${i}-name`, (el) => { p.name = el.value; });
      bind(`p-${i}-price`, (el) => { p.price = Number(el.value); });
      bind(`p-${i}-var`, (el) => { p.variety = el.value; });
      bind(`p-${i}-reg`, (el) => { p.region = el.value; });
      bind(`p-${i}-orig`, (el) => { p.origin = el.value; });
      bind(`p-${i}-farm`, (el) => { p.farm = el.value; });
      bind(`p-${i}-notes`, (el) => { p.notes = el.value.split(",").map((s) => s.trim()).filter(Boolean); });
      bindImageField(root, `p-${i}-img`, () => p.image, (v) => { p.image = v; });
      const feat = $(`#p-${i}-feat`, root);
      const sub = $(`#p-${i}-sub`, root);
      if (feat) feat.onchange = () => { p.featured = feat.checked; markDirty(); };
      if (sub) sub.onchange = () => { p.subscription = sub.checked; markDirty(); };
    });
    root.querySelectorAll("[data-del-prod]").forEach((btn) => {
      btn.onclick = () => { content.products.splice(Number(btn.dataset.delProd), 1); markDirty(); renderPanel("products"); };
    });
    $("#add-prod", root)?.addEventListener("click", () => {
      content.products.push({ id: "prod-" + Date.now(), name: "Nuevo café", variety: "Caturra", origin: "Colombia", region: "Huila", price: 45000, weight: "250 g", roast: "Tostión media", grind: "Grano", notes: ["Chocolate"], image: "/images/products/caja-cafe.png", subscription: false, featured: false });
      markDirty(); renderPanel("products");
    });
  }

  function renderMenu() {
    return content.menu.map((cat, ci) => `
    <div class="card" data-cat="${ci}">
      <div class="list-item-header"><h3>${escapeHtml(cat.name)}</h3>
        <button type="button" class="btn btn-danger" data-del-cat="${ci}">Eliminar categoría</button></div>
      ${field("Nombre categoría", `cat-${ci}-name`, cat.name)}
      <div class="menu-items">${cat.items.map((item, ii) => `
        <div class="list-item" data-item="${ci}-${ii}">
          <div class="grid-2">
            ${field("Plato", `item-${ci}-${ii}-name`, item.name)}
            ${field("Precio", `item-${ci}-${ii}-price`, item.price, "number")}
            ${field("Descripción", `item-${ci}-${ii}-desc`, item.description || "", "textarea")}
          </div>
          <button type="button" class="btn btn-ghost" data-del-item="${ci}-${ii}" style="margin-top:.5rem">Quitar plato</button>
        </div>`).join("")}
      </div>
      <button type="button" class="btn btn-ghost" data-add-item="${ci}" style="margin-top:.5rem">+ Plato</button>
    </div>`).join("") + `<button type="button" class="btn btn-primary" id="add-cat">+ Nueva categoría</button>`;
  }

  function bindMenuEvents(root) {
    content.menu.forEach((cat, ci) => {
      const nameEl = $(`#cat-${ci}-name`, root);
      if (nameEl) nameEl.oninput = () => { cat.name = nameEl.value; markDirty(); };
      cat.items.forEach((item, ii) => {
        const n = $(`#item-${ci}-${ii}-name`, root);
        const p = $(`#item-${ci}-${ii}-price`, root);
        const d = $(`#item-${ci}-${ii}-desc`, root);
        if (n) n.oninput = () => { item.name = n.value; markDirty(); };
        if (p) p.oninput = () => { item.price = Number(p.value); markDirty(); };
        if (d) d.oninput = () => { item.description = d.value; markDirty(); };
      });
    });
    root.querySelectorAll("[data-del-cat]").forEach((b) => {
      b.onclick = () => { content.menu.splice(Number(b.dataset.delCat), 1); markDirty(); renderPanel("menu"); };
    });
    root.querySelectorAll("[data-del-item]").forEach((b) => {
      b.onclick = () => {
        const [ci, ii] = b.dataset.delItem.split("-").map(Number);
        content.menu[ci].items.splice(ii, 1);
        markDirty(); renderPanel("menu");
      };
    });
    root.querySelectorAll("[data-add-item]").forEach((b) => {
      b.onclick = () => { content.menu[Number(b.dataset.addItem)].items.push({ name: "Nuevo plato", price: 10000 }); markDirty(); renderPanel("menu"); };
    });
    $("#add-cat", root)?.addEventListener("click", () => {
      content.menu.push({ id: "cat-" + Date.now(), name: "Nueva categoría", items: [] });
      markDirty(); renderPanel("menu");
    });
  }

  function renderBlog() {
    return `<button type="button" class="btn btn-primary" id="add-post">+ Nuevo artículo</button>
    ${content.blog.map((post, i) => `
    <div class="list-item" data-post="${i}">
      <div class="list-item-header"><strong>${escapeHtml(post.title)}</strong>
        <button type="button" class="btn btn-danger" data-del-post="${i}">Eliminar</button></div>
      <div class="grid-2">
        ${field("Título", `post-${i}-title`, post.title)}
        ${field("Categoría", `post-${i}-cat`, post.category)}
        ${field("Fecha", `post-${i}-date`, post.date)}
        ${field("Extracto", `post-${i}-exc`, post.excerpt, "textarea")}
      </div>
      ${imageField(`post-${i}-img`, "Imagen del artículo", post.image, "blog")}
      <label class="checkbox-row"><input type="checkbox" id="post-${i}-pub" ${post.published ? "checked" : ""}/> Publicado</label>
    </div>`).join("")}`;
  }

  function bindBlogEvents(root) {
    content.blog.forEach((post, i) => {
      [["title", `post-${i}-title`], ["category", `post-${i}-cat`], ["date", `post-${i}-date`], ["excerpt", `post-${i}-exc`]].forEach(([key, id]) => {
        const el = $(`#${id}`, root);
        if (el) el.oninput = () => { post[key] = el.value; markDirty(); };
      });
      bindImageField(root, `post-${i}-img`, () => post.image, (v) => { post.image = v; });
      const pub = $(`#post-${i}-pub`, root);
      if (pub) pub.onchange = () => { post.published = pub.checked; markDirty(); };
    });
    root.querySelectorAll("[data-del-post]").forEach((b) => {
      b.onclick = () => { content.blog.splice(Number(b.dataset.delPost), 1); markDirty(); renderPanel("blog"); };
    });
    $("#add-post", root)?.addEventListener("click", () => {
      content.blog.unshift({ id: "post-" + Date.now(), title: "Nuevo artículo", excerpt: "", date: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }), category: "Marca", image: "/images/brand/mood.png", published: false });
      markDirty(); renderPanel("blog");
    });
  }

  function renderNosotros() {
    const b = content.brand;
    return `<div class="card"><h3>Historia y propósito</h3>
      ${field("Historia (intro)", "story", b.story || "", "textarea")}
      ${field("Cita destacada", "quote", b.quote || "", "textarea")}
      ${field("Propósito", "purpose", b.purpose, "textarea")}
      ${field("Misión", "mission", b.mission, "textarea")}
      ${field("Visión", "vision", b.vision, "textarea")}
    </div>
    ${imageField("nosotros-img", "Imagen de la página Nosotros", b.nosotrosImage || "/images/brand/mood.png", "nosotros")}
    <div class="card"><h3>Valores</h3>
      <div id="values-root">${b.values.map((v, i) => `
        <div class="list-item" data-val="${i}">
          ${field("Título", `val-${i}-t`, v.title)}
          ${field("Texto", `val-${i}-x`, v.text, "textarea")}
          <button type="button" class="btn btn-ghost" data-del-val="${i}">Quitar</button>
        </div>`).join("")}</div>
      <button type="button" class="btn btn-primary" id="add-val">+ Valor</button>
    </div>`;
  }

  function bindNosotrosEvents(root) {
    ["story", "quote", "purpose", "mission", "vision"].forEach((key) => {
      const el = $(`#${key}`, root);
      if (el) el.addEventListener("input", () => { content.brand[key] = el.value; markDirty(); });
    });
    bindImageField(root, "nosotros-img", () => content.brand.nosotrosImage, (v) => { content.brand.nosotrosImage = v; });
    content.brand.values.forEach((v, i) => {
      const t = $(`#val-${i}-t`, root);
      const x = $(`#val-${i}-x`, root);
      if (t) t.oninput = () => { v.title = t.value; markDirty(); };
      if (x) x.oninput = () => { v.text = x.value; markDirty(); };
    });
    root.querySelectorAll("[data-del-val]").forEach((b) => {
      b.onclick = () => { content.brand.values.splice(Number(b.dataset.delVal), 1); markDirty(); renderPanel("nosotros"); };
    });
    $("#add-val", root)?.addEventListener("click", () => {
      content.brand.values.push({ title: "Nuevo valor", text: "" });
      markDirty(); renderPanel("nosotros");
    });
  }

  function renderContacto() {
    const b = content.brand;
    return `<div class="card"><h3>Datos de contacto</h3><div class="grid-2">
      ${field("Dirección", "address", b.address)}
      ${field("Ciudad", "city", b.city)}
      ${field("Horario", "hours", b.hours, "textarea")}
      ${field("Teléfono", "phone", b.phone)}
      ${field("Email", "email", b.email, "email")}
      ${field("WhatsApp (solo números)", "whatsapp", b.whatsapp)}
      ${field("Instagram", "social.instagram", b.social.instagram)}
      ${field("Facebook", "social.facebook", b.social.facebook)}
      ${field("Sitio web", "website", b.website)}
    </div>
    <p style="margin-top:1rem;font-size:.85rem;opacity:.7">Usa URLs completas: <code>https://www.instagram.com/tuusuario</code></p>
    </div>`;
  }

  function renderMarquee() {
    return `<div class="card"><h3>Frases del marquee (una por línea)</h3>
      <textarea id="marquee-lines" style="width:100%;min-height:200px;font:inherit;padding:1rem;border-radius:.6rem;border:1px solid rgba(7,57,84,.15)">${content.marquee.join("\n")}</textarea>
    </div>`;
  }

  function renderConfig() {
    return `<div class="card"><h3>Publicar en el sitio web</h3>
      <p style="margin-bottom:1rem;opacity:.85;line-height:1.65">
        Pulsa <strong>Guardar y publicar</strong> y los cambios (textos, colores, secciones e imágenes) se suben automáticamente. El sitio se actualiza en ~1 minuto.
      </p>
      <button type="button" class="btn btn-blue" id="publish-btn" style="font-size:1rem;padding:.85rem 2rem">🚀 Guardar y publicar</button>
      <button type="button" class="btn btn-ghost" id="download-json" style="margin-left:.5rem">Descargar copia de seguridad</button>
      <p id="publish-status" style="margin-top:1rem;opacity:.75"></p>
    </div>
    <div class="card"><h3>URL pública</h3>
      <p><a href="../" target="_blank" rel="noopener">${location.origin}${location.pathname.replace(/admin\/?$/, "")}</a></p>
    </div>`;
  }

  function bindConfigEvents(root) {
    $("#download-json", root)?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "site.json";
      a.click();
    });
    $("#publish-btn", root)?.addEventListener("click", publishSite);
  }

  function toBase64Utf8(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  async function fetchLatestContent() {
    const { owner, repo, branch, path: jsonPath } = REPO_CONFIG;
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${jsonPath}?t=${Date.now()}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function mergeForPublish(server, local) {
    const out = structuredClone(server);
    const scalarKeys = ["brand", "theme", "pages"];
    for (const key of scalarKeys) {
      if (local[key]) out[key] = { ...server[key], ...local[key] };
    }
    const arrayKeys = ["routes", "brewGuide", "marquee", "experiences", "products", "menu", "blog", "analytics"];
    for (const key of arrayKeys) {
      if (local[key] === undefined || local[key] === null) continue;
      if (Array.isArray(local[key]) && local[key].length === 0 && Array.isArray(server[key]) && server[key].length > 0) {
        continue;
      }
      out[key] = local[key];
    }
    if (local.analytics) {
      out.analytics = {
        clicks: { ...(server.analytics?.clicks || {}), ...(local.analytics.clicks || {}) },
        monthlyIncome: local.analytics.monthlyIncome?.length
          ? local.analytics.monthlyIncome
          : (server.analytics?.monthlyIncome || []),
      };
    }
    return out;
  }

  function validateBeforePublish(data) {
    if (!data.brand?.name?.trim()) throw new Error("Falta el nombre de la marca. Revisa la sección Marca.");
    if (!data.routes?.length) throw new Error("No hay secciones configuradas.");
    const emptyArrays = ["experiences", "products", "menu"].filter(
      (k) => !data[k]?.length
    );
    if (emptyArrays.length === 3) {
      throw new Error("El contenido parece vacío. Recarga el panel antes de publicar para evitar borrar datos.");
    }
  }

  async function publishSite() {
    if (!requireAuth()) return;
    const status = $("#publish-status");
    if (status) status.textContent = "Sincronizando con el servidor...";

    if (!PUBLISH_SECRET) {
      if (status) status.textContent = "Publica desde el sitio en línea (/admin/).";
      toast("La publicación automática solo funciona en el panel publicado", "error");
      return;
    }

    const { owner, repo, branch, path: jsonPath } = REPO_CONFIG;
    const headers = {
      Authorization: `Bearer ${PUBLISH_SECRET}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    };

    try {
      const latest = await fetchLatestContent();
      const toPublish = latest ? mergeForPublish(latest, content) : structuredClone(content);
      ensureRoutes();
      mergePendingClicks();
      toPublish.routes = content.routes;
      toPublish.analytics = content.analytics;
      validateBeforePublish(toPublish);

      for (const upload of pendingUploads) {
        const filePath = "public/" + upload.path.replace(/^\//, "");
        if (status) status.textContent = `Subiendo ${filePath}...`;
        await putGitHubFile(owner, repo, branch, filePath, upload.base64, headers, `admin: imagen ${filePath}`);
      }

      if (status) status.textContent = "Actualizando contenido...";
      const json = JSON.stringify(toPublish, null, 2) + "\n";
      await putGitHubFile(owner, repo, branch, jsonPath, toBase64Utf8(json), headers, "admin: actualizar contenido del sitio");

      content = structuredClone(toPublish);
      dirty = false;
      pendingUploads.length = 0;
      $("#dirty-badge")?.classList.add("hidden");
      updateContextPreview(currentPanel);
      if (status) status.textContent = "✅ Publicado. El sitio se actualizará en 1-2 minutos.";
      toast("¡Contenido publicado!", "success");
    } catch (e) {
      if (status) status.textContent = "Error: " + e.message;
      toast(e.message, "error");
    }
  }

  async function putGitHubFile(owner, repo, branch, filePath, contentBase64, headers, message) {
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const getRes = await fetch(getUrl, { headers });
    let sha;
    if (getRes.ok) sha = (await getRes.json()).sha;

    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ message, content: contentBase64, sha, branch }),
    });
    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(err.message || `Error al guardar ${filePath}`);
    }
  }

  function updateStatus() {
    const bar = $("#publish-status-bar");
    if (bar) bar.innerHTML = '<span class="status-dot"></span> Listo para editar y publicar';
  }

  document.addEventListener("click", (e) => {
    const goto = e.target.closest("[data-goto]");
    if (goto) {
      currentPanel = goto.dataset.goto;
      buildNav();
      renderPanel(currentPanel);
    }
  });

  $("#login-form")?.addEventListener("submit", login);
  $("#logout-btn")?.addEventListener("click", logout);
  $("#publish-top")?.addEventListener("click", publishSite);
  $("#preview-btn")?.addEventListener("click", () => window.open("../", "_blank"));

  window.addEventListener("beforeunload", (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  const saved = getSession();
  if (saved) {
    showApp(saved);
  } else {
    document.body.classList.remove("admin-authed");
  }
})();

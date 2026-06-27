/* global SITE_BOOT, REPO_CONFIG, USER_HASHES, PUBLISH_KEY */

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

  const IMAGE_SPECS = {
    experience: "800 × 1000 px (vertical 4:5). PNG o WebP. Máx. 500 KB. Luz natural, sin texto encima.",
    product: "600 × 600 px (cuadrada). PNG con fondo transparente. Máx. 400 KB.",
    blog: "1200 × 750 px (horizontal 16:10). JPG o WebP. Máx. 600 KB.",
    nosotros: "800 × 1000 px (vertical 4:5). JPG o WebP. Máx. 500 KB. Ambiente del local.",
  };

  const PANELS = [
    { id: "overview", label: "Resumen", icon: "◉" },
    { id: "help", label: "Cómo funciona", icon: "?" },
    { id: "brand", label: "Marca e inicio", icon: "◇" },
    { id: "theme", label: "Colores", icon: "◐" },
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
    sessionStorage.setItem("mc_admin", JSON.stringify({ user: match.username, name: match.name, role: match.role }));
    showApp(match);
  }

  function showApp(session) {
    $("#login-screen").classList.add("hidden");
    $("#app").classList.remove("hidden");
    $("#user-name").textContent = session.name;
    buildNav();
    renderPanel(currentPanel);
    updateStatus();
  }

  function logout() {
    sessionStorage.removeItem("mc_admin");
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
  }

  function renderPanel(id) {
    const main = $("#panel-root");
    const titles = {
      overview: "Panel de administración", help: "Cómo funciona", brand: "Marca e inicio",
      theme: "Colores del sitio", pages: "Textos de páginas", experiences: "Experiencias",
      products: "Café y tienda", menu: "Menú coffee shop", blog: "Blog", nosotros: "Nosotros",
      contacto: "Contacto", marquee: "Texto marquee", config: "Publicar cambios",
    };
    $("#panel-title").textContent = titles[id] || id;

    const handlers = {
      overview: () => { main.innerHTML = renderOverview(); },
      help: () => { main.innerHTML = renderHelp(); },
      brand: () => { main.innerHTML = renderBrand(); bindFields(main, content.brand); },
      theme: () => { main.innerHTML = renderTheme(); bindThemeEvents(main); applyThemePreview(); },
      pages: () => { main.innerHTML = renderPages(); bindPagesEvents(main); },
      experiences: () => { main.innerHTML = renderExperiences(); bindExperienceEvents(main); },
      products: () => { main.innerHTML = renderProducts(); bindProductEvents(main); },
      menu: () => { main.innerHTML = renderMenu(); bindMenuEvents(main); },
      blog: () => { main.innerHTML = renderBlog(); bindBlogEvents(main); },
      nosotros: () => { main.innerHTML = renderNosotros(); bindNosotrosEvents(main); },
      contacto: () => { main.innerHTML = renderContacto(); bindFields(main, content.brand); bindFields(main, content.brand.social, "social."); },
      marquee: () => {
        main.innerHTML = renderMarquee();
        $("#marquee-lines").addEventListener("input", (e) => {
          content.marquee = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
          markDirty();
        });
      },
      config: () => { main.innerHTML = renderConfig(); bindConfigEvents(main); },
    };
    (handlers[id] || handlers.overview)();
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
        <li><strong>Edita</strong> el contenido en las secciones del menú lateral (marca, menú, blog, colores, etc.).</li>
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
      <p>En <strong>Colores</strong> puedes cambiar la paleta completa del sitio. Los cambios se ven en la vista previa del panel y se aplican al publicar.</p>
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
    </div>
    <div class="card theme-preview">
      <h3>Vista previa</h3>
      <div class="preview-swatch" style="background:var(--blue);color:var(--cream);padding:1rem;border-radius:.75rem">Encabezado</div>
      <div class="preview-swatch" style="background:var(--cream);color:var(--charcoal);padding:1rem;border-radius:.75rem;margin-top:.5rem">Fondo crema</div>
      <div class="preview-swatch" style="background:var(--sage);color:var(--blue);padding:1rem;border-radius:.75rem;margin-top:.5rem">Botón salvia</div>
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
    return sections.map(([key, title, fields]) => `
      <div class="card" data-page-section="${key}">
        <h3>${title}</h3>
        ${fields.map((f) => field(f, `pg-${key}-${f}`, pg[key]?.[f] || "", ["intro", "disclaimer"].includes(f) || f.includes("Note") ? "textarea" : "text")).join("")}
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
    const canPublish = !!PUBLISH_KEY;
    return `<div class="card"><h3>Publicar en el sitio web</h3>
      <p style="margin-bottom:1rem;opacity:.85;line-height:1.65">
        ${canPublish
          ? "Pulsa <strong>Guardar y publicar</strong> y los cambios (textos, colores e imágenes) se suben automáticamente. El sitio se actualiza en ~1 minuto."
          : "En local, descarga el JSON y súbelo al repositorio. En el sitio en línea, la publicación es automática."}
      </p>
      <button type="button" class="btn btn-blue" id="publish-btn" style="font-size:1rem;padding:.85rem 2rem">🚀 Guardar y publicar</button>
      <button type="button" class="btn btn-ghost" id="download-json" style="margin-left:.5rem">Descargar JSON</button>
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

  async function publishSite() {
    const status = $("#publish-status");
    if (status) status.textContent = "Publicando...";

    if (!PUBLISH_KEY) {
      if (status) status.textContent = "Descarga el JSON y súbelo al repositorio, o usa el panel en línea.";
      toast("Publicación automática solo disponible en el sitio publicado", "error");
      return;
    }

    const { owner, repo, branch, path: jsonPath } = REPO_CONFIG;
    const headers = {
      Authorization: `Bearer ${PUBLISH_KEY}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    };

    try {
      for (const upload of pendingUploads) {
        const filePath = "public/" + upload.path.replace(/^\//, "");
        if (status) status.textContent = `Subiendo ${filePath}...`;
        await putGitHubFile(owner, repo, branch, filePath, upload.base64, headers, `admin: imagen ${filePath}`);
      }

      if (status) status.textContent = "Actualizando contenido...";
      const json = JSON.stringify(content, null, 2) + "\n";
      await putGitHubFile(owner, repo, branch, jsonPath, toBase64Utf8(json), headers, "admin: actualizar contenido del sitio");

      dirty = false;
      pendingUploads.length = 0;
      $("#dirty-badge")?.classList.add("hidden");
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
    if (bar) {
      bar.innerHTML = PUBLISH_KEY
        ? '<span class="status-dot"></span> Publicación automática activa'
        : '<span class="status-dot warn"></span> Modo local';
    }
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

  const saved = sessionStorage.getItem("mc_admin");
  if (saved) {
    try { showApp(JSON.parse(saved)); } catch { /* ignore */ }
  }
})();

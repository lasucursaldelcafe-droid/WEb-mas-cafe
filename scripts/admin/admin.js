/* global SITE_BOOT, REPO_CONFIG, USER_HASHES */

(function () {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  let content = structuredClone(SITE_BOOT);
  let dirty = false;
  let currentPanel = "overview";

  const PANELS = [
    { id: "overview", label: "Resumen", icon: "◉" },
    { id: "brand", label: "Marca e inicio", icon: "◇" },
    { id: "experiences", label: "Experiencias", icon: "◎" },
    { id: "products", label: "Café / Tienda", icon: "☕" },
    { id: "menu", label: "Menú coffee shop", icon: "≡" },
    { id: "blog", label: "Blog", icon: "✎" },
    { id: "nosotros", label: "Nosotros", icon: "♡" },
    { id: "contacto", label: "Contacto", icon: "✉" },
    { id: "marquee", label: "Marquee", icon: "∞" },
    { id: "config", label: "Publicar", icon: "⚙" },
  ];

  function toast(msg, type = "") {
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }

  function markDirty() {
    dirty = true;
    const el = $("#dirty-badge");
    if (el) el.classList.remove("hidden");
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
    if (!match) {
      toast("Usuario o contraseña incorrectos", "error");
      return;
    }
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
      });
    });
  }

  function renderPanel(id) {
    const main = $("#panel-root");
    const titles = {
      overview: "Panel de administración",
      brand: "Marca e inicio",
      experiences: "Experiencias",
      products: "Café y tienda",
      menu: "Menú coffee shop",
      blog: "Blog",
      nosotros: "Nosotros",
      contacto: "Contacto",
      marquee: "Texto marquee",
      config: "Publicar cambios",
    };
    $("#panel-title").textContent = titles[id] || id;

    switch (id) {
      case "overview":
        main.innerHTML = renderOverview();
        break;
      case "brand":
        main.innerHTML = renderBrand();
        bindFields(main, content.brand);
        bindFields(main, content.brand.social, "social.");
        break;
      case "experiences":
        main.innerHTML = renderExperiences();
        bindExperienceEvents(main);
        break;
      case "products":
        main.innerHTML = renderProducts();
        bindProductEvents(main);
        break;
      case "menu":
        main.innerHTML = renderMenu();
        bindMenuEvents(main);
        break;
      case "blog":
        main.innerHTML = renderBlog();
        bindBlogEvents(main);
        break;
      case "nosotros":
        main.innerHTML = renderNosotros();
        bindNosotrosEvents(main);
        break;
      case "contacto":
        main.innerHTML = renderContacto();
        bindFields(main, content.brand);
        bindFields(main, content.brand.social, "social.");
        break;
      case "marquee":
        main.innerHTML = renderMarquee();
        $("#marquee-lines").addEventListener("input", (e) => {
          content.marquee = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
          markDirty();
        });
        break;
      case "config":
        main.innerHTML = renderConfig();
        bindConfigEvents(main);
        break;
    }
  }

  function renderOverview() {
    return `
    <div class="status-bar">
      <span><span class="status-dot"></span> Sitio público activo</span>
      <a href="../" target="_blank" rel="noopener">Ver sitio →</a>
    </div>
    <div class="grid-2">
      <div class="card"><h3>Contenido</h3>
        <p>${content.experiences.length} experiencias · ${content.products.length} productos</p>
        <p>${content.menu.length} categorías de menú · ${content.blog.filter((b) => b.published).length} posts publicados</p>
      </div>
      <div class="card"><h3>Acciones rápidas</h3>
        <div class="row" style="margin-top:.75rem">
          <button type="button" class="btn btn-primary" data-goto="brand">Editar marca</button>
          <button type="button" class="btn btn-ghost" data-goto="menu">Editar menú</button>
          <button type="button" class="btn btn-blue" data-goto="config">Publicar</button>
        </div>
      </div>
    </div>
    <div class="card"><h3>Secciones del sitio</h3>
      <p style="opacity:.75;margin-bottom:1rem">Cada sección corresponde a una página pública del sitio.</p>
      <div class="row">${PANELS.filter((p) => !["overview", "config"].includes(p.id)).map((p) => `<button type="button" class="btn btn-ghost" data-goto="${p.id}">${p.label}</button>`).join("")}</div>
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

  function renderExperiences() {
    return `<button type="button" class="btn btn-primary" id="add-exp" style="margin-bottom:1rem">+ Nueva experiencia</button>
    ${content.experiences.map((exp, i) => `
    <div class="list-item" data-exp="${i}">
      <div class="list-item-header"><strong>${escapeHtml(exp.title)}</strong>
        <button type="button" class="btn btn-danger btn-sm" data-del-exp="${i}">Eliminar</button></div>
      <div class="grid-2">
        ${field("Título", `exp-${i}-title`, exp.title)}
        ${field("Subtítulo", `exp-${i}-sub`, exp.subtitle)}
        ${field("Imagen (ruta)", `exp-${i}-img`, exp.image, "text", "Ej: /images/brand/pausa.png")}
        ${field("Layout", `exp-${i}-layout`, exp.layout)}
        ${field("Descripción", `exp-${i}-desc`, exp.description, "textarea")}
      </div>
    </div>`).join("")}`;
  }

  function bindExperienceEvents(root) {
    root.querySelectorAll("[data-exp]").forEach((el) => {
      const i = Number(el.dataset.exp);
      const exp = content.experiences[i];
      const map = { title: `exp-${i}-title`, subtitle: `exp-${i}-sub`, image: `exp-${i}-img`, layout: `exp-${i}-layout`, description: `exp-${i}-desc` };
      Object.entries(map).forEach(([key, id]) => {
        const input = $(`#${id}`, el);
        if (!input) return;
        input.addEventListener("input", () => { exp[key] = input.value; markDirty(); });
      });
    });
    root.querySelectorAll("[data-del-exp]").forEach((btn) => {
      btn.onclick = () => {
        content.experiences.splice(Number(btn.dataset.delExp), 1);
        markDirty();
        renderPanel("experiences");
      };
    });
    const add = $("#add-exp", root);
    if (add) add.onclick = () => {
      content.experiences.push({ id: "nueva-" + Date.now(), title: "Nueva", subtitle: "", description: "", image: "/images/brand/pausa.png", layout: "left" });
      markDirty();
      renderPanel("experiences");
    };
  }

  function renderProducts() {
    return `<button type="button" class="btn btn-primary" id="add-prod">+ Nuevo producto</button>
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
        ${field("Imagen", `p-${i}-img`, p.image)}
        ${field("Notas (coma)", `p-${i}-notes`, p.notes.join(", "))}
      </div>
      <label class="checkbox-row"><input type="checkbox" id="p-${i}-feat" ${p.featured ? "checked" : ""}/> Destacado en inicio</label>
      <label class="checkbox-row"><input type="checkbox" id="p-${i}-sub" ${p.subscription ? "checked" : ""}/> Suscripción</label>
    </div>`).join("")}`;
  }

  function bindProductEvents(root) {
    content.products.forEach((p, i) => {
      const bind = (id, fn) => { const el = $(`#${id}`, root); if (el) el.addEventListener("input", () => { fn(el); markDirty(); }); };
      bind(`p-${i}-name`, (el) => { p.name = el.value; });
      bind(`p-${i}-price`, (el) => { p.price = Number(el.value); });
      bind(`p-${i}-var`, (el) => { p.variety = el.value; });
      bind(`p-${i}-reg`, (el) => { p.region = el.value; });
      bind(`p-${i}-orig`, (el) => { p.origin = el.value; });
      bind(`p-${i}-farm`, (el) => { p.farm = el.value; });
      bind(`p-${i}-img`, (el) => { p.image = el.value; });
      bind(`p-${i}-notes`, (el) => { p.notes = el.value.split(",").map((s) => s.trim()).filter(Boolean); });
      const feat = $(`#p-${i}-feat`, root);
      const sub = $(`#p-${i}-sub`, root);
      if (feat) feat.onchange = () => { p.featured = feat.checked; markDirty(); };
      if (sub) sub.onchange = () => { p.subscription = sub.checked; markDirty(); };
    });
    root.querySelectorAll("[data-del-prod]").forEach((btn) => {
      btn.onclick = () => { content.products.splice(Number(btn.dataset.delProd), 1); markDirty(); renderPanel("products"); };
    });
    const add = $("#add-prod", root);
    if (add) add.onclick = () => {
      content.products.push({
        id: "prod-" + Date.now(), name: "Nuevo café", variety: "Caturra", origin: "Colombia", region: "Huila",
        price: 45000, weight: "250 g", roast: "Tostión media", grind: "Grano", notes: ["Chocolate"],
        image: "/images/products/caja-cafe.png", subscription: false, featured: false,
      });
      markDirty();
      renderPanel("products");
    };
  }

  function renderMenu() {
    return content.menu.map((cat, ci) => `
    <div class="card" data-cat="${ci}">
      <div class="list-item-header">
        <h3>${escapeHtml(cat.name)}</h3>
        <button type="button" class="btn btn-danger" data-del-cat="${ci}">Eliminar categoría</button>
      </div>
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
        markDirty();
        renderPanel("menu");
      };
    });
    root.querySelectorAll("[data-add-item]").forEach((b) => {
      b.onclick = () => {
        content.menu[Number(b.dataset.addItem)].items.push({ name: "Nuevo plato", price: 10000 });
        markDirty();
        renderPanel("menu");
      };
    });
    const addCat = $("#add-cat", root);
    if (addCat) addCat.onclick = () => {
      content.menu.push({ id: "cat-" + Date.now(), name: "Nueva categoría", items: [] });
      markDirty();
      renderPanel("menu");
    };
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
        ${field("Imagen", `post-${i}-img`, post.image)}
        ${field("Extracto", `post-${i}-exc`, post.excerpt, "textarea")}
      </div>
      <label class="checkbox-row"><input type="checkbox" id="post-${i}-pub" ${post.published ? "checked" : ""}/> Publicado</label>
    </div>`).join("")}`;
  }

  function bindBlogEvents(root) {
    content.blog.forEach((post, i) => {
      [["title", `post-${i}-title`], ["category", `post-${i}-cat`], ["date", `post-${i}-date`], ["image", `post-${i}-img`], ["excerpt", `post-${i}-exc`]].forEach(([key, id]) => {
        const el = $(`#${id}`, root);
        if (el) el.oninput = () => { post[key] = el.value; markDirty(); };
      });
      const pub = $(`#post-${i}-pub`, root);
      if (pub) pub.onchange = () => { post.published = pub.checked; markDirty(); };
    });
    root.querySelectorAll("[data-del-post]").forEach((b) => {
      b.onclick = () => { content.blog.splice(Number(b.dataset.delPost), 1); markDirty(); renderPanel("blog"); };
    });
    const add = $("#add-post", root);
    if (add) add.onclick = () => {
      content.blog.unshift({
        id: "post-" + Date.now(), title: "Nuevo artículo", excerpt: "", date: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }),
        category: "Marca", image: "/images/brand/mood.png", published: false,
      });
      markDirty();
      renderPanel("blog");
    };
  }

  function renderNosotros() {
    const b = content.brand;
    return `<div class="card"><h3>Historia y propósito</h3>
      ${field("Propósito", "purpose", b.purpose, "textarea")}
      ${field("Misión", "mission", b.mission, "textarea")}
      ${field("Visión", "vision", b.vision, "textarea")}
    </div>
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
    bindFields(root, content.brand);
    content.brand.values.forEach((v, i) => {
      const t = $(`#val-${i}-t`, root);
      const x = $(`#val-${i}-x`, root);
      if (t) t.oninput = () => { v.title = t.value; markDirty(); };
      if (x) x.oninput = () => { v.text = x.value; markDirty(); };
    });
    root.querySelectorAll("[data-del-val]").forEach((b) => {
      b.onclick = () => { content.brand.values.splice(Number(b.dataset.delVal), 1); markDirty(); renderPanel("nosotros"); };
    });
    const add = $("#add-val", root);
    if (add) add.onclick = () => {
      content.brand.values.push({ title: "Nuevo valor", text: "" });
      markDirty();
      renderPanel("nosotros");
    };
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
    </div></div>`;
  }

  function renderMarquee() {
    return `<div class="card"><h3>Frases del marquee (una por línea)</h3>
      <textarea id="marquee-lines" style="width:100%;min-height:200px;font:inherit;padding:1rem;border-radius:.6rem;border:1px solid rgba(7,57,84,.15)">${content.marquee.join("\n")}</textarea>
    </div>`;
  }

  function renderConfig() {
    const hasToken = !!sessionStorage.getItem("gh_token");
    return `<div class="card"><h3>Publicar en el sitio web</h3>
      <p style="margin-bottom:1rem;opacity:.8">Al guardar, se actualiza <code>content/site.json</code> en GitHub y el sitio se republica automáticamente en ~1 minuto.</p>
      <div class="field">
        <label for="gh-token">Token de GitHub (PAT)</label>
        <input type="password" id="gh-token" placeholder="${hasToken ? "•••••••• (guardado)" : "ghp_..."}"/>
        <small>Crea uno en GitHub → Settings → Developer settings → Fine-grained token con permiso <strong>Contents: Read and write</strong> en este repo.</small>
      </div>
      <button type="button" class="btn btn-ghost" id="save-token">Guardar token</button>
    </div>
    <div class="card">
      <button type="button" class="btn btn-blue" id="publish-btn" style="font-size:1rem;padding:.85rem 2rem">🚀 Guardar y publicar</button>
      <button type="button" class="btn btn-ghost" id="download-json" style="margin-left:.5rem">Descargar JSON</button>
      <p id="publish-status" style="margin-top:1rem;opacity:.75"></p>
    </div>
    <div class="card"><h3>URL pública</h3>
      <p><a href="../" target="_blank" rel="noopener">${location.origin}${location.pathname.replace(/admin\/?$/, "")}</a></p>
    </div>`;
  }

  function bindConfigEvents(root) {
    $("#save-token", root)?.addEventListener("click", () => {
      const t = $("#gh-token", root).value.trim();
      if (t) { sessionStorage.setItem("gh_token", t); toast("Token guardado", "success"); $("#gh-token", root).value = ""; }
    });
    $("#download-json", root)?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "site.json";
      a.click();
    });
    $("#publish-btn", root)?.addEventListener("click", publishToGitHub);
  }

  function toBase64Utf8(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  async function publishToGitHub() {
    const token = sessionStorage.getItem("gh_token");
    if (!token) {
      toast("Configura tu token de GitHub en la sección Publicar", "error");
      currentPanel = "config";
      renderPanel("config");
      return;
    }
    const status = $("#publish-status");
    if (status) status.textContent = "Publicando...";
    const { owner, repo, branch, path: filePath } = REPO_CONFIG;
    const json = JSON.stringify(content, null, 2) + "\n";
    try {
      const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
      const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
      if (!getRes.ok) throw new Error("No se pudo leer site.json: " + getRes.status);
      const file = await getRes.json();
      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "admin: actualizar contenido del sitio",
          content: toBase64Utf8(json),
          sha: file.sha,
          branch,
        }),
      });
      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        throw new Error(err.message || "Error " + putRes.status);
      }
      dirty = false;
      $("#dirty-badge")?.classList.add("hidden");
      if (status) status.textContent = "✅ Publicado. El sitio se actualizará en 1-2 minutos.";
      toast("¡Contenido publicado!", "success");
    } catch (e) {
      if (status) status.textContent = "Error: " + e.message;
      toast(e.message, "error");
    }
  }

  function updateStatus() {
    const token = sessionStorage.getItem("gh_token");
    const bar = $("#token-status");
    if (bar) bar.innerHTML = token ? '<span class="status-dot"></span> Token GitHub configurado' : '<span class="status-dot warn"></span> Falta token para publicar';
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
  $("#publish-top")?.addEventListener("click", publishToGitHub);
  $("#preview-btn")?.addEventListener("click", () => window.open("../", "_blank"));

  window.addEventListener("beforeunload", (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  const saved = sessionStorage.getItem("mc_admin");
  if (saved) {
    try { showApp(JSON.parse(saved)); } catch { /* ignore */ }
  }
})();

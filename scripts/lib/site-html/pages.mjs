import {
  createPathHelpers,
  loadSite,
  price,
  shell,
  mapsUrl,
  addressLinkHtml,
} from "./shared.mjs";
import { brandAssetPath } from "../brand-logo.mjs";
import { getEnabledRoutes } from "./routes.mjs";
import { renderMenuBook, getMenuBookPagePaths, MENU_BOOK_START_PAGE } from "./menu-book.mjs";
import { brandTitleHtml } from "./brand-title.mjs";
import { loyaltyPromoSection, pageFidelizacion } from "./fidelizacion-page.mjs";
import { getPageBrandArt } from "./brand-page-art.mjs";

function marqueeHtml(items) {
  const doubled = [...items, ...items];
  return doubled
    .map(
      (t) =>
        `<span class="marquee-item">${t}<span class="marquee-dot" aria-hidden="true"></span></span>`
    )
    .join("");
}

function visitBand(href, brand, img, pageId = "home") {
  const art = getPageBrandArt(pageId);
  const visitImg = img(art.visitArt || "/images/brand/visita.png");
  const decoImg = img(art.visitDeco || "/images/brand/icon-mark.png");
  const plusImg = img("/images/brand/icon-mark.png");
  const tone = art.visitTone ? ` visit-tone-${art.visitTone}` : "";
  const ctaLine = brand.visitLine || "San Fernando Nuevo · Cali";
  return `
  <section class="visit-band">
    <div class="wrap">
      <div class="visit-band-inner${tone}">
        <div class="visit-band-art" aria-hidden="true">
          <img src="${visitImg}" alt="" loading="lazy"/>
        </div>
        <div class="visit-band-copy">
          <img class="visit-band-plus" src="${plusImg}" alt="" aria-hidden="true"/>
          <img class="visit-band-deco" src="${decoImg}" alt="" aria-hidden="true"/>
          <p class="cta-tagline">${ctaLine}</p>
          <h2>${brandTitleHtml("Te esperamos en Cali")}</h2>
          <p>${addressLinkHtml(brand, { className: "address-link address-link--on-dark" })}</p>
          <p class="text-meta" style="margin-top:.5rem">${brand.hours}</p>
          <div class="actions">
            <a class="btn btn-sage" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener noreferrer" data-track="whatsapp">WhatsApp</a>
            <a class="btn btn-outline" href="${href("/contacto")}" data-track="contacto">Contacto</a>
            <a class="btn btn-outline" href="${mapsUrl(brand)}" target="_blank" rel="noopener noreferrer" data-track="maps">Cómo llegar</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function brandSeparator(img) {
  return `
  <div class="brand-separator" aria-hidden="true">
    <img src="${img("/images/aplicaciones/Separadores.jpg")}" alt="" loading="lazy"/>
  </div>`;
}

function videoBlock(img, videoUrl = "") {
  if (videoUrl?.trim()) {
    const embed = videoUrl.includes("youtube") || videoUrl.includes("youtu.be")
      ? `<iframe src="${videoUrl}" title="Video Quiénes somos" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
      : `<video src="${videoUrl}" controls playsinline preload="metadata"></video>`;
    return `<div class="video-block"><div class="video-block-frame">${embed}</div></div>`;
  }
  return `
  <div class="video-block">
    <div class="video-block-frame">
      <img src="${img("/images/brand/mood.png")}" alt="Ambiente Más Café" loading="lazy"/>
      <div class="video-block-placeholder">
        <span class="play-icon" aria-hidden="true">▶</span>
        <p>Próximamente: video de nuestra historia. El espacio está listo para incrustar YouTube o Vimeo.</p>
      </div>
    </div>
  </div>`;
}

function sectionHead(label, title, intro = "") {
  return `<header class="section-head">
    ${label ? `<p class="label">${label}</p>` : ""}
    <h2 class="section-title">${brandTitleHtml(title)}</h2>
    ${intro ? `<p class="section-intro">${intro}</p>` : ""}
  </header>`;
}

function experienceRow(e, img, reverse) {
  return `
  <div class="exp-row${reverse ? " reverse" : ""}">
    <div class="exp-media"><img src="${img(e.image)}" alt="${e.title}" loading="lazy"/></div>
    <div class="exp-copy">
      <p class="label">${e.subtitle}</p>
      <h3>${brandTitleHtml(e.title)}</h3>
      <p style="margin-top:.85rem;opacity:.78;line-height:1.7">${e.description}</p>
    </div>
  </div>`;
}

function productCard(p, img) {
  return `
  <article class="product">
    ${p.image ? `<div class="product-img"><img src="${img(p.image)}" alt="${p.name}" loading="lazy"/></div>` : ""}
    <p class="label" style="color:var(--brown)">${p.variety} · ${p.region}</p>
    <h3>${brandTitleHtml(p.name)}</h3>
    ${p.farm ? `<p class="meta">${p.farm}${p.altitude ? ` · ${p.altitude}` : ""}</p>` : ""}
    <p class="meta" style="margin-top:.4rem">${p.notes.join(" · ")}</p>
    <p class="price">${price(p.price)}${p.weight ? ` <span class="price-unit">/ ${p.weight}</span>` : ""}</p>
    ${p.subscription ? `<span class="badge">Suscripción</span>` : ""}
  </article>`;
}

export function pageHome() {
  const site = loadSite();
  const { brand, experiences, products, marquee, blog, pages } = site;
  const ph = pages.home;
  const { img, href } = createPathHelpers(0);
  const featured = products.filter((p) => p.featured);
  const posts = blog.filter((p) => p.published).slice(0, 2);
  const loyaltyPromo = loyaltyPromoSection(0, "dark");

  const body = `
  <section class="editorial-hero">
    <img class="decor decor-1" src="${img("/images/decor/Recurso-4.svg")}" alt="" aria-hidden="true"/>
    <img class="decor decor-2" src="${img("/images/decor/Recurso-6.svg")}" alt="" aria-hidden="true"/>
    <div class="hero-art hero-art-bg" aria-hidden="true">
      <img src="${img("/images/grafica/3.png")}" alt=""/>
    </div>
    <div class="wrap hero-content-wrap">
      <div class="hero-content">
        <p class="tagline">${brand.tagline}</p>
        <h1>${brandTitleHtml(brand.headline)}</h1>
        <p class="subhead">${brand.subheadline}</p>
        <p class="descriptor">${brand.descriptor}</p>
        <div class="actions">
          <a class="btn btn-sage" href="${href("/tienda")}" data-track="tienda">Comprar café fresco</a>
          <a class="btn btn-outline" href="${href("/nosotros")}">Conócenos</a>
        </div>
        <div class="brand-note">
          <img src="${img("/images/brand/favs.png")}" alt="${brand.name}" style="width:2.75rem;height:2.75rem;object-fit:contain"/>
          <p>San Fernando Nuevo · Cali</p>
        </div>
      </div>
    </div>
  </section>
  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">${marqueeHtml(marquee)}</div>
  </div>
  ${brandSeparator(img)}
  <section class="section-with-pattern on-light">
    <div class="wrap">
      ${sectionHead(ph.experiencesLabel, ph.experiencesTitle)}
      <div class="exp-list">${experiences.map((e, i) => experienceRow(e, img, i % 2 === 1)).join("")}</div>
      <p class="section-actions"><a class="text-link" href="${href("/nosotros")}">Sobre nosotros →</a></p>
    </div>
  </section>
  ${brandSeparator(img)}
  <section class="dark">
    <div class="wrap">
      ${sectionHead(ph.productsLabel, ph.productsTitle)}
      <div class="products">${featured.map((p) => productCard(p, img)).join("")}</div>
      <p class="section-actions"><a class="btn btn-outline" href="${href("/tienda")}" data-track="tienda">Ver tienda →</a></p>
    </div>
  </section>
  <section class="alt">
    <div class="wrap">
      ${sectionHead(ph.blogLabel, ph.blogTitle)}
      <div class="post-list">
        ${posts.map((post) => `
        <article class="card card-post">
          <div class="card-body">
            <p class="label">${post.category} · ${post.date}</p>
            <h3 class="post-title">${brandTitleHtml(post.title)}</h3>
            <p class="post-excerpt">${post.excerpt}</p>
          </div>
          <img src="${img(post.image)}" alt="${post.title}" loading="lazy" class="card-post-media"/>
        </article>`).join("")}
      </div>
      <p class="section-actions"><a class="text-link" href="${href("/blog")}">Ver todo el blog →</a></p>
    </div>
  </section>
  ${loyaltyPromo.html}
  ${visitBand(href, brand, img, "home")}`;

  return shell({
    title: "Café de especialidad colombiano",
    description:
      "Más Café — tostadores de café de especialidad en Cali, Colombia. Menú, tienda online y hospitalidad en San Fernando Nuevo.",
    depth: 0,
    pageId: "home",
    heroArt: "/images/grafica/3.png",
    body,
    extraHead: loyaltyPromo.extraScript,
  });
}

export function pageCafe() {
  const site = loadSite();
  const { brand, products, brewGuide, pages } = site;
  const pc = pages.cafe;
  const { img, href } = createPathHelpers(1);
  const featured = products.filter((p) => p.featured);

  const body = `
  <section class="page-hero" style="--hero-art:url('${img("/images/grafica/2.png")}')">
    <div class="wrap inner">
      <p class="tagline">${pc.tagline}</p>
      <h1>${brandTitleHtml(pc.headline)}</h1>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="grid-2">
        <div class="product-img" style="border-radius:var(--radius);padding:2rem">
          <img src="${img("/images/products/caja-cafe.png")}" alt="Empaque Más Café"/>
        </div>
        <div>
          <h2>${brandTitleHtml(pc.brewTitle)}</h2>
          <ol class="steps" style="margin-top:1.5rem">${brewGuide.map((s, i) => `<li><span class="num">${String(i + 1).padStart(2, "0")}</span><span>${s}</span></li>`).join("")}</ol>
        </div>
      </div>
      <p class="label" style="margin-top:3rem">${pc.productsNote}</p>
      <div class="products cols-3" style="margin-top:1rem">${featured.map((p) => productCard(p, img)).join("")}</div>
      <p class="section-actions" style="text-align:center"><a class="btn btn-blue" href="${href("/tienda")}" data-track="tienda">Ver catálogo completo</a></p>
    </div>
  </section>
  ${visitBand(href, brand, img, "cafe")}`;

  return shell({
    title: "Café de especialidad",
    description:
      "Café de especialidad colombiano en Cali. Microlotes con trazabilidad, métodos de preparación y tienda Más Café.",
    depth: 1,
    pageId: "cafe",
    body,
  });
}

const MENU_CAT_NOTES = {
  cafe: "Origen del día",
  desayuno: "Mañanas con calma",
  reposteria: "Para cerrar con dulce",
};

function renderTextMenuFallback(menu) {
  return `
    <div class="menu-sheet">
      ${menu.map((cat) => `
      <div class="menu-cat">
        <div class="menu-cat-head">
          <h3>${brandTitleHtml(cat.name)}</h3>
          ${MENU_CAT_NOTES[cat.id] ? `<p class="cat-note">${MENU_CAT_NOTES[cat.id]}</p>` : ""}
        </div>
        ${cat.items.map((item) => `
        <div class="menu-item">
          <div>
            <span class="menu-item-name">${item.name}</span>
            ${item.description ? `<small>${item.description}</small>` : ""}
          </div>
          <span class="menu-item-price">${price(item.price)}</span>
        </div>`).join("")}
      </div>`).join("")}
    </div>`;
}

export function pageMenu() {
  const site = loadSite();
  const { brand, menu, pages } = site;
  const pm = pages.menu;
  const { href, img } = createPathHelpers(1);
  const bookPages = getMenuBookPagePaths();
  const startIdx = Math.min(MENU_BOOK_START_PAGE, Math.max(0, bookPages.length - 1));
  const extraHead = bookPages.length
    ? [...new Set([
        startIdx,
        startIdx + 1,
        startIdx - 1,
        0,
        ...bookPages.map((_, i) => i),
      ])]
        .filter((i) => i >= 0 && i < bookPages.length)
        .slice(0, 10)
        .map((i) => `<link rel="preload" as="image" href="${img(bookPages[i])}"/>`)
        .join("")
    : "";

  const body = `
  <section class="menu-page">
    <div class="menu-hero">
      <div class="wrap">
        <p class="soul">${pm.tagline}</p>
        <h1>${brandTitleHtml(pm.headline)}</h1>
        <p class="intro">${pm.intro || brand.purpose}</p>
      </div>
    </div>
    ${brandSeparator(img)}
    ${renderMenuBook({ img, pages: bookPages, disclaimer: pm.disclaimer })}
    ${bookPages.length ? "" : `${renderTextMenuFallback(menu)}<div class="menu-footer wrap"><p>${pm.disclaimer}</p></div>`}
  </section>
  ${visitBand(href, brand, img, "menu")}`;

  return shell({
    title: "Menú",
    description:
      "Menú digital Más Café en Cali: pasa las páginas como un libro. Café de especialidad, brunch y repostería.",
    depth: 1,
    pageId: "menu",
    extraHead,
    body,
  });
}

export function pageNosotros() {
  const site = loadSite();
  const { brand, pages } = site;
  const pn = pages.nosotros;
  const { img, href } = createPathHelpers(1);

  const body = `
  <section class="page-hero page-hero--feature" style="--hero-art:url('${img("/images/grafica/3.png")}')">
    <div class="wrap inner">
      <p class="tagline">${pn.tagline}</p>
      <h1>${brandTitleHtml(pn.headline)}</h1>
    </div>
  </section>
  <section class="on-light section-with-pattern">
    <div class="wrap">
      ${sectionHead("", pn.tagline, brand.story)}
      <div class="grid-2" style="margin-top:1.5rem">
        <div>
          <p class="text-lead">${brand.about}</p>
        </div>
        <img src="${img(brand.nosotrosImage)}" alt="Ambiente ${brand.name}" style="border-radius:1rem 2rem 1rem 2rem;width:100%;aspect-ratio:4/5;object-fit:cover;box-shadow:var(--shadow)"/>
      </div>
    </div>
  </section>
  ${brandSeparator(img)}
  <section class="alt on-light">
    <div class="wrap">
      ${sectionHead("Nuestra historia", "Conoce el espacio")}
      ${videoBlock(img, brand.nosotrosVideoUrl || "")}
    </div>
  </section>
  <section class="on-light">
    <div class="wrap">
      ${sectionHead(pn.valuesLabel, pn.valuesTitle)}
      <div class="values">${brand.values.map((v) => `
      <div class="value">
        <h3>${brandTitleHtml(v.title)}</h3>
        <p class="value-copy">${v.text}</p>
      </div>`).join("")}</div>
    </div>
  </section>
  <section class="quote-block">
    <div class="wrap">
      <p>&ldquo;${brand.quote}&rdquo;</p>
    </div>
  </section>
  ${visitBand(href, brand, img, "nosotros")}`;

  return shell({
    title: "Nosotros",
    description:
      "Conoce Más Café: historia, valores y equipo. Café de especialidad y hospitalidad en Cali, Colombia.",
    depth: 1,
    pageId: "nosotros",
    body,
  });
}

export function pageTienda() {
  const site = loadSite();
  const { brand, products, pages } = site;
  const pt = pages.tienda;
  const { img, href } = createPathHelpers(1);

  const body = `
  <section class="page-hero">
    <div class="wrap inner">
      <p class="tagline">${pt.tagline}</p>
      <h1>${brandTitleHtml(pt.headline)}</h1>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="products cols-3">${products.map((p) => productCard(p, img)).join("")}</div>
      <p class="section-actions" style="text-align:center"><a class="btn btn-green" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener noreferrer">Pedir por WhatsApp</a></p>
    </div>
  </section>
  ${visitBand(href, brand, img, "tienda")}`;

  return shell({
    title: "Tienda online",
    description:
      "Compra café de especialidad colombiano en la tienda Más Café. Grano y molido, envíos y retiro en Cali.",
    depth: 1,
    pageId: "tienda",
    body,
  });
}

export function pageBlog() {
  const site = loadSite();
  const { brand, blog, pages } = site;
  const pb = pages.blog;
  const { img, href } = createPathHelpers(1);
  const published = blog.filter((p) => p.published);

  const body = `
  <section class="page-hero light">
    <div class="wrap inner">
      <p class="tagline">${pb.tagline}</p>
      <h1>${brandTitleHtml(pb.headline)}</h1>
    </div>
  </section>
  <section>
    <div class="wrap">
      ${published.map((post, i) => `
      <article class="blog-post ${i % 2 === 1 ? "reverse" : ""}" id="${post.id}">
        <img src="${img(post.image)}" alt="${post.title}" loading="lazy"/>
        <div>
          <p class="label">${post.category} · ${post.date}</p>
          <h2 style="margin-top:.5rem">${brandTitleHtml(post.title)}</h2>
          <p class="text-lead-muted" style="margin-top:1rem">${post.excerpt}</p>
        </div>
      </article>`).join("")}
    </div>
  </section>
  ${visitBand(href, brand, img, "blog")}`;

  return shell({
    title: "Blog",
    description:
      "Blog Más Café: origen del café, recetas, cultura cafetera y novedades de nuestro local en Cali.",
    depth: 1,
    pageId: "blog",
    body,
  });
}

export function pageContacto() {
  const site = loadSite();
  const { brand, pages } = site;
  const pc = pages.contacto;
  const { href, img } = createPathHelpers(1);
  const loyaltyPromo = loyaltyPromoSection(1);

  const body = `
  <section class="page-hero page-hero--feature" style="--hero-art:url('${img("/images/grafica/2.png")}')">
    <div class="wrap inner">
      <p class="tagline">${pc.tagline}</p>
      <h1>${brandTitleHtml(pc.headline)}</h1>
    </div>
  </section>
  <section class="on-light section-with-pattern">
    <div class="wrap">
      <div class="grid-2" style="align-items:start">
        <div class="contact-info">
          <img src="${img("/images/brand/visita.png")}" alt="Visítanos en Más Café" style="width:100%;border-radius:1.25rem 2rem 1.25rem 2rem;margin-bottom:1.5rem;box-shadow:var(--shadow);aspect-ratio:16/10;object-fit:cover"/>
          <h2 class="section-title section-title--contact">${brandTitleHtml(pc.visitTitle)}</h2>
          <p class="text-lead" style="margin-top:1rem">${addressLinkHtml(brand)}<br/><span class="text-hours">${brand.hours}</span></p>
          <div class="actions" style="margin-top:1.25rem;display:flex;flex-wrap:wrap;gap:.65rem">
            <a class="btn btn-blue" href="${mapsUrl(brand)}" target="_blank" rel="noopener noreferrer" data-track="maps">Cómo llegar</a>
            <a class="btn btn-sage" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener noreferrer" data-track="whatsapp">WhatsApp</a>
          </div>
          <h2 class="contact-subtitle">${brandTitleHtml(pc.writeTitle)}</h2>
          <p style="margin-top:1rem;line-height:2.2">
            <a href="tel:${brand.phone.replace(/\s/g, "")}">${brand.phone}</a><br/>
            <a href="mailto:${brand.email}">${brand.email}</a>
          </p>
          <div class="social-links">
            <a href="${brand.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="${brand.social.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>
        <form class="contact-form" action="https://wa.me/${brand.whatsapp}" method="get" target="_blank" rel="noopener noreferrer">
          <h2 style="font-family:var(--font-display);color:var(--blue)">${brandTitleHtml(pc.formTitle)}</h2>
          <label>Nombre<input type="text" name="text" placeholder="Tu nombre" required/></label>
          <label>Email<input type="email" placeholder="tu@email.com"/></label>
          <label>Mensaje<textarea placeholder="¿En qué podemos ayudarte?"></textarea></label>
          <button type="submit" class="btn btn-blue" style="width:100%">Enviar por WhatsApp</button>
        </form>
      </div>
    </div>
  </section>
  ${loyaltyPromo.html}
  ${visitBand(href, brand, img, "contacto")}`;

  return shell({
    title: "Contacto",
    description:
      "Contacto Más Café — Calle 5B #2-38-09, San Fernando Nuevo, Cali. Horarios, WhatsApp y cómo llegar.",
    depth: 1,
    pageId: "contacto",
    body,
    extraHead: loyaltyPromo.extraScript,
  });
}

export function pageCustom(route) {
  const site = loadSite();
  const { brand } = site;
  const pg = site.pages?.[route.slug] || site.pages?.[route.id] || {};
  const { href, img } = createPathHelpers(1);

  const body = `
  <section class="page-hero light">
    <div class="wrap inner">
      <p class="tagline">${pg.tagline || route.label}</p>
      <h1>${brandTitleHtml(pg.headline || route.label)}</h1>
    </div>
  </section>
  <section>
    <div class="wrap" style="max-width:42rem;margin:0 auto">
      <p class="text-lead-muted">${pg.intro || pg.body || ""}</p>
    </div>
  </section>
  ${visitBand(href, brand, img, route.id)}`;

  return shell({
    title: route.label,
    description: pg.intro || pg.headline || route.label,
    depth: 1,
    pageId: route.id,
    body,
  });
}

const BUILTIN_GENERATORS = {
  cafe: pageCafe,
  menu: pageMenu,
  nosotros: pageNosotros,
  tienda: pageTienda,
  blog: pageBlog,
  contacto: pageContacto,
  fidelizacion: pageFidelizacion,
};

export function buildSitePages() {
  const site = loadSite();
  const pages = [{ path: "index.html", generator: pageHome }];

  for (const route of getEnabledRoutes(site)) {
    if (route.builtin && BUILTIN_GENERATORS[route.id]) {
      pages.push({ path: `${route.slug}/index.html`, generator: BUILTIN_GENERATORS[route.id] });
    } else if (!route.builtin) {
      const gen = () => pageCustom(route);
      pages.push({ path: `${route.slug}/index.html`, generator: gen });
    }
  }
  return pages;
}

/** @deprecated use buildSitePages() */
export const SITE_PAGES = buildSitePages();

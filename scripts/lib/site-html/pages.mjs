import {
  createPathHelpers,
  loadSite,
  price,
  shell,
} from "./shared.mjs";

function marqueeHtml(items) {
  const doubled = [...items, ...items];
  return doubled
    .map(
      (t) =>
        `<span class="marquee-item">${t}<span class="marquee-dot" aria-hidden="true"></span></span>`
    )
    .join("");
}

function visitBand(href, brand) {
  return `
  <section>
    <div class="wrap">
      <div class="cta">
        <p class="cta-tagline">${brand.tagline}</p>
        <h2>Te esperamos en Cali</h2>
        <p>${brand.address}<br/>${brand.city}</p>
        <p style="font-size:.88rem;margin-top:.5rem;opacity:.8">${brand.hours}</p>
        <div class="cta actions">
          <a class="btn btn-sage" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a class="btn btn-outline" href="${href("/contacto")}">Contacto</a>
          <a class="btn btn-outline" href="https://maps.google.com/?q=${encodeURIComponent(brand.address + ", " + brand.city)}" target="_blank" rel="noopener noreferrer">Cómo llegar</a>
        </div>
      </div>
    </div>
  </section>`;
}

function experienceRow(e, img, reverse) {
  return `
  <div class="exp-row${reverse ? " reverse" : ""}">
    <div class="exp-media"><img src="${img(e.image)}" alt="${e.title}" loading="lazy"/></div>
    <div class="exp-copy">
      <p class="label">${e.subtitle}</p>
      <h3>${e.title}</h3>
      <p style="margin-top:.85rem;opacity:.78;line-height:1.7">${e.description}</p>
    </div>
  </div>`;
}

function productCard(p, img) {
  return `
  <article class="product">
    ${p.image ? `<div class="product-img"><img src="${img(p.image)}" alt="${p.name}" loading="lazy"/></div>` : ""}
    <p class="label" style="color:var(--sage)">${p.variety} · ${p.region}</p>
    <h3>${p.name}</h3>
    ${p.farm ? `<p class="meta">${p.farm}${p.altitude ? ` · ${p.altitude}` : ""}</p>` : ""}
    <p class="meta" style="margin-top:.4rem">${p.notes.join(" · ")}</p>
    <p class="price">${price(p.price)}${p.weight ? ` <span style="font-size:.8rem;font-weight:400;opacity:.7">/ ${p.weight}</span>` : ""}</p>
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

  const body = `
  <section class="editorial-hero">
    <img class="decor decor-1" src="${img("/images/decor/Recurso-4.svg")}" alt="" aria-hidden="true"/>
    <img class="decor decor-2" src="${img("/images/decor/Recurso-6.svg")}" alt="" aria-hidden="true"/>
    <div class="hero-art hero-art-main">
      <img src="${img("/images/grafica/3.png")}" alt="" class="float-soft"/>
    </div>
    <div class="hero-art hero-art-secondary">
      <img src="${img("/images/grafica/1.png")}" alt=""/>
    </div>
    <div class="wrap hero-content">
      <p class="tagline">${brand.tagline}</p>
      <h1>${brand.headline}</h1>
      <p class="subhead">${brand.subheadline}</p>
      <p class="descriptor">${brand.descriptor}</p>
      <div class="actions">
        <a class="btn btn-sage" href="${href("/tienda")}">Comprar café fresco</a>
        <a class="btn btn-outline" href="${href("/nosotros")}">Nuestra historia</a>
      </div>
      <div class="brand-note">
        <img src="${img("/images/brand/favs.png")}" alt=""/>
        <p>Una experiencia que se vive sin prisa. Hospitalidad consciente en Cali.</p>
      </div>
    </div>
  </section>
  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">${marqueeHtml(marquee)}</div>
  </div>
  <section>
    <div class="wrap">
      <p class="label">${ph.experiencesLabel}</p>
      <h2>${ph.experiencesTitle}</h2>
      <div style="margin-top:2.5rem">${experiences.map((e, i) => experienceRow(e, img, i % 2 === 1)).join("")}</div>
      <p class="section-actions"><a class="text-link" href="${href("/nosotros")}">Conoce nuestra historia →</a></p>
    </div>
  </section>
  <section class="dark">
    <div class="wrap">
      <p class="label">${ph.productsLabel}</p>
      <h2>${ph.productsTitle}</h2>
      <div class="products" style="margin-top:2rem">${featured.map((p) => productCard(p, img)).join("")}</div>
      <p class="section-actions"><a class="btn btn-outline" href="${href("/tienda")}">Ver tienda →</a></p>
    </div>
  </section>
  <section class="alt">
    <div class="wrap">
      <p class="label">${ph.blogLabel}</p>
      <h2>${ph.blogTitle}</h2>
      <div style="margin-top:2rem;display:grid;gap:2rem">
        ${posts.map((post) => `
        <article class="grid-2 card">
          <img src="${img(post.image)}" alt="${post.title}" loading="lazy" style="aspect-ratio:16/10;object-fit:cover"/>
          <div class="card-body">
            <p class="label">${post.category} · ${post.date}</p>
            <h3>${post.title}</h3>
            <p style="margin-top:.75rem;opacity:.75">${post.excerpt}</p>
          </div>
        </article>`).join("")}
      </div>
      <p class="section-actions"><a class="text-link" href="${href("/blog")}">Ver todo el blog →</a></p>
    </div>
  </section>
  ${visitBand(href, brand)}`;

  return shell({
    title: "Café de especialidad colombiano",
    description: "Tostadores de café de especialidad en Cali, Colombia.",
    depth: 0,
    pageId: "home",
    heroArt: "/images/grafica/3.png",
    body,
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
      <h1>${pc.headline}</h1>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="grid-2">
        <div class="product-img" style="border-radius:var(--radius);padding:2rem">
          <img src="${img("/images/products/caja-cafe.png")}" alt="Empaque Más Café"/>
        </div>
        <div>
          <h2>${pc.brewTitle}</h2>
          <ol class="steps" style="margin-top:1.5rem">${brewGuide.map((s, i) => `<li><span class="num">${String(i + 1).padStart(2, "0")}</span><span>${s}</span></li>`).join("")}</ol>
        </div>
      </div>
      <p class="label" style="margin-top:3rem">${pc.productsNote}</p>
      <div class="products cols-3" style="margin-top:1rem">${featured.map((p) => productCard(p, img)).join("")}</div>
      <p class="section-actions" style="text-align:center"><a class="btn btn-blue" href="${href("/tienda")}">Ver catálogo completo</a></p>
    </div>
  </section>
  ${visitBand(href, brand)}`;

  return shell({
    title: "Café de especialidad",
    description: "Microlotes colombianos con trazabilidad al origen.",
    depth: 1,
    pageId: "cafe",
    body,
  });
}

const MENU_CAT_NOTES = {
  cafe: "Trazabilidad al origen",
  desayuno: "Para empezar con calma",
  reposteria: "Dulce pausa",
};

export function pageMenu() {
  const site = loadSite();
  const { brand, menu, pages } = site;
  const pm = pages.menu;
  const { href } = createPathHelpers(1);

  const body = `
  <section class="menu-page">
    <div class="menu-hero">
      <div class="wrap">
        <p class="soul">${pm.tagline}</p>
        <h1>${pm.headline}</h1>
        <p class="intro">${pm.intro || brand.purpose}</p>
      </div>
    </div>
    <div class="menu-sheet">
      ${menu.map((cat) => `
      <div class="menu-cat">
        <div class="menu-cat-head">
          <h3>${cat.name}</h3>
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
      <div class="menu-footer">
        <p>${pm.disclaimer}</p>
      </div>
    </div>
  </section>
  ${visitBand(href, brand)}`;

  return shell({
    title: "Menú",
    description: "Carta de café de especialidad, desayuno y repostería.",
    depth: 1,
    pageId: "menu",
    body,
  });
}

export function pageNosotros() {
  const site = loadSite();
  const { brand, pages } = site;
  const pn = pages.nosotros;
  const { img, href } = createPathHelpers(1);

  const body = `
  <section class="page-hero" style="--hero-art:url('${img("/images/grafica/3.png")}')">
    <div class="wrap inner">
      <p class="tagline">${pn.tagline}</p>
      <h1>${pn.headline}</h1>
    </div>
  </section>
  <section>
    <div class="wrap grid-2">
      <div>
        <p style="font-size:1.08rem;margin-bottom:1rem;line-height:1.75">${brand.story}</p>
        <p style="opacity:.8;line-height:1.7">${brand.vision}</p>
        <p style="margin-top:1.15rem;opacity:.8;line-height:1.7">${brand.purpose}</p>
        <p style="margin-top:1rem;opacity:.8;line-height:1.7">${brand.mission}</p>
      </div>
      <img src="${img(brand.nosotrosImage)}" alt="Ambiente ${brand.name}" style="border-radius:1rem 2rem 1rem 2rem;width:100%;aspect-ratio:4/5;object-fit:cover;box-shadow:var(--shadow)"/>
    </div>
  </section>
  <section class="alt">
    <div class="wrap">
      <p class="label">${pn.valuesLabel}</p>
      <h2>${pn.valuesTitle}</h2>
      <div class="values" style="margin-top:2rem">${brand.values.map((v) => `
      <div class="value">
        <h3>${v.title}</h3>
        <p style="margin-top:.5rem;opacity:.75;line-height:1.65">${v.text}</p>
      </div>`).join("")}</div>
    </div>
  </section>
  <section class="quote-block">
    <div class="wrap">
      <p>&ldquo;${brand.quote}&rdquo;</p>
    </div>
  </section>
  ${visitBand(href, brand)}`;

  return shell({
    title: "Nosotros",
    description: brand.purpose,
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
      <h1>${pt.headline}</h1>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="products cols-3">${products.map((p) => productCard(p, img)).join("")}</div>
      <p class="section-actions" style="text-align:center"><a class="btn btn-green" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener noreferrer">Pedir por WhatsApp</a></p>
    </div>
  </section>
  ${visitBand(href, brand)}`;

  return shell({
    title: "Tienda online",
    description: "Compra café de especialidad colombiano.",
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
      <h1>${pb.headline}</h1>
    </div>
  </section>
  <section>
    <div class="wrap">
      ${published.map((post, i) => `
      <article class="blog-post ${i % 2 === 1 ? "reverse" : ""}" id="${post.id}">
        <img src="${img(post.image)}" alt="${post.title}" loading="lazy"/>
        <div>
          <p class="label">${post.category} · ${post.date}</p>
          <h2 style="margin-top:.5rem">${post.title}</h2>
          <p style="margin-top:1rem;opacity:.75;font-size:1.05rem;line-height:1.7">${post.excerpt}</p>
        </div>
      </article>`).join("")}
    </div>
  </section>
  ${visitBand(href, brand)}`;

  return shell({
    title: "Blog",
    description: "Historias sobre café, origen y hospitalidad.",
    depth: 1,
    pageId: "blog",
    body,
  });
}

export function pageContacto() {
  const site = loadSite();
  const { brand, pages } = site;
  const pc = pages.contacto;
  const { href } = createPathHelpers(1);

  const body = `
  <section class="page-hero">
    <div class="wrap inner">
      <p class="tagline">${pc.tagline}</p>
      <h1>${pc.headline}</h1>
    </div>
  </section>
  <section>
    <div class="wrap grid-2">
      <div class="contact-info">
        <h2>${pc.visitTitle}</h2>
        <p style="margin-top:1rem;line-height:1.8">${brand.address}<br/>${brand.city}<br/><span style="font-size:.9rem;opacity:.7">${brand.hours}</span></p>
        <h2 style="margin-top:2rem">${pc.writeTitle}</h2>
        <p style="margin-top:1rem;line-height:2.2">
          <a href="tel:${brand.phone.replace(/\s/g, "")}">${brand.phone}</a><br/>
          <a href="mailto:${brand.email}">${brand.email}</a><br/>
          <a href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </p>
        <div class="social-links">
          <a href="${brand.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="${brand.social.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </div>
      <form class="contact-form" action="https://wa.me/${brand.whatsapp}" method="get" target="_blank" rel="noopener noreferrer">
        <h2>${pc.formTitle}</h2>
        <label>Nombre<input type="text" name="text" placeholder="Tu nombre" required/></label>
        <label>Email<input type="email" placeholder="tu@email.com"/></label>
        <label>Mensaje<textarea placeholder="¿En qué podemos ayudarte?"></textarea></label>
        <button type="submit" class="btn btn-blue" style="width:100%">Enviar por WhatsApp</button>
      </form>
    </div>
  </section>
  ${visitBand(href, brand)}`;

  return shell({
    title: "Contacto",
    description: "Visítanos en Cali o escríbenos.",
    depth: 1,
    pageId: "contacto",
    body,
  });
}

export const SITE_PAGES = [
  { path: "index.html", generator: pageHome },
  { path: "cafe/index.html", generator: pageCafe },
  { path: "menu/index.html", generator: pageMenu },
  { path: "nosotros/index.html", generator: pageNosotros },
  { path: "tienda/index.html", generator: pageTienda },
  { path: "blog/index.html", generator: pageBlog },
  { path: "contacto/index.html", generator: pageContacto },
];

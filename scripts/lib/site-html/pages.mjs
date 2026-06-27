import {
  createPathHelpers,
  loadSite,
  price,
  shell,
} from "./shared.mjs";

function visitBand(href, brand) {
  return `
  <section>
    <div class="wrap">
      <div class="cta">
        <p class="tagline" style="color:var(--sage);font-size:1.75rem">${brand.tagline}</p>
        <h2>Te esperamos en Cali</h2>
        <p>${brand.address}<br/>${brand.city}</p>
        <p style="font-size:.85rem;margin-top:.5rem">${brand.hours}</p>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:.75rem;margin-top:1.5rem">
          <a class="btn btn-sage" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="btn btn-outline" href="${href("/contacto")}">Contacto</a>
          <a class="btn btn-outline" href="https://maps.google.com/?q=${encodeURIComponent(brand.address + ", " + brand.city)}" target="_blank" rel="noopener">Cómo llegar</a>
        </div>
      </div>
    </div>
  </section>`;
}

function productCard(p, img) {
  return `
  <article class="product">
    ${p.image ? `<div class="product-img"><img src="${img(p.image)}" alt="${p.name}" loading="lazy"/></div>` : ""}
    <p class="label" style="color:var(--sage)">${p.variety} · ${p.region}</p>
    <h3>${p.name}</h3>
    ${p.farm ? `<p style="font-size:.85rem;opacity:.65">${p.farm}${p.altitude ? ` · ${p.altitude}` : ""}</p>` : ""}
    <p style="font-size:.8rem;opacity:.7;margin-top:.5rem">${p.notes.join(" · ")}</p>
    <p class="price">${price(p.price)}</p>
    ${p.subscription ? `<p style="margin-top:.5rem;font-size:.75rem;background:var(--green);display:inline-block;padding:.2rem .75rem;border-radius:999px">Suscripción</p>` : ""}
  </article>`;
}

export function pageHome() {
  const site = loadSite();
  const { brand, experiences, products, marquee, blog } = site;
  const { img, href } = createPathHelpers(0);
  const featured = products.filter((p) => p.featured);
  const posts = blog.filter((p) => p.published).slice(0, 2);

  const body = `
  <section class="hero">
    <div class="wrap">
      <p class="tagline">${brand.tagline}</p>
      <h1>${brand.headline}</h1>
      <p>${brand.subheadline}</p>
      <p style="margin-top:.75rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.25em;opacity:.5">${brand.descriptor}</p>
      <div class="actions">
        <a class="btn btn-sage" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn btn-outline" href="${href("/contacto")}">Visítanos</a>
      </div>
    </div>
  </section>
  <div class="marquee" aria-hidden="true">${[...marquee, ...marquee].map((t) => `<span>${t} ·</span>`).join("")}</div>
  <section>
    <div class="wrap">
      <p class="label">La experiencia</p>
      <h2>Una experiencia que se vive sin prisa</h2>
      <div style="margin-top:2.5rem;display:grid;gap:2.5rem">
        ${experiences.slice(0, 2).map((e) => `
        <div class="grid-2 card">
          <img src="${img(e.image)}" alt="${e.title}" loading="lazy"/>
          <div class="card-body">
            <p class="label">${e.subtitle}</p>
            <h3>${e.title}</h3>
            <p style="margin-top:.75rem;opacity:.75">${e.description}</p>
          </div>
        </div>`).join("")}
      </div>
      <p class="section-actions"><a class="text-link" href="${href("/nosotros")}">Conoce nuestra historia →</a></p>
    </div>
  </section>
  <section style="background:var(--blue);color:var(--cream)">
    <div class="wrap">
      <p class="label" style="color:var(--sage)">Café fresco</p>
      <h2 style="color:var(--cream)">Calidad extraordinaria, trazabilidad al origen</h2>
      <div class="products" style="margin-top:2rem">${featured.map((p) => productCard(p, img)).join("")}</div>
      <p class="section-actions"><a class="btn btn-outline" href="${href("/tienda")}">Ver tienda →</a></p>
    </div>
  </section>
  <section style="background:rgba(168,197,176,.2)">
    <div class="wrap">
      <p class="label">Blog</p>
      <h2>Historias & origen</h2>
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
  const { brand, products } = site;
  const { img, href } = createPathHelpers(1);
  const steps = [
    "Calienta 320 ml de agua hasta que deje de hervir.",
    "Usa 20 g de café (2 cucharadas colmadas aprox.).",
    "Vierte el agua despacio, en círculos. Filtra en 3-4 minutos.",
    "Sirve y disfruta. Ideal para goteo, prensa o pour over.",
  ];

  const body = `
  <section class="page-hero" style="--hero-art:url('${img("/images/grafica/2.png")}')">
    <div class="wrap">
      <p class="tagline">Café fresco</p>
      <h1>Calidad extraordinaria y trazabilidad al origen</h1>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="grid-2">
        <div class="product-img" style="background:rgba(168,197,176,.2);border-radius:1.5rem;padding:2rem">
          <img src="${img("/images/products/caja-cafe.png")}" alt="Empaque Más Café"/>
        </div>
        <div>
          <h2>Prepáralo en casa, a tu manera</h2>
          <ol class="steps" style="margin-top:1.5rem">${steps.map((s, i) => `<li><span class="num">${String(i + 1).padStart(2, "0")}</span><span>${s}</span></li>`).join("")}</ol>
        </div>
      </div>
      <div class="products cols-3" style="margin-top:3rem">${products.map((p) => productCard(p, img)).join("")}</div>
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

export function pageMenu() {
  const site = loadSite();
  const { brand, menu } = site;
  const { href } = createPathHelpers(1);

  const body = `
  <section class="page-hero light">
    <div class="wrap">
      <p class="tagline">Menú</p>
      <h1>Para cada momento del día</h1>
    </div>
  </section>
  <section>
    <div class="wrap" style="max-width:40rem">
      ${menu.map((cat) => `
      <div class="menu-cat">
        <h3>${cat.name}</h3>
        ${cat.items.map((item) => `
        <div class="menu-item">
          <div>${item.name}${item.description ? `<small>${item.description}</small>` : ""}</div>
          <strong>${price(item.price)}</strong>
        </div>`).join("")}
      </div>`).join("")}
      <p style="margin-top:2rem;text-align:center;font-size:.85rem;opacity:.6">Precios referenciales en COP. Pueden variar según temporada.</p>
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
  const { brand } = site;
  const { img, href } = createPathHelpers(1);

  const body = `
  <section class="page-hero" style="--hero-art:url('${img("/images/grafica/3.png")}')">
    <div class="wrap">
      <p class="tagline">${brand.descriptor}</p>
      <h1>Un espacio para pausar con intención</h1>
    </div>
  </section>
  <section>
    <div class="wrap grid-2">
      <div>
        <p style="font-size:1.05rem;margin-bottom:1rem">Toda historia tiene un comienzo. La nuestra comenzó con un café. Con una taza entre las manos y la certeza de que los mejores momentos merecen pausa.</p>
        <p style="opacity:.8">${brand.vision}</p>
        <p style="margin-top:1.25rem;opacity:.8">${brand.purpose}</p>
        <p style="margin-top:1rem;opacity:.8">${brand.mission}</p>
      </div>
      <img src="${img("/images/brand/mood.png")}" alt="Ambiente Más Café" style="border-radius:1rem 2rem 1rem 2rem;width:100%;aspect-ratio:4/5;object-fit:cover"/>
    </div>
  </section>
  <section style="background:rgba(168,197,176,.2)">
    <div class="wrap">
      <p class="label">Nuestros valores</p>
      <h2>Hospitalidad que va más allá del café</h2>
      <div class="values" style="margin-top:2rem">${brand.values.map((v) => `
      <div class="value">
        <h3>${v.title}</h3>
        <p style="margin-top:.5rem;opacity:.75">${v.text}</p>
      </div>`).join("")}</div>
    </div>
  </section>
  <section style="text-align:center">
    <div class="wrap">
      <p style="font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.35rem,3vw,2rem);color:var(--brown);max-width:36rem;margin:0 auto">&ldquo;Necesito un lugar donde pueda pausar, trabajar tranquilo y sentirme bien atendido.&rdquo;</p>
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
  const { brand, products } = site;
  const { img, href } = createPathHelpers(1);

  const body = `
  <section class="page-hero">
    <div class="wrap">
      <p class="tagline">Tienda</p>
      <h1>Café fresco, directo del origen</h1>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="products cols-3">${products.map((p) => productCard(p, img)).join("")}</div>
      <p style="margin-top:2rem;text-align:center"><a class="btn btn-blue" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener">Pedir por WhatsApp</a></p>
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
  const { brand, blog } = site;
  const { img, href } = createPathHelpers(1);
  const published = blog.filter((p) => p.published);

  const body = `
  <section class="page-hero light">
    <div class="wrap">
      <p class="tagline">Blog</p>
      <h1>Historias & origen</h1>
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
          <p style="margin-top:1rem;opacity:.75;font-size:1.05rem">${post.excerpt}</p>
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
  const { brand } = site;
  const { href } = createPathHelpers(1);

  const body = `
  <section class="page-hero">
    <div class="wrap">
      <p class="tagline">Contacto</p>
      <h1>Hablemos</h1>
    </div>
  </section>
  <section>
    <div class="wrap grid-2">
      <div>
        <h2>Visítanos</h2>
        <p style="margin-top:1rem;line-height:1.8">${brand.address}<br/>${brand.city}<br/><span style="font-size:.9rem;opacity:.7">${brand.hours}</span></p>
        <h2 style="margin-top:2rem">Escríbenos</h2>
        <p style="margin-top:1rem;line-height:2">
          <a href="tel:${brand.phone.replace(/\s/g, "")}">${brand.phone}</a><br/>
          <a href="mailto:${brand.email}">${brand.email}</a><br/>
          <a href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
        </p>
      </div>
      <form class="contact-form" action="https://wa.me/${brand.whatsapp}" method="get" target="_blank" rel="noopener">
        <h2>Envíanos un mensaje</h2>
        <label>Nombre<input type="text" name="text" placeholder="Tu nombre" required/></label>
        <label>Email<input type="email" placeholder="tu@email.com"/></label>
        <label>Mensaje<textarea placeholder="¿En qué podemos ayudarte?"></textarea></label>
        <button type="submit" class="btn btn-blue" style="width:100%;border:none;cursor:pointer">Enviar por WhatsApp</button>
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

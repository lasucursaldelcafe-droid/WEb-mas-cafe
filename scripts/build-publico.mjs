#!/usr/bin/env node
/**
 * Genera publico/index.html — HTML autónomo en GitHub, sin servidor local.
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const repo = "lasucursaldelcafe-droid/WEb-mas-cafe";
const branch = "main";
const rawBase = `https://raw.githubusercontent.com/${repo}/${branch}/public`;

const site = JSON.parse(
  readFileSync(path.join(root, "content/site.json"), "utf8")
);

function img(path) {
  return `${rawBase}${path}`;
}

function price(n) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

const { brand, experiences, products, menu, blog, marquee } = site;

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="theme-color" content="#073954"/>
  <title>${brand.name} | Café de especialidad colombiano</title>
  <meta name="description" content="Tostadores de café de especialidad en Cali, Colombia. Microlotes frescos y hospitalidad consciente."/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --cream:#f6f5ef;--cream-dark:#ebe8df;--blue:#073954;--blue-mid:#0a4d6e;
      --green:#1bb175;--sage:#a8c5b0;--brown:#8b6f47;--charcoal:#2a2a2a;
    }
    html{scroll-behavior:smooth}
    body{font-family:system-ui,-apple-system,sans-serif;background:var(--cream);color:var(--charcoal);line-height:1.6}
    img{max-width:100%;height:auto;display:block}
    a{color:inherit;text-decoration:none}
    .wrap{max-width:1100px;margin:0 auto;padding:0 1.5rem}
    header{position:sticky;top:0;z-index:50;background:rgba(7,57,84,.95);backdrop-filter:blur(8px);padding:1rem 0}
    header .wrap{display:flex;align-items:center;justify-content:space-between;gap:1rem}
    header img{height:2.25rem;width:auto}
    nav{display:flex;flex-wrap:wrap;gap:.5rem 1.25rem;font-size:.85rem}
    nav a{color:rgba(246,245,239,.9)}
    nav a:hover{color:var(--sage)}
    .btn{display:inline-block;padding:.75rem 1.75rem;border-radius:999px;font-size:.875rem;font-weight:600;transition:.2s}
    .btn-sage{background:var(--sage);color:var(--blue)}
    .btn-sage:hover{background:var(--cream)}
    .btn-outline{border:1px solid rgba(246,245,239,.3);color:var(--cream)}
    .btn-outline:hover{background:rgba(246,245,239,.1)}
    .hero{background:var(--blue);color:var(--cream);padding:5rem 0 4rem;position:relative;overflow:hidden}
    .hero::after{content:"";position:absolute;right:-5%;top:10%;width:50%;height:70%;background:url('${img("/images/grafica/3.png")}') right/contain no-repeat;opacity:.85;pointer-events:none}
    .hero .tagline{font-family:"Playfair Display",serif;font-style:italic;font-size:clamp(1.75rem,4vw,2.75rem);color:var(--sage)}
    .hero h1{font-family:"Playfair Display",serif;font-size:clamp(2.25rem,6vw,3.75rem);line-height:1.05;margin-top:1rem;max-width:18ch}
    .hero p{margin-top:1.25rem;max-width:32rem;opacity:.8;font-size:1.05rem}
    .hero .actions{margin-top:2rem;display:flex;flex-wrap:wrap;gap:.75rem}
    .marquee{background:rgba(168,197,176,.35);border-block:1px solid rgba(7,57,84,.08);padding:.85rem 0;overflow:hidden;white-space:nowrap}
    .marquee span{display:inline-block;padding:0 2rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(7,57,84,.65)}
    section{padding:4rem 0}
    h2{font-family:"Playfair Display",serif;font-size:clamp(1.75rem,4vw,2.75rem);color:var(--blue);line-height:1.15}
    .label{font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:var(--brown);margin-bottom:.5rem}
    .grid-2{display:grid;gap:2.5rem}
    @media(min-width:768px){.grid-2{grid-template-columns:1fr 1fr;align-items:center}}
    .card{background:#fff;border-radius:1.5rem;overflow:hidden;box-shadow:0 20px 50px rgba(7,57,84,.08)}
    .card img{width:100%;aspect-ratio:4/5;object-fit:cover}
    .card-body{padding:1.5rem}
    .card h3{font-family:"Playfair Display",serif;font-size:1.75rem;color:var(--blue)}
    .products{display:grid;gap:1.5rem}
    @media(min-width:640px){.products{grid-template-columns:repeat(2,1fr)}}
    .product{background:var(--blue);color:var(--cream);border-radius:1.5rem;padding:1.5rem}
    .product h3{font-family:"Playfair Display",serif;font-size:1.35rem;margin:.5rem 0}
    .product .price{font-size:1.25rem;font-weight:700;margin-top:.75rem}
    .menu-cat{margin-bottom:2rem}
    .menu-cat h3{font-family:"Playfair Display",serif;color:var(--blue);font-size:1.35rem;margin-bottom:.75rem}
    .menu-item{display:flex;justify-content:space-between;gap:1rem;padding:.6rem 0;border-bottom:1px solid rgba(7,57,84,.08)}
    .menu-item small{display:block;opacity:.65;font-size:.85rem}
    .values{display:grid;gap:1px;background:rgba(7,57,84,.1);border-radius:1.25rem;overflow:hidden}
    .value{padding:1.5rem;background:var(--cream)}
    .value:nth-child(even){background:var(--cream-dark)}
    .value h3{font-family:"Playfair Display",serif;color:var(--blue);font-size:1.2rem}
    .cta{background:var(--blue);color:var(--cream);border-radius:2rem;padding:3rem 2rem;text-align:center}
    .cta h2{color:var(--cream)}
    .cta p{opacity:.75;margin:1rem auto 1.5rem;max-width:28rem}
    footer{background:var(--blue);color:var(--cream);padding:3rem 0 2rem}
    footer .wrap{display:grid;gap:2rem}
    @media(min-width:768px){footer .wrap{grid-template-columns:1fr 1fr}}
    footer a:hover{color:var(--sage)}
    .footer-bottom{margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(246,245,239,.1);font-size:.8rem;opacity:.5;display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem}
    #contacto .info{font-size:1.05rem;line-height:1.8}
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <a href="#inicio"><img src="${img("/images/brand/horizontal-crema.png")}" alt="${brand.name}"/></a>
      <nav>
        <a href="#experiencia">Experiencia</a>
        <a href="#cafe">Café</a>
        <a href="#menu">Menú</a>
        <a href="#nosotros">Nosotros</a>
        <a href="#contacto">Contacto</a>
      </nav>
    </div>
  </header>

  <section class="hero" id="inicio">
    <div class="wrap">
      <p class="tagline">${brand.tagline}</p>
      <h1>${brand.headline}</h1>
      <p>${brand.subheadline}</p>
      <p style="margin-top:.75rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.25em;opacity:.5">${brand.descriptor}</p>
      <div class="actions">
        <a class="btn btn-sage" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn btn-outline" href="#contacto">Visítanos</a>
      </div>
    </div>
  </section>

  <div class="marquee" aria-hidden="true">
    ${[...marquee, ...marquee].map((t) => `<span>${t} ·</span>`).join("")}
  </div>

  <section id="experiencia">
    <div class="wrap">
      <p class="label">La experiencia</p>
      <h2>Una experiencia que se vive sin prisa</h2>
      <div style="margin-top:2.5rem;display:grid;gap:2.5rem">
        ${experiences
          .map(
            (e) => `
        <div class="grid-2 card">
          <img src="${img(e.image)}" alt="${e.title}" loading="lazy"/>
          <div class="card-body">
            <p class="label">${e.subtitle}</p>
            <h3>${e.title}</h3>
            <p style="margin-top:.75rem;opacity:.75">${e.description}</p>
          </div>
        </div>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section id="cafe" style="background:var(--blue);color:var(--cream)">
    <div class="wrap">
      <p class="label" style="color:var(--sage)">Café fresco</p>
      <h2 style="color:var(--cream)">Calidad extraordinaria, trazabilidad al origen</h2>
      <div class="products" style="margin-top:2rem">
        ${products
          .filter((p) => p.featured)
          .map(
            (p) => `
        <div class="product">
          <p class="label" style="color:var(--sage)">${p.variety} · ${p.region}</p>
          <h3>${p.name}</h3>
          ${p.farm ? `<p style="font-size:.85rem;opacity:.65">${p.farm} · ${p.altitude ?? ""}</p>` : ""}
          <p style="font-size:.8rem;opacity:.7;margin-top:.5rem">${p.notes.join(" · ")}</p>
          <p class="price">${price(p.price)}</p>
          ${p.subscription ? `<p style="margin-top:.5rem;font-size:.75rem;background:var(--green);display:inline-block;padding:.2rem .75rem;border-radius:999px">Suscripción</p>` : ""}
        </div>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section id="menu">
    <div class="wrap">
      <p class="label">Carta</p>
      <h2>Menú</h2>
      <div style="margin-top:2rem;max-width:40rem">
        ${menu
          .map(
            (cat) => `
        <div class="menu-cat">
          <h3>${cat.name}</h3>
          ${cat.items
            .map(
              (item) => `
          <div class="menu-item">
            <div>${item.name}${item.description ? `<small>${item.description}</small>` : ""}</div>
            <strong>${price(item.price)}</strong>
          </div>`
            )
            .join("")}
        </div>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section id="nosotros" style="background:rgba(168,197,176,.2)">
    <div class="wrap">
      <p class="label">Nosotros</p>
      <h2>Hospitalidad que va más allá del café</h2>
      <p style="margin-top:1.25rem;max-width:40rem;font-size:1.05rem">${brand.purpose}</p>
      <p style="margin-top:1rem;max-width:40rem;opacity:.8">${brand.mission}</p>
      <div class="values" style="margin-top:2.5rem">
        ${brand.values
          .map(
            (v) => `
        <div class="value">
          <h3>${v.title}</h3>
          <p style="margin-top:.5rem;opacity:.75">${v.text}</p>
        </div>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="cta">
        <p class="tagline" style="color:var(--sage);font-size:1.75rem">${brand.tagline}</p>
        <h2>Te esperamos en Cali</h2>
        <p>${brand.address}<br/>${brand.city}</p>
        <p style="font-size:.85rem;margin-top:.5rem">${brand.hours}</p>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:.75rem;margin-top:1.5rem">
          <a class="btn btn-sage" href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="btn btn-outline" href="https://maps.google.com/?q=${encodeURIComponent(brand.address + ", " + brand.city)}" target="_blank" rel="noopener">Cómo llegar</a>
        </div>
      </div>
    </div>
  </section>

  <footer id="contacto">
    <div class="wrap">
      <div>
        <img src="${img("/images/brand/horizontal-crema.png")}" alt="${brand.name}" style="height:2.5rem;margin-bottom:1rem"/>
        <p class="tagline" style="font-family:'Playfair Display',serif;font-style:italic;font-size:1.75rem;color:var(--sage)">${brand.tagline}</p>
        <p style="opacity:.6;margin-top:.5rem">${brand.descriptor}</p>
      </div>
      <div class="info">
        <p><strong>Visítanos</strong></p>
        <p>${brand.address}<br/>${brand.city}</p>
        <p style="margin-top:.75rem">${brand.hours}</p>
        <p style="margin-top:.75rem"><a href="tel:${brand.phone.replace(/\s/g, "")}">${brand.phone}</a></p>
        <p><a href="mailto:${brand.email}">${brand.email}</a></p>
        <p style="margin-top:.75rem"><a href="${brand.social.instagram}" target="_blank" rel="noopener">Instagram</a></p>
      </div>
      <div class="footer-bottom" style="grid-column:1/-1">
        <span>© ${new Date().getFullYear()} ${brand.name}</span>
        <span>Cali, Colombia</span>
      </div>
    </div>
  </footer>
</body>
</html>`;

const outDir = path.join(root, "publico");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "index.html"), html, "utf8");

const enlaces = `# Enlaces de acceso — Más Café

## Ver el sitio (sin instalar nada)

| Enlace | Uso |
|--------|-----|
| **jsDelivr (recomendado)** | https://cdn.jsdelivr.net/gh/${repo}@main/publico/index.html |
| **HTMLPreview** | https://htmlpreview.github.io/?https://raw.githubusercontent.com/${repo}/${branch}/publico/index.html |
| **Archivo en GitHub** | https://github.com/${repo}/blob/${branch}/publico/index.html |

## GitHub Pages (cuando lo actives)

1. Settings → Pages → Deploy from branch → \`gh-pages\` → / (root)
2. URL: https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/

## Actualizar

Edita \`content/site.json\` y ejecuta:

\`\`\`bash
npm run build:publico
git add publico/ content/site.json
git commit -m "Actualizar sitio público"
git push
\`\`\`
`;

writeFileSync(path.join(outDir, "ENLACES.md"), enlaces, "utf8");

console.log("\n✅ HTML público generado: publico/index.html\n");
console.log("Enlaces de acceso:");
console.log(`  https://cdn.jsdelivr.net/gh/${repo}@main/publico/index.html`);
console.log(`  https://htmlpreview.github.io/?https://raw.githubusercontent.com/${repo}/${branch}/publico/index.html\n`);

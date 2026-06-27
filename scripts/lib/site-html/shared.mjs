import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../../..");

export function loadSite() {
  return JSON.parse(readFileSync(path.join(root, "content/site.json"), "utf8"));
}

export function price(n) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

/** depth 0 = index.html, depth 1 = cafe/index.html, etc. */
export function createPathHelpers(depth) {
  const up = depth === 0 ? "" : "../".repeat(depth);
  return {
    img: (assetPath) => `${up}${assetPath.replace(/^\//, "")}`,
    href: (route) => {
      if (!route || route === "/") return depth === 0 ? "./" : up;
      const clean = route.replace(/^\//, "").replace(/\/$/, "");
      return `${up}${clean}/`;
    },
  };
}

export const NAV = [
  { id: "cafe", label: "Café", route: "/cafe" },
  { id: "menu", label: "Menú", route: "/menu" },
  { id: "nosotros", label: "Nosotros", route: "/nosotros" },
  { id: "tienda", label: "Tienda", route: "/tienda" },
  { id: "blog", label: "Blog", route: "/blog" },
  { id: "contacto", label: "Contacto", route: "/contacto" },
];

export function siteStyles() {
  return `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --cream:#f6f5ef;--cream-dark:#ebe8df;--blue:#073954;--blue-mid:#0a4d6e;
      --green:#1bb175;--sage:#a8c5b0;--brown:#8b6f47;--charcoal:#2a2a2a;
    }
    html{scroll-behavior:smooth}
    body{font-family:system-ui,-apple-system,sans-serif;background:var(--cream);color:var(--charcoal);line-height:1.6;min-height:100vh;display:flex;flex-direction:column}
    main{flex:1}
    img{max-width:100%;height:auto;display:block}
    a{color:inherit;text-decoration:none}
    .wrap{max-width:1100px;margin:0 auto;padding:0 1.5rem}
    header{position:sticky;top:0;z-index:50;background:rgba(7,57,84,.95);backdrop-filter:blur(8px);padding:1rem 0}
    header .wrap{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
    header img{height:2.25rem;width:auto}
    nav{display:flex;flex-wrap:wrap;gap:.35rem 1rem;font-size:.82rem}
    nav a{color:rgba(246,245,239,.85);padding:.2rem 0;border-bottom:2px solid transparent}
    nav a:hover,nav a.active{color:var(--sage);border-bottom-color:var(--sage)}
    .btn{display:inline-block;padding:.75rem 1.75rem;border-radius:999px;font-size:.875rem;font-weight:600;transition:.2s}
    .btn-sage{background:var(--sage);color:var(--blue)}
    .btn-sage:hover{background:var(--cream)}
    .btn-outline{border:1px solid rgba(246,245,239,.3);color:var(--cream)}
    .btn-outline:hover{background:rgba(246,245,239,.1)}
    .btn-blue{background:var(--blue);color:var(--cream)}
    .btn-blue:hover{background:var(--blue-mid)}
    .hero{background:var(--blue);color:var(--cream);padding:5rem 0 4rem;position:relative;overflow:hidden}
    .hero::after{content:"";position:absolute;right:-5%;top:10%;width:50%;height:70%;background:var(--hero-art) right/contain no-repeat;opacity:.85;pointer-events:none}
    .hero .tagline{font-family:"Playfair Display",serif;font-style:italic;font-size:clamp(1.75rem,4vw,2.75rem);color:var(--sage)}
    .hero h1{font-family:"Playfair Display",serif;font-size:clamp(2.25rem,6vw,3.75rem);line-height:1.05;margin-top:1rem;max-width:20ch}
    .hero p{margin-top:1.25rem;max-width:32rem;opacity:.8;font-size:1.05rem}
    .hero .actions{margin-top:2rem;display:flex;flex-wrap:wrap;gap:.75rem}
    .page-hero{background:var(--blue);color:var(--cream);padding:6rem 0 3rem}
    .page-hero.light{background:rgba(168,197,176,.35);color:var(--blue)}
    .page-hero h1{font-family:"Playfair Display",serif;font-size:clamp(2rem,5vw,3.25rem);line-height:1.1;margin-top:.75rem}
    .page-hero .tagline{font-family:"Playfair Display",serif;font-style:italic;font-size:clamp(1.5rem,3vw,2.25rem);color:var(--sage)}
    .page-hero.light .tagline{color:var(--brown)}
    .marquee{background:rgba(168,197,176,.35);border-block:1px solid rgba(7,57,84,.08);padding:.85rem 0;overflow:hidden;white-space:nowrap}
    .marquee span{display:inline-block;padding:0 2rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(7,57,84,.65)}
    section{padding:4rem 0}
    h2{font-family:"Playfair Display",serif;font-size:clamp(1.75rem,4vw,2.75rem);color:var(--blue);line-height:1.15}
    h3{font-family:"Playfair Display",serif;color:var(--blue)}
    .label{font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:var(--brown);margin-bottom:.5rem}
    .grid-2{display:grid;gap:2.5rem}
    @media(min-width:768px){.grid-2{grid-template-columns:1fr 1fr;align-items:center}}
    .card{background:#fff;border-radius:1.5rem;overflow:hidden;box-shadow:0 20px 50px rgba(7,57,84,.08)}
    .card img{width:100%;aspect-ratio:4/5;object-fit:cover}
    .card-body{padding:1.5rem}
    .products{display:grid;gap:1.5rem}
    @media(min-width:640px){.products{grid-template-columns:repeat(2,1fr)}}
    @media(min-width:960px){.products.cols-3{grid-template-columns:repeat(3,1fr)}}
    .product{background:var(--blue);color:var(--cream);border-radius:1.5rem;padding:1.5rem;height:100%}
    .product h3{font-size:1.35rem;margin:.5rem 0}
    .product .price{font-size:1.25rem;font-weight:700;margin-top:.75rem}
    .product-img{background:rgba(168,197,176,.15);border-radius:1rem;padding:1rem;margin-bottom:1rem}
    .product-img img{max-height:180px;margin:0 auto;object-fit:contain}
    .menu-cat{margin-bottom:2rem}
    .menu-cat h3{font-size:1.35rem;margin-bottom:.75rem}
    .menu-item{display:flex;justify-content:space-between;gap:1rem;padding:.6rem 0;border-bottom:1px solid rgba(7,57,84,.08)}
    .menu-item small{display:block;opacity:.65;font-size:.85rem}
    .values{display:grid;gap:1px;background:rgba(7,57,84,.1);border-radius:1.25rem;overflow:hidden}
    .value{padding:1.5rem;background:var(--cream)}
    .value:nth-child(even){background:var(--cream-dark)}
    .value h3{font-size:1.2rem}
    .cta{background:var(--blue);color:var(--cream);border-radius:2rem;padding:3rem 2rem;text-align:center}
    .cta h2{color:var(--cream)}
    .cta p{opacity:.75;margin:1rem auto 1.5rem;max-width:28rem}
    .blog-post{display:grid;gap:2rem;margin-bottom:3rem}
    @media(min-width:768px){.blog-post{grid-template-columns:1fr 1fr;align-items:center}}
    .blog-post img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:1.5rem 2.5rem 1.5rem 2.5rem}
    .blog-post.reverse img{order:2}
    .blog-post.reverse > div{order:1}
    .steps{list-style:none;display:grid;gap:1rem}
    .steps li{display:flex;gap:1rem;align-items:flex-start}
    .steps .num{font-family:"Playfair Display",serif;font-size:1.75rem;color:var(--sage);min-width:2.5rem}
    .contact-form{background:#fff;border-radius:1.5rem 2.5rem 1.5rem 2.5rem;padding:2rem;box-shadow:0 20px 50px rgba(7,57,84,.08)}
    .contact-form input,.contact-form textarea{width:100%;margin-top:.35rem;margin-bottom:1rem;padding:.75rem 1rem;border:1px solid rgba(7,57,84,.12);border-radius:.75rem;font:inherit;background:var(--cream)}
    .contact-form textarea{min-height:120px;resize:vertical}
    footer{background:var(--blue);color:var(--cream);padding:3rem 0 2rem;margin-top:auto}
    footer .wrap{display:grid;gap:2rem}
    @media(min-width:768px){footer .wrap{grid-template-columns:1fr 1fr}}
    footer a:hover{color:var(--sage)}
    .footer-bottom{margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(246,245,239,.1);font-size:.8rem;opacity:.5;display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem}
    .section-actions{margin-top:1.5rem}
    .text-link{color:var(--blue);font-weight:600;text-decoration:underline;text-underline-offset:3px}
  `;
}

export function shell({ title, description, depth, pageId, heroArt, body }) {
  const site = loadSite();
  const { brand } = site;
  const { img, href } = createPathHelpers(depth);
  const heroVar = heroArt ? `--hero-art:url('${img(heroArt)}')` : `--hero-art:none`;

  const nav = NAV.map(
    (n) =>
      `<a href="${href(n.route)}" class="${pageId === n.id ? "active" : ""}">${n.label}</a>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="theme-color" content="#073954"/>
  <title>${title} | ${brand.name}</title>
  <meta name="description" content="${description}"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet"/>
  <style>${siteStyles()}</style>
  <style>:root{${heroVar}}</style>
</head>
<body>
  <header>
    <div class="wrap">
      <a href="${href("/")}"><img src="${img("/images/brand/horizontal-crema.png")}" alt="${brand.name}"/></a>
      <nav>${nav}<a href="${href("/tienda")}" class="btn btn-sage" style="padding:.45rem 1rem;font-size:.75rem">Comprar café</a></nav>
    </div>
  </header>
  <main>${body}</main>
  <footer>
    <div class="wrap">
      <div>
        <img src="${img("/images/brand/horizontal-crema.png")}" alt="${brand.name}" style="height:2.5rem;margin-bottom:1rem"/>
        <p class="tagline" style="font-family:'Playfair Display',serif;font-style:italic;font-size:1.75rem;color:var(--sage)">${brand.tagline}</p>
        <p style="opacity:.6;margin-top:.5rem">${brand.descriptor}</p>
      </div>
      <div style="font-size:1.05rem;line-height:1.8">
        <p><strong>Visítanos</strong></p>
        <p>${brand.address}<br/>${brand.city}</p>
        <p style="margin-top:.75rem">${brand.hours}</p>
        <p style="margin-top:.75rem"><a href="tel:${brand.phone.replace(/\s/g, "")}">${brand.phone}</a></p>
        <p><a href="mailto:${brand.email}">${brand.email}</a></p>
        <p style="margin-top:.75rem"><a href="${brand.social.instagram}" target="_blank" rel="noopener">Instagram</a></p>
      </div>
      <div class="footer-bottom" style="grid-column:1/-1">
        <span>© ${new Date().getFullYear()} ${brand.name}</span>
        <span><a href="${href("/contacto")}">Contacto</a> · Cali, Colombia</span>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

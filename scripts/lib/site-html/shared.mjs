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

export function themeCss(site) {
  const d = {
    cream: "#f6f5ef",
    creamDark: "#ebe8df",
    blue: "#073954",
    blueMid: "#0a4d6e",
    green: "#1bb175",
    sage: "#a8c5b0",
    brown: "#8b6f47",
    charcoal: "#2a2a2a",
  };
  const t = { ...d, ...(site.theme || {}) };
  return `:root{
    --cream:${t.cream};--cream-dark:${t.creamDark};--blue:${t.blue};--blue-mid:${t.blueMid};
    --green:${t.green};--sage:${t.sage};--brown:${t.brown};--charcoal:${t.charcoal};
  }`;
}

export function siteStyles() {
  return `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --green-dark:#159a63;--shadow:0 20px 50px rgba(7,57,84,.08);
      --radius:1.5rem;--ease:cubic-bezier(.4,0,.2,1);
    }
    html{scroll-behavior:smooth}
    body{
      font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      background:var(--cream);color:var(--charcoal);line-height:1.65;
      min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;
    }
    main{flex:1}
    img{max-width:100%;height:auto;display:block}
    a{color:inherit;text-decoration:none}
    .wrap{max-width:1140px;margin:0 auto;padding:0 1.5rem}
    .skip-link{
      position:absolute;left:-9999px;top:.5rem;z-index:200;padding:.5rem 1rem;
      background:var(--cream);color:var(--blue);border-radius:.5rem;font-weight:600;
    }
    .skip-link:focus{left:1rem}
    header{
      position:sticky;top:0;z-index:100;
      background:rgba(7,57,84,.92);backdrop-filter:blur(16px);
      border-bottom:1px solid rgba(168,197,176,.08);padding:1rem 0;
    }
    header .wrap{display:flex;align-items:center;justify-content:space-between;gap:2rem}
    .logo img{height:2rem;width:auto;transition:opacity .25s}
    .logo:hover img{opacity:.85}
    .nav-toggle{
      display:none;background:transparent;border:none;
      color:rgba(246,245,239,.7);padding:.5rem;font:inherit;cursor:pointer;
      font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;
    }
    nav.site-nav{display:flex;align-items:center;gap:clamp(1rem,3vw,2rem)}
    nav.site-nav a{
      color:rgba(246,245,239,.72);font-size:.78rem;letter-spacing:.06em;
      padding:0;position:relative;transition:color .3s;
    }
    nav.site-nav a::after{
      content:"";position:absolute;left:0;bottom:-4px;width:0;height:1px;
      background:var(--sage);transition:width .3s var(--ease);
    }
    nav.site-nav a:hover,nav.site-nav a.active{color:var(--cream)}
    nav.site-nav a:hover::after,nav.site-nav a.active::after{width:100%}
    .nav-cta{
      font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;
      color:var(--sage)!important;padding:.45rem 0!important;
      opacity:.9;
    }
    .nav-cta::after{display:none}
    .nav-cta:hover{opacity:1;color:var(--cream)!important}
    .btn{
      display:inline-flex;align-items:center;justify-content:center;gap:.4rem;
      padding:.75rem 1.75rem;border-radius:999px;font-size:.875rem;font-weight:600;
      border:none;cursor:pointer;transition:transform .15s var(--ease),background .2s,box-shadow .2s;
    }
    .btn:hover{transform:translateY(-1px)}
    .btn-sage{background:var(--sage);color:var(--blue)}
    .btn-sage:hover{background:var(--cream);box-shadow:0 8px 24px rgba(168,197,176,.35)}
    .btn-outline{border:1px solid rgba(246,245,239,.35);color:var(--cream);background:transparent}
    .btn-outline:hover{background:rgba(246,245,239,.1)}
    .btn-blue{background:var(--blue);color:var(--cream)}
    .btn-blue:hover{background:var(--blue-mid);box-shadow:0 8px 24px rgba(7,57,84,.25)}
    .btn-green{background:var(--green);color:#fff}
    .btn-green:hover{background:var(--green-dark)}
    .hero{
      background:linear-gradient(135deg,var(--blue) 0%,var(--blue-mid) 55%,#0c5a7a 100%);
      color:var(--cream);padding:clamp(4rem,10vw,6.5rem) 0 clamp(3.5rem,8vw,5rem);
      position:relative;overflow:hidden;
    }
    .hero::before{
      content:"";position:absolute;inset:0;
      background:radial-gradient(ellipse 60% 50% at 85% 40%,rgba(168,197,176,.15),transparent 70%);
      pointer-events:none;
    }
    .hero::after{
      content:"";position:absolute;right:-8%;top:5%;width:min(52%,480px);height:75%;
      background:var(--hero-art) right/contain no-repeat;opacity:.9;pointer-events:none;
    }
    .hero .inner{position:relative;z-index:1;max-width:36rem}
    .hero .tagline{
      font-family:"Playfair Display",Georgia,serif;font-style:italic;
      font-size:clamp(1.65rem,4vw,2.65rem);color:var(--sage);line-height:1.15;
    }
    .hero h1{
      font-family:"Playfair Display",Georgia,serif;
      font-size:clamp(2.1rem,5.5vw,3.65rem);line-height:1.05;margin-top:.85rem;
    }
    .hero p{margin-top:1.15rem;max-width:32rem;opacity:.85;font-size:1.05rem}
    .hero .descriptor{
      margin-top:.85rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.28em;opacity:.5;
    }
    .hero .actions{margin-top:2rem;display:flex;flex-wrap:wrap;gap:.75rem}
    .page-hero{
      background:linear-gradient(160deg,var(--blue),var(--blue-mid));
      color:var(--cream);padding:clamp(4.5rem,9vw,6rem) 0 clamp(2.5rem,5vw,3.5rem);
      position:relative;overflow:hidden;
    }
    .page-hero::after{
      content:"";position:absolute;right:-5%;bottom:0;width:45%;height:80%;
      background:var(--hero-art) right bottom/contain no-repeat;opacity:.35;pointer-events:none;
    }
    .page-hero .inner{position:relative;z-index:1}
    .page-hero.light{background:linear-gradient(180deg,rgba(168,197,176,.4),rgba(168,197,176,.15));color:var(--blue)}
    .page-hero.light::after{display:none}
    .page-hero h1{
      font-family:"Playfair Display",Georgia,serif;
      font-size:clamp(2rem,5vw,3.15rem);line-height:1.08;margin-top:.65rem;
    }
    .page-hero .tagline{
      font-family:"Playfair Display",Georgia,serif;font-style:italic;
      font-size:clamp(1.4rem,3vw,2.1rem);color:var(--sage);
    }
    .page-hero.light .tagline{color:var(--brown)}
    .marquee{
      background:rgba(168,197,176,.32);border-block:1px solid rgba(7,57,84,.07);
      padding:.9rem 0;overflow:hidden;
    }
    .marquee-track{
      display:flex;width:max-content;animation:marquee 40s linear infinite;
    }
    .marquee:hover .marquee-track{animation-play-state:paused}
    .marquee span{
      flex-shrink:0;padding:0 2.25rem;font-size:.72rem;text-transform:uppercase;
      letter-spacing:.22em;color:rgba(7,57,84,.6);white-space:nowrap;
    }
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    section{padding:clamp(3.5rem,8vw,5rem) 0}
    section.alt{background:rgba(168,197,176,.18)}
    section.dark{background:var(--blue);color:var(--cream)}
    section.dark h2{color:var(--cream)}
    section.dark .label{color:var(--sage)}
    h2{
      font-family:"Playfair Display",Georgia,serif;
      font-size:clamp(1.75rem,4vw,2.65rem);color:var(--blue);line-height:1.12;
    }
    h3{font-family:"Playfair Display",Georgia,serif;color:var(--blue);font-size:1.35rem}
    .label{
      font-size:.68rem;text-transform:uppercase;letter-spacing:.22em;
      color:var(--brown);margin-bottom:.55rem;font-weight:600;
    }
    .grid-2{display:grid;gap:2.5rem}
    @media(min-width:768px){.grid-2{grid-template-columns:1fr 1fr;align-items:center}}
    .card{
      background:#fff;border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);
      transition:transform .25s var(--ease),box-shadow .25s;
    }
    .card:hover{transform:translateY(-3px);box-shadow:0 28px 60px rgba(7,57,84,.12)}
    .card img{width:100%;aspect-ratio:4/5;object-fit:cover}
    .card-body{padding:1.65rem}
    .exp-row{display:grid;gap:2.5rem;margin-bottom:2.5rem}
    @media(min-width:768px){
      .exp-row{grid-template-columns:1fr 1fr;align-items:center}
      .exp-row.reverse .exp-media{order:2}
      .exp-row.reverse .exp-copy{order:1}
    }
    .exp-media img{border-radius:var(--radius);width:100%;aspect-ratio:4/5;object-fit:cover;box-shadow:var(--shadow)}
    .products{display:grid;gap:1.5rem}
    @media(min-width:640px){.products{grid-template-columns:repeat(2,1fr)}}
    @media(min-width:960px){.products.cols-3{grid-template-columns:repeat(3,1fr)}}
    .product{
      background:linear-gradient(145deg,var(--blue-mid),var(--blue));
      color:var(--cream);border-radius:var(--radius);padding:1.65rem;height:100%;
      display:flex;flex-direction:column;transition:transform .2s;
    }
    .product:hover{transform:translateY(-4px)}
    .product h3{font-size:1.3rem;margin:.45rem 0;color:var(--cream)}
    .product .meta{font-size:.82rem;opacity:.7}
    .product .price{font-size:1.3rem;font-weight:700;margin-top:auto;padding-top:.85rem}
    .product-img{background:rgba(168,197,176,.12);border-radius:1rem;padding:1.25rem;margin-bottom:1rem}
    .product-img img{max-height:170px;margin:0 auto;object-fit:contain}
    .badge{
      display:inline-block;font-size:.7rem;font-weight:600;
      background:var(--green);color:#fff;padding:.25rem .75rem;border-radius:999px;margin-top:.5rem;
    }
    .menu-page{background:var(--cream)}
    .menu-hero{
      text-align:center;padding:clamp(4rem,10vw,6rem) 0 clamp(2rem,5vw,3rem);
      background:var(--cream);color:var(--blue);
    }
    .menu-hero .soul{
      font-family:"Playfair Display",Georgia,serif;font-style:italic;
      font-size:clamp(1.5rem,3.5vw,2.25rem);color:var(--brown);margin-bottom:.75rem;
    }
    .menu-hero h1{
      font-family:"Playfair Display",Georgia,serif;font-weight:400;
      font-size:clamp(1.75rem,4vw,2.5rem);line-height:1.2;color:var(--blue);
    }
    .menu-hero .intro{
      max-width:32rem;margin:1.25rem auto 0;font-size:.95rem;line-height:1.75;
      color:rgba(42,42,42,.65);font-weight:300;
    }
    .menu-sheet{max-width:34rem;margin:0 auto;padding:0 1.5rem clamp(4rem,8vw,5rem)}
    .menu-cat{margin-bottom:clamp(3rem,6vw,4.5rem)}
    .menu-cat:last-of-type{margin-bottom:2rem}
    .menu-cat-head{
      text-align:center;margin-bottom:2rem;padding-bottom:1.25rem;
      border-bottom:1px solid rgba(7,57,84,.08);
    }
    .menu-cat-head h3{
      font-family:"Playfair Display",Georgia,serif;font-weight:400;
      font-size:clamp(1.35rem,3vw,1.65rem);color:var(--blue);letter-spacing:.02em;
    }
    .menu-cat-head .cat-note{
      font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;
      color:var(--brown);opacity:.55;margin-top:.35rem;
    }
    .menu-item{
      display:grid;grid-template-columns:1fr auto;gap:1.5rem;align-items:baseline;
      padding:1.1rem 0;border-bottom:1px solid rgba(7,57,84,.05);
    }
    .menu-item:last-child{border-bottom:none}
    .menu-item-name{
      font-family:"Playfair Display",Georgia,serif;font-size:1.05rem;
      color:var(--blue);font-weight:400;line-height:1.35;
    }
    .menu-item small{
      display:block;font-family:system-ui,sans-serif;font-size:.8rem;
      font-style:italic;color:rgba(42,42,42,.5);margin-top:.3rem;font-weight:300;
    }
    .menu-item-price{
      font-size:.88rem;color:var(--brown);font-weight:400;
      font-variant-numeric:tabular-nums;white-space:nowrap;letter-spacing:.02em;
    }
    .menu-footer{
      text-align:center;padding-top:2rem;margin-top:1rem;
      border-top:1px solid rgba(7,57,84,.06);
    }
    .menu-footer p{
      font-size:.78rem;letter-spacing:.06em;color:rgba(42,42,42,.45);
      font-style:italic;
    }
    .values{display:grid;gap:1px;background:rgba(7,57,84,.08);border-radius:1.25rem;overflow:hidden}
    @media(min-width:640px){.values{grid-template-columns:1fr 1fr}}
    .value{padding:1.65rem;background:var(--cream)}
    .value:nth-child(even){background:var(--cream-dark)}
    .value h3{font-size:1.15rem}
    .quote-block{
      text-align:center;padding:clamp(2rem,5vw,3.5rem) 0;
    }
    .quote-block p{
      font-family:"Playfair Display",Georgia,serif;font-style:italic;
      font-size:clamp(1.3rem,3vw,1.95rem);color:var(--brown);
      max-width:38rem;margin:0 auto;line-height:1.45;
    }
    .cta{
      background:linear-gradient(145deg,var(--blue-mid),var(--blue));
      color:var(--cream);border-radius:2rem;padding:clamp(2.5rem,6vw,3.5rem) 2rem;text-align:center;
      box-shadow:var(--shadow);
    }
    .cta h2{color:var(--cream);font-size:clamp(1.75rem,4vw,2.5rem)}
    .cta p{opacity:.8;margin:1rem auto 1.5rem;max-width:30rem;line-height:1.7}
    .cta .actions{display:flex;flex-wrap:wrap;justify-content:center;gap:.75rem}
    .blog-post{display:grid;gap:2rem;margin-bottom:3.5rem;padding-bottom:3.5rem;border-bottom:1px solid rgba(7,57,84,.08)}
    .blog-post:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
    @media(min-width:768px){.blog-post{grid-template-columns:1fr 1fr;align-items:center}}
    .blog-post img{
      width:100%;aspect-ratio:16/10;object-fit:cover;
      border-radius:1.5rem 2.5rem 1.5rem 2.5rem;box-shadow:var(--shadow);
    }
    .blog-post.reverse img{order:2}
    .blog-post.reverse > div{order:1}
    .steps{list-style:none;display:grid;gap:1.15rem}
    .steps li{display:flex;gap:1rem;align-items:flex-start}
    .steps .num{
      font-family:"Playfair Display",Georgia,serif;font-size:1.65rem;
      color:var(--sage);min-width:2.5rem;line-height:1;
    }
    .contact-form{
      background:#fff;border-radius:1.5rem 2.5rem 1.5rem 2.5rem;
      padding:2rem;box-shadow:var(--shadow);
    }
    .contact-form label{display:block;font-size:.85rem;font-weight:600;color:var(--blue);margin-bottom:.25rem}
    .contact-form input,.contact-form textarea{
      width:100%;margin-bottom:1.1rem;padding:.8rem 1rem;
      border:1px solid rgba(7,57,84,.12);border-radius:.75rem;font:inherit;background:var(--cream);
      transition:border-color .2s,box-shadow .2s;
    }
    .contact-form input:focus,.contact-form textarea:focus{
      outline:none;border-color:var(--sage);box-shadow:0 0 0 3px rgba(168,197,176,.35);
    }
    .contact-form textarea{min-height:120px;resize:vertical}
    .contact-info h2{font-size:1.5rem;margin-bottom:.75rem}
    .contact-info a{color:var(--blue);font-weight:500;text-decoration:underline;text-underline-offset:3px}
    .contact-info a:hover{color:var(--blue-mid)}
    .social-links{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.25rem}
    .social-links a{
      display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1rem;
      border:1px solid rgba(246,245,239,.2);border-radius:999px;font-size:.85rem;
      transition:background .2s,border-color .2s;
    }
    .social-links a:hover{background:rgba(168,197,176,.15);border-color:var(--sage);color:var(--sage)}
    footer{background:var(--blue);color:var(--cream);padding:3.5rem 0 2rem;margin-top:auto}
    footer .wrap{display:grid;gap:2.5rem}
    @media(min-width:768px){footer .wrap{grid-template-columns:1.2fr 1fr 1fr}}
    footer a:hover{color:var(--sage)}
    .footer-brand .tagline{
      font-family:"Playfair Display",Georgia,serif;font-style:italic;
      font-size:1.65rem;color:var(--sage);margin-top:.75rem;
    }
    .footer-nav{display:flex;flex-direction:column;gap:.45rem;font-size:.9rem}
    .footer-bottom{
      grid-column:1/-1;margin-top:1.5rem;padding-top:1.5rem;
      border-top:1px solid rgba(246,245,239,.1);font-size:.78rem;opacity:.55;
      display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.75rem;
    }
    .footer-bottom a.admin-link{opacity:.7;font-size:.72rem}
    .footer-bottom a.admin-link:hover{opacity:1;color:var(--sage)}
    .section-actions{margin-top:1.75rem}
    .text-link{color:var(--blue);font-weight:600;text-decoration:underline;text-underline-offset:4px}
    .text-link:hover{color:var(--blue-mid)}
    .note{text-align:center;font-size:.85rem;opacity:.6;margin-top:2rem}
    .wa-float{
      position:fixed;bottom:1.5rem;right:1.5rem;z-index:90;
      width:3.5rem;height:3.5rem;border-radius:50%;
      background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;
      box-shadow:0 8px 28px rgba(27,177,117,.45);transition:transform .2s,box-shadow .2s;
    }
    .wa-float:hover{transform:scale(1.08);box-shadow:0 12px 36px rgba(27,177,117,.55)}
    .wa-float svg{width:1.65rem;height:1.65rem;fill:currentColor}
    .wa-float span{
      position:absolute;right:calc(100% + .65rem);white-space:nowrap;
      background:var(--charcoal);color:#fff;font-size:.75rem;font-weight:600;
      padding:.4rem .75rem;border-radius:.5rem;opacity:0;pointer-events:none;
      transition:opacity .2s;
    }
    .wa-float:hover span{opacity:1}
    @media(max-width:900px){
      .nav-toggle{display:block}
      nav.site-nav{
        display:none;position:absolute;top:100%;left:0;right:0;
        flex-direction:column;align-items:stretch;padding:1rem 1.5rem 1.25rem;
        background:rgba(7,57,84,.98);border-bottom:1px solid rgba(168,197,176,.12);
      }
      nav.site-nav.open{display:flex}
      nav.site-nav .nav-cta{margin-top:.75rem;padding-top:.75rem!important;border-top:1px solid rgba(168,197,176,.12)}
      header .wrap{position:relative;flex-wrap:wrap}
    }
    @media(prefers-reduced-motion:reduce){
      .marquee-track{animation:none}
      .card,.product,.btn,.wa-float{transition:none}
    }
  `;
}

function siteScripts() {
  return `
    (function(){
      var t=document.getElementById('nav-toggle');
      var n=document.getElementById('site-nav');
      if(t&&n){
        t.addEventListener('click',function(){n.classList.toggle('open');});
        n.querySelectorAll('a').forEach(function(a){
          a.addEventListener('click',function(){n.classList.remove('open');});
        });
      }
    })();
  `;
}

function whatsappFloat(whatsapp) {
  return `
  <a class="wa-float" href="https://wa.me/${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
    <span>¿Hablamos?</span>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>`;
}

export function shell({ title, description, depth, pageId, heroArt, body, year = new Date().getFullYear() }) {
  const site = loadSite();
  const { brand } = site;
  const { img, href } = createPathHelpers(depth);
  const heroVar = heroArt ? `--hero-art:url('${img(heroArt)}')` : `--hero-art:none`;

  const navLinks = NAV.map(
    (n) =>
      `<a href="${href(n.route)}" class="${pageId === n.id ? "active" : ""}">${n.label}</a>`
  ).join("");

  const footerNav = NAV.map((n) => `<a href="${href(n.route)}">${n.label}</a>`).join("");

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
  <style>${themeCss(site)}</style>
  <style>:root{${heroVar}}</style>
</head>
<body>
  <a class="skip-link" href="#main">Saltar al contenido</a>
  <header>
    <div class="wrap">
      <a class="logo" href="${href("/")}"><img src="${img("/images/brand/horizontal-crema.png")}" alt="${brand.name}"/></a>
      <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menú</button>
      <nav class="site-nav" id="site-nav" aria-label="Principal">
        ${navLinks}
        <a href="${href("/tienda")}" class="nav-cta">Tienda</a>
      </nav>
    </div>
  </header>
  <main id="main">${body}</main>
  <footer>
    <div class="wrap">
      <div class="footer-brand">
        <img src="${img("/images/brand/horizontal-crema.png")}" alt="${brand.name}" style="height:2.35rem"/>
        <p class="tagline">${brand.tagline}</p>
        <p style="opacity:.6;margin-top:.4rem;font-size:.9rem">${brand.descriptor}</p>
      </div>
      <div>
        <p style="font-weight:600;margin-bottom:.75rem">Visítanos</p>
        <p style="font-size:.95rem;line-height:1.75;opacity:.85">${brand.address}<br/>${brand.city}</p>
        <p style="margin-top:.65rem;font-size:.9rem;opacity:.75">${brand.hours}</p>
      </div>
      <div>
        <p style="font-weight:600;margin-bottom:.75rem">Contacto</p>
        <div class="footer-nav">
          <a href="tel:${brand.phone.replace(/\s/g, "")}">${brand.phone}</a>
          <a href="mailto:${brand.email}">${brand.email}</a>
          <a href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
        <div class="social-links">
          <a href="${brand.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="${brand.social.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} ${brand.name} · Cali, Colombia</span>
        <span>
          <a href="${href("/contacto")}">Contacto</a>
          · <a href="${href("/admin")}" class="admin-link">Administración</a>
        </span>
      </div>
    </div>
  </footer>
  ${whatsappFloat(brand.whatsapp)}
  <script>${siteScripts()}</script>
</body>
</html>`;
}

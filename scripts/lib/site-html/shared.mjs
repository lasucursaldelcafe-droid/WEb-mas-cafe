import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { brandThemeCss, fontFaces } from "./brand.mjs";
import { getNavRoutes } from "./routes.mjs";

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

export function getNav(site) {
  return getNavRoutes(site ?? loadSite()).map((r) => ({
    id: r.id,
    label: r.label,
    route: r.slug ? `/${r.slug}` : "/",
  }));
}

/** @deprecated use getNav(loadSite()) */
export const NAV = getNavRoutes(loadSite()).map((r) => ({
  id: r.id,
  label: r.label,
  route: r.slug ? `/${r.slug}` : "/",
}));

export function siteStyles() {
  return `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --green-dark:#159a63;--shadow:var(--organic-shadow);
      --radius:1.5rem;--ease:cubic-bezier(.4,0,.2,1);
      --sage-rgb:216,218,168;--brown-rgb:176,122,58;
    }
    html{scroll-behavior:smooth}
    body{
      font-family:var(--font-body);
      background:var(--cream);color:var(--charcoal);line-height:1.65;
      min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;
    }
    main{flex:1}
    img{max-width:100%;height:auto;display:block}
    a{color:inherit;text-decoration:none}
    ::selection{background:var(--sage);color:var(--blue)}
    .wrap{max-width:1140px;margin:0 auto;padding:0 1.5rem}
    .font-accent{font-family:var(--font-accent)}
    .font-display{font-family:var(--font-display)}
    .skip-link{
      position:absolute;left:-9999px;top:.5rem;z-index:200;padding:.5rem 1rem;
      background:var(--cream);color:var(--blue);border-radius:.5rem;font-weight:600;
    }
    .skip-link:focus{left:1rem}

    /* ── Header ── */
    header.site-header{
      position:fixed;inset:0 0 auto;z-index:100;
      padding:1.25rem 0;transition:background .5s var(--ease),padding .5s var(--ease),border-color .5s;
      border-bottom:1px solid transparent;
    }
    header.site-header.scrolled{
      padding:.75rem 0;
      background:rgba(246,245,239,.92);backdrop-filter:blur(20px);
      border-bottom-color:rgba(7,57,84,.08);
    }
    header.site-header:not(.scrolled):not(.inner-page){
      background:transparent;
    }
    header.site-header.inner-page:not(.scrolled){
      background:rgba(7,57,84,.92);backdrop-filter:blur(16px);
      border-bottom-color:rgba(216,218,168,.08);
    }
    header .wrap{display:flex;align-items:center;justify-content:space-between;gap:2rem}
    .logo{position:relative;display:block;height:2.25rem}
    .logo img{height:2.25rem;width:auto;transition:opacity .3s}
    .logo .logo-azul{display:none}
    header.scrolled .logo .logo-crema{display:none}
    header.scrolled .logo .logo-azul{display:block}
    .nav-toggle{
      display:none;background:transparent;border:1px solid rgba(246,245,239,.3);
      color:rgba(246,245,239,.85);width:2.75rem;height:2.75rem;border-radius:50%;
      font-size:1.1rem;cursor:pointer;transition:border-color .3s,color .3s;
    }
    header.scrolled .nav-toggle,header.inner-page .nav-toggle{
      border-color:rgba(7,57,84,.15);color:var(--blue);
    }
    nav.site-nav{display:flex;align-items:center;gap:clamp(1rem,2.5vw,2rem)}
    nav.site-nav a{
      font-size:.82rem;font-weight:500;letter-spacing:.02em;
      padding:0;position:relative;transition:color .3s;
    }
    header:not(.scrolled):not(.inner-page) nav.site-nav a{color:rgba(246,245,239,.88)}
    header:not(.scrolled):not(.inner-page) nav.site-nav a:hover{color:var(--sage)}
    header.scrolled nav.site-nav a,header.inner-page.scrolled nav.site-nav a{color:rgba(43,43,43,.8)}
    header.scrolled nav.site-nav a:hover,header.inner-page.scrolled nav.site-nav a:hover{color:var(--blue)}
    header.inner-page:not(.scrolled) nav.site-nav a{color:rgba(246,245,239,.85)}
    header.inner-page:not(.scrolled) nav.site-nav a:hover{color:var(--sage)}
    nav.site-nav a.active{font-weight:600}
    header.scrolled nav.site-nav a.active,header.inner-page nav.site-nav a.active{color:var(--blue)}
    header:not(.scrolled):not(.inner-page) nav.site-nav a.active{color:var(--cream)}
    .nav-cta{
      font-size:.78rem;font-weight:700;letter-spacing:.04em;
      padding:.55rem 1.35rem!important;border-radius:999px;transition:background .3s,color .3s;
    }
    header:not(.scrolled):not(.inner-page) .nav-cta{background:var(--sage);color:var(--blue)}
    header:not(.scrolled):not(.inner-page) .nav-cta:hover{background:var(--cream)}
    header.scrolled .nav-cta,header.inner-page.scrolled .nav-cta{background:var(--blue);color:var(--cream)}
    header.scrolled .nav-cta:hover,header.inner-page.scrolled .nav-cta:hover{background:var(--blue-mid)}
    header.inner-page:not(.scrolled) .nav-cta{background:var(--sage);color:var(--blue)}
    header.inner-page:not(.scrolled) .nav-cta:hover{background:var(--cream)}

    /* ── Buttons ── */
    .btn{
      display:inline-flex;align-items:center;justify-content:center;gap:.4rem;
      padding:.65rem 1.45rem;border-radius:999px;font-size:.8125rem;font-weight:600;
      border:none;cursor:pointer;transition:transform .15s var(--ease),background .2s,box-shadow .2s;
    }
    .btn:hover{transform:translateY(-1px)}
    .btn-sage{background:var(--sage);color:var(--blue)}
    .btn-sage:hover{background:var(--cream);box-shadow:0 8px 24px rgba(var(--sage-rgb),.4)}
    .btn-outline{border:1px solid rgba(246,245,239,.3);color:var(--cream);background:transparent}
    .btn-outline:hover{background:rgba(246,245,239,.1)}
    .btn-blue{background:var(--blue);color:var(--cream)}
    .btn-blue:hover{background:var(--blue-mid);box-shadow:0 8px 24px rgba(7,57,84,.25)}
    .btn-green{background:var(--green);color:#fff}
    .btn-green:hover{background:var(--green-dark)}

    /* ── Hero inicio ── */
    .editorial-hero{
      position:relative;background:var(--blue);color:var(--cream);
      overflow:hidden;padding:clamp(5.5rem,10vw,6.5rem) 0 clamp(2.5rem,5vw,3.5rem);
    }
    .editorial-hero .wrap.hero-grid{
      display:grid;gap:2rem;align-items:center;
    }
    @media(min-width:900px){
      .editorial-hero .wrap.hero-grid{grid-template-columns:1fr min(42%,380px);gap:2.5rem}
    }
    .editorial-hero .decor{
      position:absolute;pointer-events:none;opacity:.08;
    }
    .editorial-hero .decor-1{right:0;top:3rem;width:10rem;height:10rem}
    .editorial-hero .decor-2{left:0;bottom:2rem;width:8rem;height:8rem}
    .editorial-hero .hero-art{position:relative;z-index:1;max-width:360px;margin:0 auto}
    .editorial-hero .hero-art-main img{width:100%;height:auto;max-height:280px;object-fit:contain}
    .editorial-hero .hero-art-secondary{display:none}
    .editorial-hero .hero-content{position:relative;z-index:2;max-width:36rem}
    .editorial-hero .tagline{
      font-family:var(--font-accent);
      font-size:clamp(1.35rem,3vw,1.85rem);color:var(--sage);line-height:1.2;
    }
    .editorial-hero h1{
      font-family:var(--font-display);
      font-size:clamp(1.85rem,4.5vw,2.75rem);line-height:1.08;margin-top:.75rem;
      letter-spacing:-.01em;
    }
    .editorial-hero .subhead{margin-top:.85rem;max-width:28rem;opacity:.8;font-size:.95rem;line-height:1.65}
    .editorial-hero .descriptor{
      margin-top:.5rem;font-size:.68rem;text-transform:uppercase;letter-spacing:.2em;opacity:.5;
    }
    .editorial-hero .actions{margin-top:1.35rem;display:flex;flex-wrap:wrap;gap:.6rem}
    .editorial-hero .brand-note{
      margin-top:1.75rem;display:flex;align-items:center;gap:.85rem;
    }
    .editorial-hero .brand-note img{width:2.5rem;height:2.5rem;opacity:.75}
    .editorial-hero .brand-note p{font-size:.78rem;line-height:1.55;opacity:.55;max-width:14rem}

    /* ── Page heroes ── */
    .page-hero{
      background:linear-gradient(160deg,var(--blue),var(--blue-mid));
      color:var(--cream);padding:clamp(5.25rem,9vw,6rem) 0 clamp(1.75rem,4vw,2.5rem);
      position:relative;overflow:hidden;margin-top:0;
    }
    .page-hero::after{
      content:"";position:absolute;right:-5%;bottom:0;width:38%;height:70%;
      background:var(--hero-art) right bottom/contain no-repeat;opacity:.28;pointer-events:none;
    }
    .page-hero .inner{position:relative;z-index:1;max-width:36rem}
    .page-hero.light{background:linear-gradient(180deg,rgba(var(--sage-rgb),.35),rgba(var(--sage-rgb),.12));color:var(--blue)}
    .page-hero.light::after{display:none}
    .page-hero h1{
      font-family:var(--font-display);
      font-size:clamp(1.65rem,3.5vw,2.25rem);line-height:1.12;margin-top:.5rem;
    }
    .page-hero .tagline{
      font-family:var(--font-accent);
      font-size:clamp(1.1rem,2.5vw,1.45rem);color:var(--sage);
    }
    .page-hero.light .tagline{color:var(--brown)}

    /* ── Marquee ── */
    .marquee{
      background:rgba(var(--sage-rgb),.3);border-block:1px solid rgba(7,57,84,.08);
      padding:1.1rem 0;overflow:hidden;
    }
    .marquee-track{
      display:flex;align-items:center;width:max-content;gap:3rem;
      animation:marquee 40s linear infinite;
    }
    .marquee:hover .marquee-track{animation-play-state:paused}
    .marquee-item{
      flex-shrink:0;display:flex;align-items:center;gap:3rem;
      font-size:.78rem;text-transform:uppercase;letter-spacing:.22em;
      color:rgba(7,57,84,.65);white-space:nowrap;font-weight:500;
    }
    .marquee-dot{
      display:inline-block;width:.5rem;height:.5rem;border-radius:50%;
      background:var(--brown);flex-shrink:0;
    }
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes float-soft{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    .float-soft{animation:float-soft 6s ease-in-out infinite}

    /* ── Sections ── */
    section{padding:clamp(2.5rem,5vw,3.5rem) 0}
    section.alt{background:rgba(var(--sage-rgb),.18)}
    section.dark{background:var(--blue);color:var(--cream)}
    section.dark h2{color:var(--cream)}
    section.dark .label{color:var(--sage)}
    h2{
      font-family:var(--font-display);
      font-size:clamp(1.45rem,3vw,2rem);color:var(--blue);line-height:1.15;
    }
    h3{font-family:var(--font-display);color:var(--blue);font-size:1.35rem}
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
    .product-img{background:rgba(var(--sage-rgb),.15);border-radius:1rem;padding:1.25rem;margin-bottom:1rem}
    .product-img img{max-height:170px;margin:0 auto;object-fit:contain}
    .badge{
      display:inline-block;font-size:.7rem;font-weight:600;
      background:var(--green);color:#fff;padding:.25rem .75rem;border-radius:999px;margin-top:.5rem;
    }

    /* ── Menu page ── */
    .menu-page{background:var(--cream)}
    .menu-hero{
      text-align:center;padding:clamp(5rem,9vw,6rem) 0 clamp(1.5rem,4vw,2rem);
      background:var(--cream);color:var(--blue);
    }
    .menu-hero .soul{
      font-family:var(--font-accent);
      font-size:clamp(1.35rem,3vw,1.75rem);color:var(--brown);margin-bottom:.5rem;
    }
    .menu-hero h1{
      font-family:var(--font-display);font-weight:400;
      font-size:clamp(1.35rem,3vw,1.85rem);line-height:1.2;color:var(--blue);
    }
    .menu-hero .intro{
      max-width:32rem;margin:1.25rem auto 0;font-size:.95rem;line-height:1.75;
      color:rgba(43,43,43,.65);font-weight:400;
    }
    .menu-sheet{max-width:34rem;margin:0 auto;padding:0 1.5rem clamp(4rem,8vw,5rem)}
    .menu-cat{margin-bottom:clamp(3rem,6vw,4.5rem)}
    .menu-cat:last-of-type{margin-bottom:2rem}
    .menu-cat-head{
      text-align:center;margin-bottom:2rem;padding-bottom:1.25rem;
      border-bottom:1px solid rgba(7,57,84,.08);
    }
    .menu-cat-head h3{
      font-family:var(--font-display);font-weight:400;
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
      font-family:var(--font-display);font-size:1.05rem;
      color:var(--blue);font-weight:400;line-height:1.35;
    }
    .menu-item small{
      display:block;font-family:var(--font-body);font-size:.8rem;
      font-style:italic;color:rgba(43,43,43,.5);margin-top:.3rem;font-weight:400;
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
      font-size:.78rem;letter-spacing:.06em;color:rgba(43,43,43,.45);font-style:italic;
    }

    /* ── Values & quote ── */
    .values{display:grid;gap:1px;background:rgba(7,57,84,.08);border-radius:1.25rem;overflow:hidden}
    @media(min-width:640px){.values{grid-template-columns:1fr 1fr}}
    .value{padding:1.65rem;background:var(--cream)}
    .value:nth-child(even){background:var(--cream-dark)}
    .value h3{font-size:1.15rem}
    .quote-block{text-align:center;padding:clamp(2rem,5vw,3.5rem) 0}
    .quote-block p{
      font-family:var(--font-accent);
      font-size:clamp(1.4rem,3.5vw,2rem);color:var(--brown);
      max-width:38rem;margin:0 auto;line-height:1.45;
    }

    /* ── CTA band ── */
    .cta{
      background:linear-gradient(145deg,var(--blue-mid),var(--blue));
      color:var(--cream);border-radius:2rem;padding:clamp(2.5rem,6vw,3.5rem) 2rem;text-align:center;
      box-shadow:var(--shadow);
    }
    .cta h2{color:var(--cream);font-size:clamp(1.75rem,4vw,2.5rem)}
    .cta .cta-tagline{
      font-family:var(--font-accent);font-size:clamp(1.4rem,3vw,1.85rem);
      color:var(--sage);margin-bottom:.5rem;
    }
    .cta p{opacity:.8;margin:1rem auto 1.5rem;max-width:30rem;line-height:1.7}
    .cta .actions{display:flex;flex-wrap:wrap;justify-content:center;gap:.75rem}

    /* ── Blog & contact ── */
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
      font-family:var(--font-display);font-size:1.65rem;
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
      outline:none;border-color:var(--sage);box-shadow:0 0 0 3px rgba(var(--sage-rgb),.35);
    }
    .contact-form textarea{min-height:120px;resize:vertical}
    .contact-info h2{font-size:1.5rem;margin-bottom:.75rem}
    .contact-info a{color:var(--blue);font-weight:500;text-decoration:underline;text-underline-offset:3px}
    .contact-info a:hover{color:var(--blue-mid)}
    .social-links{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.25rem}
    .social-links a{
      display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1rem;
      border:1px solid rgba(7,57,84,.12);border-radius:999px;font-size:.85rem;
      transition:background .2s,border-color .2s;
    }
    .social-links a:hover{background:rgba(var(--sage-rgb),.2);border-color:var(--sage);color:var(--blue)}

    /* ── Footer ── */
    footer{background:var(--blue);color:var(--cream);padding:3.5rem 0 2rem;margin-top:auto}
    footer .wrap{display:grid;gap:2.5rem}
    @media(min-width:768px){footer .wrap{grid-template-columns:1.2fr 1fr 1fr}}
    footer a:hover{color:var(--sage)}
    .footer-brand .tagline{
      font-family:var(--font-accent);
      font-size:1.75rem;color:var(--sage);margin-top:.75rem;
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

    /* ── WhatsApp float ── */
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

    /* ── Mobile nav overlay ── */
    .nav-overlay{
      display:none;position:fixed;inset:0;z-index:99;
      background:rgba(7,57,84,.96);backdrop-filter:blur(8px);
      flex-direction:column;align-items:center;justify-content:center;gap:2rem;
      padding-top:5rem;
    }
    .nav-overlay.open{display:flex}
    .nav-overlay a{
      font-family:var(--font-display);font-size:clamp(1.75rem,5vw,2.25rem);
      color:var(--cream);transition:color .3s;
    }
    .nav-overlay a:hover{color:var(--sage)}
    .nav-overlay .nav-cta-overlay{
      margin-top:1rem;padding:.85rem 2rem;border-radius:999px;
      background:var(--sage);color:var(--blue);font-family:var(--font-body);
      font-size:.9rem;font-weight:700;
    }

    @media(max-width:900px){
      .nav-toggle{display:flex;align-items:center;justify-content:center}
      nav.site-nav{display:none}
    }
    @media(prefers-reduced-motion:reduce){
      .marquee-track,.float-soft{animation:none}
      .card,.product,.btn,.wa-float{transition:none}
    }
  `;
}

function siteScripts(isHome) {
  return `
    (function(){
      var header=document.getElementById('site-header');
      var toggle=document.getElementById('nav-toggle');
      var overlay=document.getElementById('nav-overlay');
      var isHome=${isHome ? "true" : "false"};

      function onScroll(){
        if(!header)return;
        if(window.scrollY>40)header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }
      window.addEventListener('scroll',onScroll,{passive:true});
      onScroll();

      if(toggle&&overlay){
        toggle.addEventListener('click',function(){
          var open=overlay.classList.toggle('open');
          toggle.setAttribute('aria-expanded',open);
          toggle.textContent=open?'×':'☰';
          document.body.style.overflow=open?'hidden':'';
        });
        overlay.querySelectorAll('a').forEach(function(a){
          a.addEventListener('click',function(){
            overlay.classList.remove('open');
            toggle.setAttribute('aria-expanded','false');
            toggle.textContent='☰';
            document.body.style.overflow='';
          });
        });
      }

      function trackClick(type){
        try{
          var p=JSON.parse(localStorage.getItem('mc_clicks_pending')||'{}');
          p[type]=(p[type]||0)+1;
          localStorage.setItem('mc_clicks_pending',JSON.stringify(p));
        }catch(e){}
      }
      document.querySelectorAll('[data-track]').forEach(function(el){
        el.addEventListener('click',function(){trackClick(el.getAttribute('data-track'));});
      });
      var wa=document.querySelector('.wa-float');
      if(wa)wa.addEventListener('click',function(){trackClick('whatsapp');});
    })();
  `;
}

function whatsappFloat(whatsapp) {
  return `
  <a class="wa-float" href="https://wa.me/${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp" data-track="whatsapp">
    <span>¿Hablamos?</span>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>`;
}

export function shell({ title, description, depth, pageId, heroArt, body, year = new Date().getFullYear() }) {
  const site = loadSite();
  const { brand } = site;
  const nav = getNav(site);
  const { img, href } = createPathHelpers(depth);
  const heroVar = heroArt ? `--hero-art:url('${img(heroArt)}')` : `--hero-art:none`;
  const isHome = pageId === "home";

  const navLinks = nav
    .map(
      (n) =>
        `<a href="${href(n.route)}" class="${pageId === n.id ? "active" : ""}">${n.label}</a>`
    )
    .join("");

  const overlayLinks = nav.map((n) => `<a href="${href(n.route)}">${n.label}</a>`).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="theme-color" content="#073954"/>
  <title>${title} | ${brand.name}</title>
  <meta name="description" content="${description}"/>
  <style>${fontFaces(depth)}</style>
  <style>${brandThemeCss(site)}</style>
  <style>${siteStyles()}</style>
  <style>:root{${heroVar}}</style>
</head>
<body>
  <a class="skip-link" href="#main">Saltar al contenido</a>
  <header class="site-header${isHome ? "" : " inner-page"}" id="site-header">
    <div class="wrap">
      <a class="logo" href="${href("/")}">
        <img class="logo-crema" src="${img("/images/brand/horizontal-crema.png")}" alt="${brand.name}"/>
        <img class="logo-azul" src="${img("/images/brand/horizontal-azul.png")}" alt="${brand.name}"/>
      </a>
      <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-overlay">☰</button>
      <nav class="site-nav" id="site-nav" aria-label="Principal">
        ${navLinks}
        <a href="${href("/tienda")}" class="nav-cta">Comprar café</a>
      </nav>
    </div>
  </header>
  <div class="nav-overlay" id="nav-overlay" role="dialog" aria-modal="true" aria-label="Menú de navegación">
    ${overlayLinks}
    <a href="${href("/tienda")}" class="nav-cta-overlay">Comprar café</a>
  </div>
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
          <a href="${brand.social.instagram}" target="_blank" rel="noopener noreferrer" data-track="instagram">Instagram</a>
          <a href="${brand.social.facebook}" target="_blank" rel="noopener noreferrer" data-track="facebook">Facebook</a>
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
  <script>${siteScripts(isHome)}</script>
</body>
</html>`;
}

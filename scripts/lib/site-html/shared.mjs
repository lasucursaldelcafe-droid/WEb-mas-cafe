import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { brandThemeCss, fontFaces } from "./brand.mjs";
import { getNavRoutes } from "./routes.mjs";
import { formatPageTitle, seoHead, escapeMeta, loadSeoSettings } from "../seo.mjs";
import { brandAssetPath } from "../brand-logo.mjs";
import {
  getGoogleAnalyticsId,
  googleAnalyticsHead,
  siteAnalyticsScript,
  normalizeAnalytics,
} from "../analytics.mjs";

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

export function mapsUrl(brand) {
  const query = [brand?.address, brand?.city].filter(Boolean).join(", ");
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

export function addressLinkHtml(brand, { className = "address-link", suffix = "" } = {}) {
  const cityLine = brand?.city ? `<br/>${brand.city}` : "";
  return `<a class="${className}" href="${mapsUrl(brand)}" target="_blank" rel="noopener noreferrer" data-track="maps">${brand.address}${cityLine}${suffix}</a>`;
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
    asset: (file) => `${up}${file.replace(/^\//, "")}`,
  };
}

/** Iconos de pestaña (favicon) — rutas relativas según profundidad de página */
export function faviconHead(depth) {
  const { asset } = createPathHelpers(depth);
  return `
  <link rel="icon" href="${asset("favicon.ico")}" sizes="any"/>
  <link rel="icon" type="image/png" sizes="32x32" href="${asset("favicon-32x32.png")}"/>
  <link rel="icon" type="image/png" sizes="16x16" href="${asset("favicon-16x16.png")}"/>
  <link rel="apple-touch-icon" sizes="180x180" href="${asset("apple-touch-icon.png")}"/>
  <link rel="manifest" href="${asset("site.webmanifest")}"/>`;
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
      --text-hover-duration:.4s;
      --text-hover-ease:cubic-bezier(.22,1,.36,1);
      --page-ease:cubic-bezier(.22,1,.36,1);
      --page-duration:.42s;
    }
    html{scroll-behavior:smooth}
    body{
      font-family:var(--font-body);
      background:var(--cream);color:var(--charcoal);line-height:1.65;
      min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;
    }
    main{flex:1}
    #main.page-content{
      animation:page-enter var(--page-duration) var(--page-ease) both;
    }
    html.vt-nav #main.page-content{animation:none}
    body.page-leaving{
      opacity:0;
      pointer-events:none;
      transition:opacity calc(var(--page-duration) * .75) var(--page-ease);
    }
    body.page-leaving #main.page-content{
      transform:translateY(10px);
      opacity:0;
      transition:
        opacity calc(var(--page-duration) * .75) var(--page-ease),
        transform calc(var(--page-duration) * .75) var(--page-ease);
    }
    @keyframes page-enter{
      from{opacity:0;transform:translateY(14px)}
      to{opacity:1;transform:translateY(0)}
    }
    @view-transition{navigation:auto}
    ::view-transition-old(root){
      animation:page-exit calc(var(--page-duration) * .7) var(--page-ease) both;
    }
    ::view-transition-new(root){
      animation:page-enter var(--page-duration) var(--page-ease) both;
    }
    @keyframes page-exit{
      from{opacity:1;transform:translateY(0)}
      to{opacity:0;transform:translateY(-8px)}
    }
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
      padding:0;position:relative;display:inline-block;
      transition:color .3s,transform var(--text-hover-duration) var(--text-hover-ease),letter-spacing var(--text-hover-duration) var(--text-hover-ease);
    }
    header:not(.scrolled):not(.inner-page) nav.site-nav a:not(.nav-cta){color:rgba(246,245,239,.88)}
    header:not(.scrolled):not(.inner-page) nav.site-nav a:not(.nav-cta):hover{color:var(--sage);transform:translateY(-2px)}
    header.scrolled nav.site-nav a:not(.nav-cta),header.inner-page.scrolled nav.site-nav a:not(.nav-cta){color:rgba(43,43,43,.8)}
    header.scrolled nav.site-nav a:not(.nav-cta):hover,header.inner-page.scrolled nav.site-nav a:not(.nav-cta):hover{color:var(--blue);transform:translateY(-2px)}
    header.inner-page:not(.scrolled) nav.site-nav a:not(.nav-cta){color:rgba(246,245,239,.85)}
    header.inner-page:not(.scrolled) nav.site-nav a:not(.nav-cta):hover{color:var(--sage);transform:translateY(-2px)}
    nav.site-nav a.active{font-weight:600}
    header.scrolled nav.site-nav a.active,header.inner-page nav.site-nav a.active{color:var(--blue)}
    header:not(.scrolled):not(.inner-page) nav.site-nav a.active{color:var(--cream)}
    nav.site-nav a.nav-cta{
      font-size:.78rem;font-weight:700;letter-spacing:.04em;
      padding:.55rem 1.35rem!important;border-radius:999px;transition:background .3s,color .3s;
    }
    header:not(.scrolled):not(.inner-page) nav.site-nav a.nav-cta{background:var(--sage);color:var(--blue)}
    header:not(.scrolled):not(.inner-page) nav.site-nav a.nav-cta:hover{background:var(--cream);color:var(--blue)}
    header.scrolled nav.site-nav a.nav-cta,header.inner-page.scrolled nav.site-nav a.nav-cta{background:var(--blue);color:var(--cream)}
    header.scrolled nav.site-nav a.nav-cta:hover,header.inner-page.scrolled nav.site-nav a.nav-cta:hover{background:var(--blue-mid);color:var(--cream)}
    header.inner-page:not(.scrolled) nav.site-nav a.nav-cta{background:var(--sage);color:var(--blue)}
    header.inner-page:not(.scrolled) nav.site-nav a.nav-cta:hover{background:var(--cream);color:var(--blue)}

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
      min-height:min(88vh,720px);display:flex;align-items:flex-end;
    }
    .editorial-hero .hero-art-bg{
      position:absolute;inset:0;z-index:0;pointer-events:none;
      display:flex;align-items:flex-end;justify-content:flex-end;
      padding:0 0 8% 0;
    }
    .editorial-hero .hero-art-bg img{
      width:min(52vw,460px);height:auto;max-height:78%;
      object-fit:contain;object-position:right bottom;
      opacity:.2;
    }
    .editorial-hero .hero-content-wrap{
      position:relative;z-index:2;width:100%;
    }
    .editorial-hero .decor{
      position:absolute;pointer-events:none;opacity:.08;z-index:1;
    }
    .editorial-hero .decor-1{right:0;top:3rem;width:10rem;height:10rem}
    .editorial-hero .decor-2{left:0;bottom:2rem;width:8rem;height:8rem}
    .editorial-hero .hero-content{position:relative;z-index:2;max-width:38rem}
    .editorial-hero .tagline{
      font-family:var(--font-accent);
      font-size:clamp(1.5rem,3.2vw,2.1rem);color:var(--sage);line-height:1.15;
    }
    .editorial-hero h1{
      font-family:var(--font-display);
      font-size:clamp(2.1rem,5.5vw,3.35rem);line-height:1.05;margin-top:.65rem;
      letter-spacing:-.015em;font-weight:500;
      text-shadow:0 2px 28px rgba(7,57,84,.35);
    }
    .editorial-hero .subhead{margin-top:.85rem;max-width:28rem;opacity:.82;font-size:clamp(.92rem,1.6vw,1.02rem);line-height:1.65}
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
    .page-hero.light{background:linear-gradient(180deg,var(--cream-dark),var(--cream));color:var(--blue)}
    .page-hero.light::after{display:none}
    .page-hero h1{
      font-family:var(--font-display);
      font-size:clamp(1.85rem,4vw,2.65rem);line-height:1.08;margin-top:.5rem;
      font-weight:500;
    }
    .page-hero .tagline{
      font-family:var(--font-accent);
      font-size:clamp(1.2rem,2.8vw,1.65rem);color:var(--sage);
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

    /* ── Section heads (estilo editorial) ── */
    .section-head{margin-bottom:clamp(1.35rem,3.5vw,2.25rem)}
    .section-title{
      font-family:var(--font-display);
      font-size:clamp(1.85rem,4.2vw,2.65rem);
      line-height:1.06;font-weight:500;letter-spacing:.015em;
      color:var(--blue);
    }
    section.dark .section-title{color:var(--cream)}
    .section-intro{
      margin-top:.7rem;max-width:34rem;font-size:.92rem;line-height:1.7;opacity:.72;
    }
    .section-actions{margin-top:clamp(1.5rem,3vw,2rem)}
    .exp-list,.post-list{display:grid;gap:clamp(1.5rem,3vw,2.5rem)}

    /* ── Sections ── */
    section{padding:clamp(2.5rem,5vw,3.5rem) 0}
    section.alt{background:var(--cream-dark)}
    section.dark{background:var(--blue);color:var(--cream)}
    section.dark h2{color:var(--cream)}
    section.dark .label{color:var(--sage)}
    h2{
      font-family:var(--font-display);
      font-size:clamp(1.65rem,3.5vw,2.35rem);color:var(--blue);line-height:1.12;
      font-weight:500;
    }
    h3{font-family:var(--font-display);color:var(--blue);font-size:1.45rem;font-weight:500}
    .label{
      font-size:.68rem;text-transform:uppercase;letter-spacing:.22em;
      color:var(--brown);margin-bottom:.55rem;font-weight:600;
    }
    .grid-2{display:grid;gap:2.5rem}
    @media(min-width:768px){.grid-2{grid-template-columns:1fr 1fr;align-items:center}}
    .card{
      background:var(--cream-dark);border:1px solid rgba(7,57,84,.06);
      border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);
      transition:transform .25s var(--ease),box-shadow .25s;
    }
    .card:hover{transform:translateY(-3px);box-shadow:0 28px 60px rgba(7,57,84,.12)}
    .card img{width:100%;aspect-ratio:4/5;object-fit:cover}
    .card-body{padding:1.65rem}
    .card-post{overflow:hidden}
    .card-post-media{width:100%;aspect-ratio:16/10;object-fit:cover;display:block}
    .post-title{
      font-family:var(--font-display);font-size:1.35rem;line-height:1.15;
      color:var(--blue);font-weight:500;margin-top:.25rem;
    }
    .post-excerpt{margin-top:.65rem;font-size:.88rem;line-height:1.65;opacity:.72}
    @media(min-width:768px){
      .card-post{display:grid;grid-template-columns:1fr 1fr;align-items:stretch}
      .card-post-media{aspect-ratio:auto;min-height:100%;object-fit:cover}
      .post-title{font-size:1.5rem}
    }
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
    .product h3{font-size:1.35rem;margin:.35rem 0 .25rem;color:var(--cream);line-height:1.2;font-weight:500}
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
      font-size:clamp(1.45rem,3.2vw,1.95rem);color:var(--brown);margin-bottom:.5rem;
    }
    .menu-hero h1{
      font-family:var(--font-display);font-weight:500;
      font-size:clamp(1.55rem,3.5vw,2.15rem);line-height:1.15;color:var(--blue);
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
      font-family:var(--font-display);font-weight:500;
      font-size:clamp(1.4rem,3vw,1.75rem);color:var(--blue);letter-spacing:.02em;
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
      font-family:var(--font-display);font-size:1.08rem;
      color:var(--blue);font-weight:500;line-height:1.35;
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
      background:var(--cream-dark);border:1px solid rgba(7,57,84,.08);
      border-radius:1.5rem 2.5rem 1.5rem 2.5rem;
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
    .contact-info a{color:var(--blue);font-weight:500;text-decoration:underline;text-underline-offset:3px;display:inline-block;transition:transform var(--text-hover-duration) var(--text-hover-ease),color .25s var(--ease)}
    .contact-info a:hover{color:var(--blue-mid);transform:translateY(-2px)}
    .social-links{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.25rem}
    .social-links a{
      display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1rem;
      border:1px solid rgba(7,57,84,.12);border-radius:999px;font-size:.85rem;
      transition:background .2s,border-color .2s,transform var(--text-hover-duration) var(--text-hover-ease);
    }
    .social-links a:hover{background:rgba(var(--sage-rgb),.2);border-color:var(--sage);color:var(--blue);transform:translateY(-2px)}

    .address-link{
      display:inline-block;text-decoration:none;color:inherit;
      transition:
        color .25s var(--ease),
        transform var(--text-hover-duration) var(--text-hover-ease),
        letter-spacing var(--text-hover-duration) var(--text-hover-ease);
    }
    .address-link:hover{
      text-decoration:underline;text-underline-offset:.2em;
      transform:translateY(-2px);
    }
    .address-link--on-dark{color:rgba(246,245,239,.88)}
    .address-link--on-dark:hover{color:var(--sage)}
    footer .address-link{color:rgba(246,245,239,.85)}
    footer .address-link:hover{color:var(--sage)}
    .cta .address-link{color:rgba(246,245,239,.9)}
    .cta .address-link:hover{color:var(--sage)}
    .contact-info .address-link{color:var(--blue);font-weight:500}
    .contact-info .address-link:hover{color:var(--blue-mid)}

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
    .footer-nav a{
      display:inline-block;
      transition:transform var(--text-hover-duration) var(--text-hover-ease),color .25s var(--ease);
    }
    .footer-nav a:hover{transform:translateY(-2px)}
    .footer-bottom{
      grid-column:1/-1;margin-top:1.5rem;padding-top:1.5rem;
      border-top:1px solid rgba(246,245,239,.1);font-size:.78rem;opacity:.55;
      display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.75rem;
    }
    .footer-bottom a.admin-link{opacity:.7;font-size:.72rem}
    .footer-bottom a.admin-link:hover{opacity:1;color:var(--sage)}
    .section-actions{margin-top:1.75rem}
    .text-link{color:var(--blue);font-weight:600;text-decoration:underline;text-underline-offset:4px;display:inline-block}
    .text-link:hover{color:var(--blue-mid);transform:translateY(-2px)}
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

    /* ── Mobile nav (lista compacta, no pantalla completa) ── */
    .nav-backdrop{
      display:none;position:fixed;inset:0;z-index:98;
      background:rgba(7,57,84,.28);backdrop-filter:blur(2px);
    }
    body.nav-open .nav-backdrop{display:block}
    .nav-overlay{
      display:none;position:fixed;left:0;right:0;z-index:99;
      top:3.85rem;
      background:var(--cream);
      border-bottom:1px solid rgba(7,57,84,.1);
      box-shadow:0 14px 36px rgba(7,57,84,.12);
      padding:.35rem 1.1rem 1rem;
      max-height:min(72vh,480px);
      overflow-y:auto;
    }
    .nav-overlay.open{display:block}
    .nav-overlay a{
      display:flex;align-items:center;justify-content:space-between;gap:.75rem;
      font-family:var(--font-body);font-size:.9rem;font-weight:500;
      color:var(--blue);padding:.72rem 0;
      border-bottom:1px solid rgba(7,57,84,.07);
      transition:transform var(--text-hover-duration) var(--text-hover-ease),color .25s var(--ease);
    }
    .nav-overlay a::after{content:"→";opacity:.35;font-size:.75rem;font-weight:400}
    .nav-overlay a:hover{color:var(--blue-mid);transform:translateX(4px)}
    .nav-overlay .nav-cta-overlay{
      display:inline-flex;margin-top:.65rem;padding:.6rem 1.15rem;
      border-radius:999px;background:var(--sage);color:var(--blue);
      font-family:var(--font-body);font-size:.8rem;font-weight:700;
    }
    .nav-overlay .nav-cta-overlay::after{display:none}

    @media(max-width:900px){
      .nav-toggle{display:flex;align-items:center;justify-content:center}
      nav.site-nav{display:none}
    }

    /* ── Móvil (≤767px) — editorial tipo Pergamino: títulos primero ── */
    @media(max-width:767px){
      .wrap{padding:0 1.15rem}
      header.site-header{padding:.85rem 0}
      header.site-header.scrolled{padding:.55rem 0}
      .logo,.logo img{height:1.85rem}
      header .wrap{gap:1rem}

      .editorial-hero{
        min-height:0;padding:4.85rem 0 2.15rem;align-items:stretch;
      }
      .editorial-hero .hero-art-bg{
        align-items:flex-end;justify-content:center;padding:0 0 12%;
      }
      .editorial-hero .hero-art-bg img{
        width:min(68vw,220px);max-height:48%;
        object-position:center bottom;opacity:.12;
      }
      .editorial-hero .hero-content-wrap{text-align:left}
      .editorial-hero .hero-content{margin:0;max-width:none}
      .editorial-hero .tagline{font-size:1.35rem;line-height:1.15}
      .editorial-hero h1{
        font-size:clamp(2.15rem,9.5vw,2.85rem);
        margin-top:.4rem;line-height:1.04;
      }
      .editorial-hero .subhead{
        font-size:.84rem;margin:.75rem 0 0;max-width:28rem;opacity:.78;
      }
      .editorial-hero .actions{justify-content:flex-start;margin-top:1.15rem}
      .editorial-hero .actions .btn{width:auto;min-width:0;padding:.58rem 1.1rem;font-size:.78rem}
      .editorial-hero .brand-note{justify-content:flex-start;margin-top:1.25rem}
      .editorial-hero .decor{display:none}

      .page-hero{padding:4.35rem 0 1.25rem}
      .page-hero::after{display:none}
      .page-hero .inner{max-width:none}
      .page-hero h1{font-size:clamp(1.95rem,8vw,2.35rem);line-height:1.05}
      .page-hero .tagline{font-size:1.05rem;margin-bottom:.15rem}

      section{padding:2.15rem 0}
      .section-head{margin-bottom:1.15rem}
      .section-title{
        font-size:clamp(2rem,8vw,2.55rem);
        line-height:1.04;letter-spacing:.02em;
      }
      .section-intro{font-size:.84rem}
      h2{font-size:clamp(1.85rem,7vw,2.2rem);line-height:1.06}
      h3{font-size:1.32rem;line-height:1.15}
      .label{font-size:.62rem;margin-bottom:.5rem;letter-spacing:.24em}

      .exp-list{gap:2rem}
      .exp-row{display:flex;flex-direction:column;gap:.85rem;margin-bottom:0}
      .exp-copy{order:1}
      .exp-media{order:2}
      .exp-copy h3{font-size:clamp(1.4rem,5.5vw,1.65rem);line-height:1.12;margin-top:.15rem}
      .exp-copy p{font-size:.84rem;line-height:1.65}
      .exp-media img{max-height:148px;width:100%;object-fit:cover;border-radius:.85rem}

      .products{gap:.85rem}
      .product{
        display:grid;grid-template-columns:92px 1fr;grid-template-rows:auto auto auto auto;
        gap:.2rem .8rem;align-items:start;padding:1rem 1rem 1.1rem;
      }
      .product-img{
        grid-column:1;grid-row:1/span 4;margin:0;padding:.45rem;
        align-self:start;border-radius:.75rem;
      }
      .product-img img{max-height:84px;width:100%}
      .product .label{grid-column:2;margin:0;font-size:.58rem}
      .product h3{grid-column:2;font-size:clamp(1.15rem,4.8vw,1.35rem);margin:0}
      .product .meta{grid-column:2;font-size:.74rem;margin:0}
      .product .price{grid-column:2;font-size:1.05rem;padding-top:.35rem;margin-top:.15rem}
      .product .badge{grid-column:2;justify-self:start;margin-top:.25rem}

      .post-list{gap:1.35rem}
      .card-post .card-body{padding:1rem 1rem .75rem}
      .post-title{font-size:clamp(1.35rem,5.5vw,1.55rem);line-height:1.12}
      .post-excerpt{font-size:.82rem;margin-top:.5rem}
      .card-post-media{max-height:132px;aspect-ratio:16/9;object-fit:cover}

      .menu-hero{padding:4.35rem 0 1rem;text-align:left}
      .menu-hero .wrap{text-align:left}
      .menu-hero .soul{font-size:1.15rem}
      .menu-hero h1{font-size:clamp(1.85rem,7.5vw,2.2rem);line-height:1.05}
      .menu-hero .intro{font-size:.84rem;margin-top:.65rem;padding:0;text-align:left}
      .menu-sheet{padding:0 0 2rem;max-width:none}
      .menu-cat{margin-bottom:1.65rem}
      .menu-cat-head{text-align:left;margin-bottom:.85rem;padding-bottom:.6rem}
      .menu-cat-head h3{font-size:clamp(1.35rem,5vw,1.55rem);text-align:left}
      .menu-item{padding:.7rem 0}
      .menu-item-name{font-size:1.02rem}

      .quote-block h2,.cta h2{font-size:clamp(1.75rem,7vw,2rem)}
      .values{gap:1rem}
      .value h3{font-size:1.2rem}

      footer .wrap{grid-template-columns:1fr;gap:1.35rem;padding:2rem 0}
      .footer-brand img{height:2rem!important}
      .footer-bottom{flex-direction:column;gap:.35rem;text-align:center}

      .wa-float{bottom:1rem;right:1rem;width:3rem;height:3rem}
      .wa-float span{display:none}
      .marquee{padding:.75rem 0}
      .marquee-item{font-size:.68rem;gap:1.5rem}
      .visit-band{padding:2rem 0}
      .contact-grid{gap:1.25rem}
      .cta{padding:1.75rem 1.15rem;text-align:left}
    }

    /* ── Hover suave en títulos y texto editorial ── */
    main h1, main h2, main h3,
    main .section-title,
    main .post-title,
    main .tagline,
    main .soul,
    main .label,
    main .menu-item-name,
    main .quote-block p,
    main .cta h2,
    main .cta-tagline,
    .editorial-hero .tagline,
    .editorial-hero h1,
    .page-hero .tagline,
    .page-hero h1,
    .menu-hero .soul,
    .menu-hero h1,
    .exp-copy h3,
    .menu-cat-head h3{
      transition:
        transform var(--text-hover-duration) var(--text-hover-ease),
        letter-spacing var(--text-hover-duration) var(--text-hover-ease),
        color .25s var(--ease);
    }
    main h1:hover, main h2:hover, main h3:hover,
    main .section-title:hover,
    main .post-title:hover,
    main .tagline:hover,
    main .soul:hover,
    main .label:hover,
    main .menu-item-name:hover,
    main .quote-block p:hover,
    main .cta h2:hover,
    main .cta-tagline:hover,
    .editorial-hero .tagline:hover,
    .editorial-hero h1:hover,
    .page-hero .tagline:hover,
    .page-hero h1:hover,
    .menu-hero .soul:hover,
    .menu-hero h1:hover,
    .exp-copy h3:hover,
    .menu-cat-head h3:hover{
      transform:translateY(-2px);
    }
    main h1:hover, main h2:hover, main h3:hover,
    main .section-title:hover,
    main .post-title:hover,
    .editorial-hero h1:hover,
    .page-hero h1:hover,
    .menu-hero h1:hover,
    main .cta h2:hover,
    .exp-copy h3:hover,
    .menu-cat-head h3:hover{
      letter-spacing:.025em;
    }

    /* ── Escritorio (≥768px) ── */
    @media(min-width:768px){
      .editorial-hero .hero-content-wrap{text-align:left}
      .editorial-hero .hero-content{margin:0}
      .menu-sheet{padding-left:1.5rem;padding-right:1.5rem}
    }

    @media(prefers-reduced-motion:reduce){
      .marquee-track,.float-soft{animation:none}
      .card,.product,.btn,.wa-float{transition:none}
      main h1, main h2, main h3,
      main .section-title, main .post-title, main .tagline, main .soul,
      main .label, main .menu-item-name, main .quote-block p,
      main .cta h2, main .cta-tagline,
      .editorial-hero .tagline, .editorial-hero h1,
      .page-hero .tagline, .page-hero h1,
      .menu-hero .soul, .menu-hero h1,
      .exp-copy h3, .menu-cat-head h3,
      nav.site-nav a, .nav-overlay a, .footer-nav a,
      .text-link, .address-link{transition:none}
      #main.page-content{animation:none}
      body.page-leaving, body.page-leaving #main.page-content{transition:none;transform:none;opacity:1}
      ::view-transition-old(root),::view-transition-new(root){animation:none}
      main h1:hover, main h2:hover, main h3:hover,
      main .section-title:hover, main .post-title:hover,
      main .tagline:hover, main .soul:hover, main .label:hover,
      main .menu-item-name:hover, main .quote-block p:hover,
      main .cta h2:hover, main .cta-tagline:hover,
      .editorial-hero .tagline:hover, .editorial-hero h1:hover,
      .page-hero .tagline:hover, .page-hero h1:hover,
      .menu-hero .soul:hover, .menu-hero h1:hover,
      .exp-copy h3:hover, .menu-cat-head h3:hover,
      nav.site-nav a:hover, .nav-overlay a:hover,
      .footer-nav a:hover, .text-link:hover, .address-link:hover{
        transform:none;letter-spacing:inherit;
      }
    }
  `;
}

function pageTransitionScript() {
  return `
      var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var crossDocVT=typeof window.PageRevealEvent!=='undefined';
      var exitMs=reduced?0:320;
      if(crossDocVT)document.documentElement.classList.add('vt-nav');

      function isInternalLink(a){
        if(!a||a.target==='_blank'||a.hasAttribute('download'))return false;
        var href=a.getAttribute('href');
        if(!href||href.charAt(0)==='#'||href.indexOf('mailto:')===0||href.indexOf('tel:')===0||href.indexOf('javascript:')===0)return false;
        try{
          var next=new URL(a.href,location.href);
          if(next.origin!==location.origin)return false;
          if(next.pathname===location.pathname&&next.search===location.search)return false;
          return true;
        }catch(e){return false;}
      }

      function leaveAndGo(url){
        if(reduced||exitMs===0){location.href=url;return;}
        document.body.classList.add('page-leaving');
        window.setTimeout(function(){location.href=url;},exitMs);
      }

      if(!crossDocVT&&!reduced){
        document.addEventListener('click',function(e){
          if(e.defaultPrevented)return;
          if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
          var a=e.target.closest('a');
          if(!isInternalLink(a))return;
          e.preventDefault();
          leaveAndGo(a.href);
        },false);
      }
  `;
}

function siteScripts(isHome, pageId, analyticsEnabled) {
  return `
    (function(){
      var header=document.getElementById('site-header');
      var toggle=document.getElementById('nav-toggle');
      var overlay=document.getElementById('nav-overlay');
      var backdrop=document.getElementById('nav-backdrop');
      var isHome=${isHome ? "true" : "false"};

      function setNavOpen(open){
        if(!overlay||!toggle)return;
        overlay.classList.toggle('open',open);
        toggle.setAttribute('aria-expanded',open);
        toggle.textContent=open?'×':'☰';
        document.body.classList.toggle('nav-open',open);
        document.body.style.overflow=open?'hidden':'';
        if(backdrop)backdrop.setAttribute('aria-hidden',open?'false':'true');
      }

      function onScroll(){
        if(!header)return;
        if(window.scrollY>40)header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }
      window.addEventListener('scroll',onScroll,{passive:true});
      onScroll();

      if(toggle&&overlay){
        toggle.addEventListener('click',function(){setNavOpen(!overlay.classList.contains('open'));});
        if(backdrop)backdrop.addEventListener('click',function(){setNavOpen(false);});
        overlay.querySelectorAll('a').forEach(function(a){
          a.addEventListener('click',function(){setNavOpen(false);});
        });
      }

      ${pageTransitionScript()}
      ${siteAnalyticsScript({ pageId: pageId || (isHome ? "home" : "page"), enabled: analyticsEnabled !== false })}
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

export function shell({
  title,
  description,
  depth,
  pageId,
  slug,
  heroArt,
  body,
  extraHead = "",
  year = new Date().getFullYear(),
}) {
  const site = loadSite();
  const { brand } = site;
  const analytics = normalizeAnalytics(site.analytics);
  const seoSettings = loadSeoSettings();
  const gaId = getGoogleAnalyticsId(site, { seo: seoSettings });
  const nav = getNav(site);
  const { img, href } = createPathHelpers(depth);
  const heroVar = heroArt ? `--hero-art:url('${img(heroArt)}')` : `--hero-art:none`;
  const isHome = pageId === "home";
  const pageSlug = slug ?? (isHome ? "" : pageId);
  const pageTitle = formatPageTitle({ brandName: brand.name, title, isHome });

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
  <meta name="view-transition" content="same-origin"/>
  <title>${pageTitle}</title>
  <meta name="description" content="${escapeMeta(description)}"/>${faviconHead(depth)}${seoHead({ brand, title, description, depth, slug: pageSlug, isHome, ogImagePath: brandAssetPath("og") })}${googleAnalyticsHead(gaId)}
  <style>${fontFaces(depth, site)}</style>
  <style>${brandThemeCss(site)}</style>
  <style>${siteStyles()}</style>
  <style>:root{${heroVar}}</style>${extraHead}
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
        <a href="${href("/tienda")}" class="nav-cta" data-track="tienda">Comprar café</a>
      </nav>
    </div>
  </header>
  <div class="nav-backdrop" id="nav-backdrop" aria-hidden="true"></div>
  <div class="nav-overlay" id="nav-overlay" role="dialog" aria-modal="true" aria-label="Menú de navegación">
    ${overlayLinks}
    <a href="${href("/tienda")}" class="nav-cta-overlay" data-track="tienda">Comprar café</a>
  </div>
  <main id="main" class="page-content">${body}</main>
  <footer>
    <div class="wrap">
      <div class="footer-brand">
        <img src="${img("/images/brand/horizontal-crema.png")}" alt="${brand.name}" style="height:2.35rem"/>
        <p style="opacity:.75;margin-top:.5rem;font-size:.92rem;line-height:1.5">${brand.footerLine || brand.city}</p>
      </div>
      <div>
        <p style="font-weight:600;margin-bottom:.75rem">Visítanos</p>
        <p style="font-size:.95rem;line-height:1.75;opacity:.85">${addressLinkHtml(brand, { className: "address-link address-link--on-dark" })}</p>
        <p style="margin-top:.65rem;font-size:.9rem;opacity:.75">${brand.hours}</p>
      </div>
      <div>
        <p style="font-weight:600;margin-bottom:.75rem">Contacto</p>
        <div class="footer-nav">
          <a href="tel:${brand.phone.replace(/\s/g, "")}">${brand.phone}</a>
          <a href="mailto:${brand.email}">${brand.email}</a>
          <a href="https://wa.me/${brand.whatsapp}" target="_blank" rel="noopener noreferrer" data-track="whatsapp">WhatsApp</a>
        </div>
        <div class="social-links">
          <a href="${brand.social.instagram}" target="_blank" rel="noopener noreferrer" data-track="instagram">Instagram</a>
          <a href="${brand.social.facebook}" target="_blank" rel="noopener noreferrer" data-track="facebook">Facebook</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} ${brand.name} · Cali, Colombia</span>
        <span>
          <a href="${href("/contacto")}" data-track="contacto">Contacto</a>
          · <a href="${href("/admin")}" class="admin-link">Administración</a>
        </span>
      </div>
    </div>
  </footer>
  ${whatsappFloat(brand.whatsapp)}
  <script>${siteScripts(isHome, pageId, analytics.enabled)}</script>
</body>
</html>`;
}

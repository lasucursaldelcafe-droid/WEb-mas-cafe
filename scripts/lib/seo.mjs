/**
 * SEO y reconocimiento de marca — meta tags, Open Graph, JSON-LD, sitemap.
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { domainToASCII } from "node:url";
import { DOMAIN_PUNYCODE } from "./domain-config.mjs";
import { brandAssetPath } from "./brand-logo.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");
const settingsPath = path.join(root, "content/settings.json");

const GITHUB_PAGES_FALLBACK = "https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe";

export function escapeMeta(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function loadSettingsFile() {
  if (!existsSync(settingsPath)) return {};
  return JSON.parse(readFileSync(settingsPath, "utf8"));
}

/** Hostname ASCII (punycode) — requerido en sitemaps para dominios con tilde */
export function toAsciiHostname(host) {
  const raw = String(host ?? "").trim();
  if (!raw) return DOMAIN_PUNYCODE;
  try {
    return domainToASCII(raw) || raw;
  } catch {
    return raw;
  }
}

/**
 * URL pública real del sitio (apex, punycode, protocolo accesible hoy).
 * GitHub Pages sirve en http://mascafé.com; www redirige al apex.
 */
export function resolvePublicSiteUrl(settings = loadSettingsFile()) {
  const seo = settings.seo ?? {};
  const host = toAsciiHostname(settings.customDomainPunycode || DOMAIN_PUNYCODE);
  const scheme = seo.httpsReady === true ? "https" : "http";
  return `${scheme}://${host}`.replace(/\/$/, "");
}

export function loadSeoSettings() {
  const settings = loadSettingsFile();
  const seo = settings.seo ?? {};
  const siteUrl =
    resolvePublicSiteUrl(settings) ||
    GITHUB_PAGES_FALLBACK.replace(/\/$/, "");
  return {
    siteUrl,
    siteName: seo.siteName || "Más Café",
    defaultOgImage: seo.ogImagePath || brandAssetPath("og"),
    googleSiteVerification: seo.googleSiteVerification || "",
    bingSiteVerification: seo.bingSiteVerification || "",
    locale: seo.locale || "es_CO",
    twitterHandle: seo.twitterHandle || "",
    httpsReady: seo.httpsReady === true,
  };
}

export function saveSeoSiteUrl(siteUrl, { httpsReady = true } = {}) {
  const settings = loadSettingsFile();
  settings.seo = settings.seo ?? {};
  settings.seo.siteUrl = siteUrl.replace(/\/$/, "");
  settings.seo.httpsReady = httpsReady;
  writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

/** URL absoluta de una ruta del sitio (slug vacío = home) */
export function pageUrl(siteUrl, slug = "") {
  const clean = slug.replace(/^\//, "").replace(/\/$/, "");
  return clean ? `${siteUrl}/${clean}/` : `${siteUrl}/`;
}

/** Ruta absoluta de asset para og:image */
export function assetUrl(siteUrl, assetPath, depth = 0) {
  const up = depth === 0 ? "" : "../".repeat(depth);
  const rel = `${up}${assetPath.replace(/^\//, "")}`;
  if (rel.startsWith("http")) return rel;
  const normalized = rel.replace(/^\.\//, "").replace(/(\.\.\/)+/g, "");
  return `${siteUrl}/${normalized.replace(/^\//, "")}`;
}

export function formatPageTitle({ brandName, title, isHome = false }) {
  if (isHome) {
    return `${brandName} — Café de especialidad en Cali, Colombia`;
  }
  return `${brandName} · ${title}`;
}

function openingHoursJsonLd(brand) {
  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "07:30",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "09:00",
      closes: "19:00",
    },
  ];
}

export function jsonLdLocalBusiness({ brand, siteUrl, logoUrl, imageUrl }) {
  const sameAs = [brand.social?.instagram, brand.social?.facebook].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${siteUrl}/#organization`,
    name: brand.name,
    alternateName: "Mas Cafe",
    description:
      brand.mission ||
      "Café de especialidad y hospitalidad en Cali, Colombia.",
    url: siteUrl,
    logo: logoUrl,
    image: imageUrl,
    telephone: brand.phone,
    email: brand.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.address,
      addressLocality: "Cali",
      addressRegion: "Valle del Cauca",
      addressCountry: "CO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 3.3953,
      longitude: -76.5444,
    },
    openingHoursSpecification: openingHoursJsonLd(brand),
    priceRange: "$$",
    servesCuisine: "Café de especialidad",
    sameAs,
  };
}

export function seoHead({
  brand,
  title,
  description,
  depth = 0,
  slug = "",
  isHome = false,
  ogImagePath,
  noindex = false,
}) {
  const seo = loadSeoSettings();
  const siteUrl = seo.siteUrl;
  const pageTitle = formatPageTitle({
    brandName: brand.name,
    title,
    isHome,
  });
  const canonical = pageUrl(siteUrl, slug);
  const ogImage = assetUrl(siteUrl, ogImagePath || seo.defaultOgImage, depth);
  const logoUrl = assetUrl(siteUrl, brandAssetPath("primary"), depth);
  const jsonLd = jsonLdLocalBusiness({
    brand,
    siteUrl,
    logoUrl,
    imageUrl: ogImage,
  });

  const verification = [
    seo.googleSiteVerification
      ? `<meta name="google-site-verification" content="${escapeMeta(seo.googleSiteVerification)}"/>`
      : "",
    seo.bingSiteVerification
      ? `<meta name="msvalidate.01" content="${escapeMeta(seo.bingSiteVerification)}"/>`
      : "",
  ]
    .filter(Boolean)
    .join("\n  ");

  const robots = noindex
    ? `<meta name="robots" content="noindex, nofollow"/>`
    : `<meta name="robots" content="index, follow, max-image-preview:large"/>`;

  return `
  ${robots}
  <link rel="canonical" href="${escapeMeta(canonical)}"/>
  <meta name="author" content="${escapeMeta(brand.name)}"/>
  <meta name="application-name" content="${escapeMeta(brand.name)}"/>
  ${verification}
  <meta property="og:type" content="website"/>
  <meta property="og:locale" content="${escapeMeta(seo.locale)}"/>
  <meta property="og:site_name" content="${escapeMeta(seo.siteName)}"/>
  <meta property="og:title" content="${escapeMeta(pageTitle)}"/>
  <meta property="og:description" content="${escapeMeta(description)}"/>
  <meta property="og:url" content="${escapeMeta(canonical)}"/>
  <meta property="og:image" content="${escapeMeta(ogImage)}"/>
  <meta property="og:image:alt" content="${escapeMeta(brand.name)} — logo"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escapeMeta(pageTitle)}"/>
  <meta name="twitter:description" content="${escapeMeta(description)}"/>
  <meta name="twitter:image" content="${escapeMeta(ogImage)}"/>
  ${seo.twitterHandle ? `<meta name="twitter:site" content="${escapeMeta(seo.twitterHandle)}"/>` : ""}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

const PUBLIC_SLUGS = [
  "",
  "cafe",
  "menu",
  "nosotros",
  "tienda",
  "blog",
  "contacto",
];

export function generateSitemapXml(siteUrl = resolvePublicSiteUrl()) {
  const base = siteUrl.replace(/\/$/, "");
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_SLUGS.map((slug) => {
    const loc = pageUrl(base, slug);
    const priority = slug === "" ? "1.0" : "0.8";
    const changefreq = slug === "blog" ? "weekly" : "monthly";
    return `  <url>
    <loc>${escapeMeta(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

export function generateRobotsTxt(siteUrl = resolvePublicSiteUrl()) {
  const base = siteUrl.replace(/\/$/, "");
  return `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /informe/

Sitemap: ${base}/sitemap.xml
`;
}

export { GITHUB_PAGES_FALLBACK };

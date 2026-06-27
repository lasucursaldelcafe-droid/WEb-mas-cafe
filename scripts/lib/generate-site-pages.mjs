import { loadSite } from "./site-html/shared.mjs";
import { pageHome, SITE_PAGES } from "./site-html/pages.mjs";

/** Compatibilidad: devuelve solo la home */
export function generatePublicHtml() {
  return pageHome();
}

export function generateSitePages() {
  return SITE_PAGES.map(({ path, generator }) => ({
    path,
    html: generator(),
  }));
}

export function collectImagePaths() {
  const site = loadSite();
  const paths = new Set([
    "/images/brand/horizontal-crema.png",
    "/images/grafica/1.png",
    "/images/grafica/2.png",
    "/images/grafica/3.png",
    "/images/products/caja-cafe.png",
  ]);
  for (const exp of site.experiences) paths.add(exp.image);
  for (const p of site.products) paths.add(p.image);
  for (const b of site.blog ?? []) paths.add(b.image);
  return [...paths];
}

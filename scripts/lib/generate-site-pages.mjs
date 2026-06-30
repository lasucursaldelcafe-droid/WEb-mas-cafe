import { loadSite } from "./site-html/shared.mjs";
import { buildSitePages, pageHome } from "./site-html/pages.mjs";

/** Compatibilidad: devuelve solo la home */
export function generatePublicHtml() {
  return pageHome();
}

export function generateSitePages() {
  return buildSitePages().map(({ path, generator }) => ({
    path,
    html: generator(),
  }));
}

export function collectImagePaths() {
  const site = loadSite();
  const paths = new Set([
    "/images/brand/logo-principal.png",
    "/images/brand/logo-og.png",
    "/images/brand/horizontal-crema.png",
    "/images/brand/horizontal-azul.png",
    "/images/brand/favs.png",
    "/images/grafica/1.png",
    "/images/grafica/2.png",
    "/images/grafica/3.png",
    "/images/products/caja-cafe.png",
    "/images/decor/Recurso-4.svg",
    "/images/decor/Recurso-6.svg",
  ]);
  for (const exp of site.experiences) paths.add(exp.image);
  for (const p of site.products) paths.add(p.image);
  for (const b of site.blog ?? []) paths.add(b.image);
  if (site.brand?.nosotrosImage) paths.add(site.brand.nosotrosImage);
  return [...paths];
}

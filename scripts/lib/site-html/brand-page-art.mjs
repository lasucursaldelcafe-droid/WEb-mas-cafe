/**
 * Arte de marca por página: isotipo (+) y variantes de color desde Drive.
 * Cada subpágina usa combinaciones distintas para no repetir la misma composición.
 */
export const PAGE_BRAND_ART = {
  home: {
    watermarkA: "/images/brand/icon-mark.png",
    watermarkB: "/images/decor/1.svg",
    wmApos: "88% 4%",
    wmBpos: "6% 78%",
    visitArt: "/images/brand/visita.png",
    visitDeco: "/images/brand/descriptor-cafe.png",
    visitTone: "ocean",
  },
  cafe: {
    watermarkA: "/images/brand/descriptor-caramelo.png",
    watermarkB: "/images/decor/2.svg",
    wmApos: "90% 12%",
    wmBpos: "8% 85%",
    visitArt: "/images/brand/pausa.png",
    visitDeco: "/images/brand/descriptor-caramelo.png",
    visitTone: "warm",
  },
  menu: {
    watermarkA: "/images/brand/descriptor-azul.png",
    watermarkB: "/images/decor/3.svg",
    wmApos: "85% 8%",
    wmBpos: "10% 80%",
    visitArt: "/images/brand/carta.png",
    visitDeco: "/images/brand/descriptor-crema.png",
    visitTone: "sage",
  },
  nosotros: {
    watermarkA: "/images/brand/icon-mark.png",
    watermarkB: "/images/decor/Recurso-55.svg",
    wmApos: "92% 15%",
    wmBpos: "5% 70%",
    visitArt: "/images/brand/mood.png",
    visitDeco: "/images/brand/descriptor-cafe.png",
    visitTone: "earth",
  },
  tienda: {
    watermarkA: "/images/brand/descriptor-caramelo.png",
    watermarkB: "/images/decor/Recurso-10.svg",
    wmApos: "87% 6%",
    wmBpos: "12% 88%",
    visitArt: "/images/brand/horno.png",
    visitDeco: "/images/brand/descriptor-azul.png",
    visitTone: "caramel",
  },
  blog: {
    watermarkA: "/images/brand/descriptor-crema.png",
    watermarkB: "/images/decor/Recurso-18.svg",
    wmApos: "90% 10%",
    wmBpos: "7% 75%",
    visitArt: "/images/brand/carta.png",
    visitDeco: "/images/brand/descriptor-caramelo.png",
    visitTone: "forest",
  },
  contacto: {
    watermarkA: "/images/brand/descriptor-cafe.png",
    watermarkB: "/images/decor/Recurso-25.svg",
    wmApos: "86% 5%",
    wmBpos: "4% 82%",
    visitArt: "/images/brand/visita.png",
    visitDeco: "/images/brand/icon-mark.png",
    visitTone: "ocean",
  },
  fidelizacion: {
    watermarkA: "/images/brand/descriptor-azul.png",
    watermarkB: "/images/decor/Recurso-42.svg",
    wmApos: "88% 14%",
    wmBpos: "9% 72%",
    visitArt: "/images/brand/pausa.png",
    visitDeco: "/images/brand/descriptor-crema.png",
    visitTone: "sage",
  },
};

const DEFAULT_ART = PAGE_BRAND_ART.home;

export function getPageBrandArt(pageId) {
  return PAGE_BRAND_ART[pageId] ?? DEFAULT_ART;
}

/** Rutas de imagen usadas en temas por página (para collectImagePaths). */
export function collectBrandPageArtPaths() {
  const paths = new Set();
  for (const art of Object.values(PAGE_BRAND_ART)) {
    for (const key of ["watermarkA", "watermarkB", "visitArt", "visitDeco"]) {
      if (art[key]) paths.add(art[key]);
    }
  }
  return [...paths];
}

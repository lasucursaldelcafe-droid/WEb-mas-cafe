/** Rutas / subcarpetas del sitio — gestionadas desde el admin */

export const DEFAULT_ROUTES = [
  { id: "home", slug: "", label: "Inicio", enabled: true, builtin: true, inNav: false },
  { id: "cafe", slug: "cafe", label: "Café", enabled: true, builtin: true, inNav: true },
  { id: "menu", slug: "menu", label: "Menú", enabled: true, builtin: true, inNav: true },
  { id: "nosotros", slug: "nosotros", label: "Nosotros", enabled: true, builtin: true, inNav: true },
  { id: "tienda", slug: "tienda", label: "Tienda", enabled: true, builtin: true, inNav: true },
  { id: "blog", slug: "blog", label: "Blog", enabled: true, builtin: true, inNav: true },
  { id: "contacto", slug: "contacto", label: "Contacto", enabled: true, builtin: true, inNav: true },
  {
    id: "fidelizacion",
    slug: "fidelizacion",
    label: "Fidelización",
    enabled: true,
    builtin: true,
    inNav: true,
  },
];

export function ensureRoutes(site) {
  if (!site.routes?.length) {
    return DEFAULT_ROUTES.map((r) => ({ ...r }));
  }
  const byId = new Map(site.routes.map((r) => [r.id, r]));
  const merged = DEFAULT_ROUTES.map((def) => ({ ...def, ...byId.get(def.id) }));
  for (const r of site.routes) {
    if (!r.builtin && !merged.find((m) => m.id === r.id)) {
      merged.push({ ...r });
    }
  }
  return merged;
}

export function getEnabledRoutes(site) {
  return ensureRoutes(site).filter((r) => r.enabled && r.id !== "home");
}

export function getNavRoutes(site) {
  return ensureRoutes(site).filter((r) => r.enabled && r.inNav && r.id !== "home");
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

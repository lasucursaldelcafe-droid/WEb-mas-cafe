const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefija rutas de /public para GitHub Pages (basePath) o dominio propio. */
export function assetPath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${basePath}${path}`;
}

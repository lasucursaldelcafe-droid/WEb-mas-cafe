# Publicar el sitio — acceso permanente

## URL permanente (HTML en GitHub)

**https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/**

El sitio es **HTML estático** (no necesita servidor). GitHub lo guarda en la rama `gh-pages` y lo sirve gratis 24/7.

| Qué | Dónde |
|-----|-------|
| Código fuente (para editar) | Rama `main` |
| HTML publicado (el sitio web) | Rama `gh-pages` |
| Generación automática | GitHub Actions en cada push a `main` |

---

## Activar GitHub Pages (una sola vez)

Sin este paso la URL devuelve 404 aunque el HTML ya esté en GitHub.

1. Abre: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. **Build and deployment** → **Source** → **Deploy from a branch**
3. **Branch** → `gh-pages` → carpeta **`/ (root)`**
4. Clic en **Save**

En 1–2 minutos el sitio queda público en móvil y PC.

---

## Cómo hacer cambios después

Ver guía completa: [COMO-ACTUALIZAR.md](./COMO-ACTUALIZAR.md)

**Resumen:**

1. Edita `content/site.json` (textos, precios, menú, blog)
2. Haz commit y push a `main`
3. GitHub Actions regenera el HTML y actualiza `gh-pages` en ~2 minutos

No necesitas tocar el HTML a mano. El sistema lo genera desde el código.

---

## Dominio mascafecol.com (opcional)

Cuando conectes GoDaddy: [GITHUB-PAGES-Y-DOMINIO.md](./GITHUB-PAGES-Y-DOMINIO.md)

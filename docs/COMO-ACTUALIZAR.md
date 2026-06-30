# Cómo actualizar el sitio web

El sitio es **HTML estático** con imágenes incluidas. Se publica automáticamente en GitHub Pages.

## URLs

| Dónde | URL |
|-------|-----|
| GitHub Pages | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| Dominio | https://mascafé.com/ (cuando DNS esté configurado) |

---

## Flujo de trabajo

```
content/site.json  →  npm run build:site  →  7 páginas HTML  →  push main  →  GitHub Pages
```

### Páginas generadas

| Archivo | Contenido |
|---------|-----------|
| `index.html` | Inicio |
| `cafe/index.html` | Café de especialidad |
| `menu/index.html` | Menú |
| `nosotros/index.html` | Historia y valores |
| `tienda/index.html` | Productos |
| `blog/index.html` | Artículos |
| `contacto/index.html` | Contacto |

---

## Cambiar textos, precios o menú

### Opción A — Desde GitHub (sin instalar nada)

1. Abre `content/site.json` en el repo
2. Clic en el lápiz ✏️
3. Edita el JSON
4. **Commit changes**

### Opción B — Desde tu computador

```bash
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
# edita content/site.json
npm run preview          # ver cambios en http://localhost:4173
git add content/site.json
git commit -m "Actualizar contenido"
git push origin main
```

Ver guía local: [GUIA-LOCAL.md](./GUIA-LOCAL.md)

---

## Qué editar en site.json

| Sección | Contenido |
|---------|-----------|
| `brand` | Nombre, tagline, textos de inicio |
| `products` | Productos de la tienda y precios |
| `menu` | Menú del café por categorías |
| `experiences` | Tarjetas de la home |
| `blog` | Artículos |

---

## Cambiar diseño o imágenes

| Qué | Dónde |
|-----|-------|
| Textos y datos | `content/site.json` |
| Imágenes | `public/images/` |
| Diseño HTML | `scripts/lib/generate-public-html.mjs` |
| Diseño React (avanzado) | `src/` + `npm run dev` |

Después: push a `main` → deploy automático.

---

## Verificar el deploy

1. Repo → pestaña **Actions**
2. Workflow **Publicar HTML en GitHub Pages** → debe estar en verde ✅
3. Abre la URL del sitio

---

## Activar GitHub Pages (solo una vez)

Si la URL da 404: [ACTIVAR-GITHUB-PAGES.md](./ACTIVAR-GITHUB-PAGES.md)

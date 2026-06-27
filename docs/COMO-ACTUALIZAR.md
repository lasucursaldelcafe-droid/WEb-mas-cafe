# Cómo actualizar el sitio web

El sitio se genera como **HTML estático** y se publica en GitHub Pages.

## URL permanente

**https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/**

(Cuando conectes el dominio: **https://mascafecol.com**)

---

## Cómo hacer cambios (3 pasos)

### 1. Edita el contenido

Abre `content/site.json` en GitHub o en tu computador.

Ahí cambias:
- Textos de la marca (tagline, headline, etc.)
- Productos y precios
- Menú del café
- Artículos del blog
- Experiencias de la home

### 2. Guarda y sube a GitHub

**Desde GitHub (sin instalar nada):**
1. Repo → `content/site.json` → lápiz ✏️
2. Edita el JSON
3. **Commit changes**

**Desde tu computador:**
```bash
# editas content/site.json
git add content/site.json
git commit -m "Actualizar menú y productos"
git push origin main
```

### 3. Espera el deploy automático

GitHub Actions genera el HTML nuevo y lo publica en ~2 minutos.

Revisa en: **Actions** → **Publicar HTML en GitHub Pages** ✅

---

## Generar HTML en local (opcional)

```bash
npm install
npm run build:html
```

Los archivos HTML quedan en la carpeta `out/`:
- `out/index.html` → página de inicio
- `out/cafe/index.html` → café
- `out/menu/index.html` → menú
- etc.

---

## Activar GitHub Pages (solo una vez)

1. https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. **Source** → **Deploy from a branch**
3. **Branch** → `gh-pages` → carpeta `/ (root)`
4. **Save**

---

## Resumen

| Quieres cambiar… | Edita… |
|------------------|--------|
| Textos, precios, menú | `content/site.json` |
| Diseño / código | archivos en `src/` |
| Publicar | push a `main` (automático) |

No necesitas hosting de pago. GitHub guarda el código y publica el HTML gratis.

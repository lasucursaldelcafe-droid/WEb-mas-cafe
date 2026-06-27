# Activar GitHub Pages

## URL del sitio

**https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/**

---

## Paso 1 — Activar Pages (una sola vez)

1. https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. **Build and deployment** → **Source**: **Deploy from a branch**
3. **Branch**: `gh-pages` → carpeta **`/ (root)`**
4. **Save**

Espera 1–2 minutos y abre la URL.

---

## Paso 2 — Ver en local antes de publicar

```bash
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
npm run preview
```

→ http://localhost:4173/

---

## Qué incluye el sitio publicado

- `index.html` — página completa
- `images/` — todas las fotos (sin CDN externo)
- `.nojekyll` — archivos servidos correctamente

El workflow **Publicar HTML en GitHub Pages** corre en cada push a `main`.

---

## Dominio personalizado (opcional)

Para usar **mascafe.com**: [DOMINIO-MASCAFE-COM.md](./DOMINIO-MASCAFE-COM.md)

Configura el dominio en GitHub → Settings → Pages → Custom domain. El archivo `CNAME` lo gestiona GitHub automáticamente.

---

## Actualizar contenido

Edita `content/site.json` → push a `main`.

Guía: [COMO-ACTUALIZAR.md](./COMO-ACTUALIZAR.md)

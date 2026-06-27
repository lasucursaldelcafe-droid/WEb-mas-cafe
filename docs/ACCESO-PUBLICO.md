# Publicar el sitio — acceso permanente

## URL del sitio

**https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/**

HTML + imágenes autocontenidas. Funciona en móvil, tablet y PC.

---

## Ver en local (desde GitHub)

```bash
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
npm run preview
```

→ http://localhost:4173/

---

## Cómo funciona

| Qué | Dónde |
|-----|-------|
| Código fuente | Rama `main` |
| Sitio publicado | Rama `gh-pages` |
| Generación | GitHub Actions en cada push a `main` |

---

## Activar GitHub Pages (una sola vez)

Sin este paso la URL devuelve 404.

1. https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. **Deploy from a branch** → `gh-pages` → **`/ (root)`** → Save

Guía: [ACTIVAR-GITHUB-PAGES.md](./ACTIVAR-GITHUB-PAGES.md)

---

## Actualizar el sitio

1. Edita `content/site.json`
2. Push a `main`
3. Espera ~1 minuto

Guía: [COMO-ACTUALIZAR.md](./COMO-ACTUALIZAR.md)

---

## Dominio mascafe.com

Configuración DNS en GoDaddy: [DOMINIO-MASCAFE-COM.md](./DOMINIO-MASCAFE-COM.md)

**Nota:** `mascafecol.com` es el dominio del email/redes en el contenido del sitio. El dominio web configurado en GitHub es `mascafe.com`.

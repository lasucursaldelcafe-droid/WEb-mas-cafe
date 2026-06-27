# Activar el sitio en GitHub Pages (una sola vez)

El sitio se genera automáticamente con **HTML + todas las imágenes** en la rama `gh-pages`. Solo falta activar Pages en GitHub.

## URL del sitio

**https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/**

Funciona en celular, tablet y computador — sin instalar nada.

---

## Paso 1 — Activar GitHub Pages

1. Abre: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. En **Build and deployment** → **Source**:
   - Elige **Deploy from a branch**
3. **Branch**: `gh-pages` → carpeta **`/ (root)`**
4. Clic en **Save**

Espera 1–2 minutos y abre la URL de arriba.

---

## Paso 2 — Si el repo es privado

En cuentas gratuitas, GitHub Pages **público** desde repo privado requiere **GitHub Pro** (de pago).

Opciones:

| Opción | Qué hacer |
|--------|-----------|
| **A** | Hacer el repo **público** (Settings → Danger zone → Change visibility) |
| **B** | Contratar GitHub Pro (Pages público con repo privado) |
| **C** | Usar Firebase: `npm run deploy:firebase` |

---

## Actualizar el sitio

1. Edita `content/site.json`
2. Push a `main`
3. GitHub Actions publica solo en ~1 minuto

O localmente:

```bash
npm run build:github-pages
```

---

## Qué incluye el sitio publicado

- `index.html` — página completa
- `images/` — todas las fotos del sitio (sin CDN externo)
- `.nojekyll` — para que GitHub sirva archivos correctamente

Ya **no** usa jsDelivr (no funcionaba con repo privado).

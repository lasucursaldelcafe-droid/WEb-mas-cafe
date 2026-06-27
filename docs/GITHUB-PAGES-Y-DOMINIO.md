# GitHub Pages + dominio mascafe.com

Hosting **gratis** en GitHub Pages. El dominio en GoDaddy apunta a GitHub con DNS.

---

## URLs

| URL | Estado |
|-----|--------|
| https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ | GitHub Pages (siempre) |
| https://mascafe.com/ | Dominio personalizado (requiere DNS) |
| http://localhost:4173/ | Vista previa local (`npm run preview`) |

---

## Paso 1 — Activar GitHub Pages

1. https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. **Deploy from a branch** → `gh-pages` → `/ (root)` → Save

---

## Paso 2 — Ver en local

```bash
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
npm run preview
```

---

## Paso 3 — Dominio en GitHub

1. Settings → Pages → **Custom domain**
2. Escribe: `mascafe.com`
3. Save

Si también usas `www`, añádelo como nombre alternativo.

---

## Paso 4 — DNS en GoDaddy

Ver guía detallada: [DOMINIO-MASCAFE-COM.md](./DOMINIO-MASCAFE-COM.md)

Resumen — registros para `mascafe.com`:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |
| CNAME | www | `lasucursaldelcafe-droid.github.io` |

**Elimina** registros A que apunten a GoDaddy (`76.223.54.146`, `13.248.169.48`).

---

## Paso 5 — HTTPS

Cuando DNS esté verificado (check verde en GitHub Pages), activa **Enforce HTTPS**.

---

## Actualizar el sitio

Edita `content/site.json` → push a `main` → deploy automático.

Guías: [COMO-ACTUALIZAR.md](./COMO-ACTUALIZAR.md) · [GUIA-LOCAL.md](./GUIA-LOCAL.md)

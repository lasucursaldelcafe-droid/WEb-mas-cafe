# Entregables — todo lo hecho en los repositorios

Resumen de lo construido hasta hoy en **WEb-mas-cafe** (y ramas relacionadas).

| Documento | Descripción |
|-----------|-------------|
| [COTIZACION-PERPETUO.md](./COTIZACION-PERPETUO.md) | Cotización $ 2.500.000 COP — trabajo entregado (Markdown) |
| [COTIZACION-PERPETUO.html](./COTIZACION-PERPETUO.html) | Misma cotización, lista para imprimir o PDF |

---

## Sitio web público (HTML — producción)

| Entregable | URL / ubicación |
|------------|-----------------|
| 8 páginas HTML | inicio, café, menú, nosotros, tienda, blog, contacto, admin |
| Deploy automático | GitHub Actions → GitHub Pages |
| URL pública | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| Paleta crema + textos sin repetición | `content/site.json` |
| Favicon logo Más Café | generado en build |
| Móvil editorial | CSS en `scripts/lib/site-html/shared.mjs` |

**Build:** `npm run build:github-pages` → `gh-pages-site/`

---

## Panel admin

| Entregable | Detalle |
|------------|---------|
| URL | `/admin/` |
| Login | usuario `admin` (ver `content/users.json`) |
| Edición | productos, menú, blog, experiencias, configuración |
| Publicación | push a main vía GitHub (workflow opcional `ADMIN_PUBLISH_KEY`) |

---

## Informe constitución web

| Entregable | Detalle |
|------------|---------|
| URL | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/ |
| Generador | `scripts/lib/generate-constitution-report.mjs` |
| Checklist editable | `content/informe-requisitos.json` |
| Secciones v1.1 | wallet, migración, independencia Más Café |

---

## Firebase (respaldo)

| Entregable | Detalle |
|------------|---------|
| Proyecto | mas-cafe-c8413 |
| Build | `npm run build:mas-cafe` → carpeta `mas-cafe/` |
| URLs | https://mas-cafe-c8413.web.app/ |
| Workflow CI | `.github/workflows/deploy-firebase.yml` (token pendiente renovar) |

---

## Next.js (código base — no es producción pública hoy)

| Entregable | Ubicación |
|------------|-----------|
| App Router | `src/app/(site)/`, `src/app/admin/` |
| APIs | `src/app/api/` (auth, content, analytics) |
| Firebase Admin preparado | `src/lib/firebase/admin.ts` |
| Tipos y store | `src/lib/types.ts`, `src/lib/store.ts` |

**Uso futuro:** base para wallet + www.mascafé.com con backend en Vercel.

---

## Documentación

| Carpeta | Contenido |
|---------|-----------|
| `docs/` | hosting, dominio, guías locales |
| `informes/` | constitución web |
| `proyecto-mas-cafe/` | **entrega, cuentas, migración** (esta carpeta) |

---

## Pendiente (próximos entregables)

Ver [wallet-pendiente.md](./wallet-pendiente.md)

---

## PRs relevantes (historial GitHub)

| PR | Tema |
|----|------|
| #9 | Paleta crema + textos |
| #10 | Informe constitución |
| #12–#13 | Fix CI GitHub Pages + Firebase |
| #14 | Wallet en informe + checklist editable |

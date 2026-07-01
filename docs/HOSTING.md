# Hosting y plataformas — Más Café

## Producción actual (principal)

| | |
|-|-|
| **Plataforma** | GitHub Pages |
| **URL** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| **Deploy** | Automático al hacer push a `main` |
| **Workflow** | `.github/workflows/deploy-github-pages.yml` |
| **Build** | `node scripts/build-github-pages.mjs` → carpeta `gh-pages-site/` |

Activar una sola vez: [ACTIVAR-GITHUB-PAGES.md](./ACTIVAR-GITHUB-PAGES.md)

## Dominio propio

| | |
|-|-|
| **Dominio** | https://www.mascafé.com/ (`xn--mascaf-gva.com`) |
| **DNS** | GoDaddy → apuntar a GitHub Pages |
| **Guía** | [DOMINIO-MASCAFE-COM.md](./DOMINIO-MASCAFE-COM.md) |

## Wallet (backend Supabase)

| | |
|-|-|
| **API** | `https://oogzhvdsjkvmwscqrfyu.supabase.co/functions/v1/wallet` |
| **Deploy** | `npm run deploy:wallet` o workflow `Deploy wallet Supabase` |
| **UI** | `/wallet/` y `/caja/` en GitHub Pages (HTML estático + API Supabase) |
| **Guía** | [proyecto-mas-cafe/entregables/WALLET-CHECKLIST-GRATIS.md](../proyecto-mas-cafe/entregables/WALLET-CHECKLIST-GRATIS.md) |

```bash
npm run wallet:diagnose
npm run test:wallet
npm run wallet:setup
```

## Firebase Hosting (legacy — solo espejo estático)

Mismo sitio HTML, proyecto `mas-cafe-c8413`. **No usar Cloud Functions** (requiere Blaze).

| URL | |
|-----|--|
| https://mas-cafe-c8413.web.app/ | |
| https://mas-cafe-c8413.firebaseapp.com/ | |

```bash
# Obsoleto para wallet — redirige a Supabase:
npm run deploy:firebase   # → npm run wallet:setup
```

Workflow: `.github/workflows/deploy-firebase.yml` (desactivado).

## Dominio mascafé.com (automático)

```bash
npm run domain:configure:dry   # simular
npm run domain:configure       # aplicar DNS + GitHub Pages
npm run domain:verify          # verificar
```

Guía: [proyecto-mas-cafe/migracion/AUTOMATIZAR-DOMINIO.md](../proyecto-mas-cafe/migracion/AUTOMATIZAR-DOMINIO.md)  
Workflow CI: `.github/workflows/configure-domain.yml`

## Informe constitucional (marca)

Documento HTML separado del sitio público:

https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/

Se regenera en cada build. Fuente: `scripts/lib/generate-constitution-report.mjs`

## Carpeta Drive (activos de marca)

ID en `content/settings.json` → `googleDriveFolderId`

https://drive.google.com/drive/folders/153OUmu9lChpCk2NiiirUwI_Z5EDQQNtC

Los archivos usados en web viven en `public/images/` del repositorio.

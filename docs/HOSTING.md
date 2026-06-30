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

## Firebase Hosting (respaldo)

Mismo sitio HTML estático, proyecto `mas-cafe-c8413`.

| URL | |
|-----|--|
| https://mas-cafe-c8413.web.app/ | |
| https://mas-cafe-c8413.firebaseapp.com/ | |

```bash
npx firebase login
npm run deploy:firebase
```

Workflow opcional: `.github/workflows/deploy-firebase.yml` (requiere secret `FIREBASE_TOKEN`).

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

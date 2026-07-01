# Despliegue en Vercel — Más Café

El sitio en producción (wallet, fidelización, admin, menú) se genera como **HTML estático** en `gh-pages-site/`. Vercel usa el mismo build que GitHub Pages, sin depender del export de Next.js.

## Por qué no Next.js directo

- El sitio público real vive en `scripts/build-github-pages.mjs` (multipágina + wallet + caja).
- Next.js en `src/` es complementario; el build fallaba al incluir código Deno de `supabase/functions/` en TypeScript.
- **Solución:** `vercel.json` apunta a `npm run build:vercel` → carpeta `gh-pages-site`.

## Configuración en Vercel (una vez)

1. [vercel.com](https://vercel.com) → **Add New Project** → importar repo `WEb-mas-cafe`.
2. Vercel detecta `vercel.json` — no cambiar Framework (debe quedar **Other** / sin Next).
3. **Environment Variables** (Production + Preview):

   | Variable | Origen |
   |----------|--------|
   | `SUPABASE_URL` | Supabase → Settings → API |
   | `SUPABASE_PUBLISHABLE_KEY` o `SUPABASE_ANON_KEY` | Misma pantalla |
   | `ADMIN_PUBLISH_KEY` | Mismo valor que GitHub Secrets |

4. **Domains:** añadir `xn--mascaf-gva.com` y `www.xn--mascaf-gva.com` (o mascafé.com).
5. En GoDaddy, CNAME `www` → `cname.vercel-dns.com` (o el que indique Vercel).

## GitHub Actions (opcional)

Secrets en el repo:

- `VERCEL_TOKEN` — [Account Tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` — Project Settings → General
- `VERCEL_PROJECT_ID` — Project Settings → General

Workflow: `.github/workflows/deploy-vercel.yml` (valida build en cada push a `main` y despliega si hay token).

## Comandos locales

```bash
npm run build:vercel    # Genera gh-pages-site + verifica enlaces
npm run ci:vercel       # Build + SEO (CI)
npm run build           # Next.js (opcional, ya no rompe por Supabase)
```

## DNS: GitHub Pages vs Vercel

Hoy el apex puede apuntar a GitHub Pages. Para usar **solo Vercel** en www:

1. Desplegar en Vercel y verificar dominio.
2. Cambiar CNAME `www` en GoDaddy al de Vercel.
3. Mantener GitHub Pages como respaldo o redirigir según necesidad.

Wallet y API siguen en **Supabase** — Vercel solo sirve el frontend estático.

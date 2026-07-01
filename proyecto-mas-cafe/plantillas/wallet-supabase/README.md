# Plantilla: Wallet de fidelización con Supabase + GitHub Pages

Copia este flujo en proyectos nuevos. Backend **gratuito** (Supabase); sin Firebase Blaze.

## Requisitos

| Secret / archivo | Dónde |
|------------------|--------|
| `SUPABASE_URL` | GitHub Secrets + `.env.local` |
| `SUPABASE_PUBLISHABLE_KEY` o `SUPABASE_ANON_KEY` | GitHub Secrets + `.env.local` |
| `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` | Solo CI / servidor |
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | Settings → General |
| `GH_PAGES_PAT` | GitHub PAT con `repo` + `workflow` |
| `secrets/google-wallet-sa.json` | Opcional — Google Wallet Android |

## Comandos (orden recomendado)

```bash
# 1. Variables locales
cp .env.example .env.local
# Rellenar Supabase + GITHUB_TOKEN

# 2. Conectar Supabase al repo
npm run wallet:connect

# 3. Bootstrap Google Wallet (IDs públicos en content/google-wallet.json)
npm run wallet:google-bootstrap

# 4. Si tienes JSON GCP:
npm run wallet:google-bootstrap -- ./cuenta-servicio.json
npm run wallet:google-auto

# 5. Publicar todo (Supabase + Pages + pruebas)
npm run wallet:publish

# 6. Verificar
npm run test:wallet
```

## Estructura clave

```
content/google-wallet.json     # Issuer ID, Merchant ID, branding
content/wallet-program.json    # Puntos, premios, PIN caja
supabase/functions/wallet/     # Edge Function (API única)
scripts/wallet/                # Frontend cliente + caja
scripts/publish-wallet.mjs     # Orquestador de publicación
scripts/test-wallet-live.mjs   # Pruebas API + HTML
secrets/google-wallet-sa.json  # JSON GCP (gitignored)
```

## URLs tras publicar

- Cliente: `/wallet/`
- Caja: `/caja/` (PIN inicial `123456`)
- API: `POST {SUPABASE_URL}/functions/v1/wallet` con `{ "action": "..." }`

## GitHub Actions

| Workflow | Función |
|----------|---------|
| `deploy-supabase-wallet.yml` | Migraciones + Edge Function |
| `deploy-github-pages.yml` | Sitio estático con wallet |
| `setup-google-wallet.yml` | IDs Google + JWT (si hay JSON) |
| `publish-wallet.yml` | Orquesta publish completo |

## Acciones API (Edge Function)

- `getProgramStatus` — público
- `ensureProgram` — sembrar programa
- `getMyWallet` — requiere auth
- `getGoogleWalletStatus` / `getGoogleWalletSaveUrl` — Google Wallet
- `searchCustomer`, `addPoints`, `confirmRedemption` — caja (PIN)

## Notas

- No uses `npx convex deploy` ni Firebase Functions para wallet (requiere Blaze).
- `SKIP_GITHUB_SECRETS=1` en CI evita error 403 al escribir secrets con `GITHUB_TOKEN`.
- Usa `GH_PAGES_PAT` para `gh secret set` y disparar workflows.

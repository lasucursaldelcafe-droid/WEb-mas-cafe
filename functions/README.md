# Legacy — Firebase Cloud Functions

**No usar para la wallet.** Firebase Cloud Functions requiere plan Blaze (facturación).

La wallet activa está en:

- `supabase/functions/wallet/` — Edge Function
- `supabase/migrations/` — Postgres
- `scripts/setup-supabase-wallet.mjs` — deploy

Este directorio (`functions/index.js`) se conserva solo como referencia histórica.

```bash
npm run wallet:setup      # Supabase (correcto)
npm run deploy:wallet     # alias Supabase
```

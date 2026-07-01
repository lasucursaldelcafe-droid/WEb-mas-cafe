# Wallet de fidelización — checklist gratis (paso a paso)

Plan **sin costo inicial** para el MVP de puntos. Backend en **Supabase** (tier gratis). Sin Firebase Blaze ni Cloud Functions.

**Mockup visual:** https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/wallet/

**Sitio en vivo:** `/wallet/` y `/caja/` en GitHub Pages (HTML) + API en Supabase Edge Functions.

---

## Resumen rápido

| Fase | Qué | Costo |
|------|-----|-------|
| Ahora | Sitio web + informe + wallet UI | **$0** (GitHub Pages) |
| MVP wallet | Login + puntos + admin caja | **$0** (Supabase gratis) |
| Dominio | mascafé.com en GoDaddy | Ya pagado (dominio) |
| Login cliente | Email + contraseña (Supabase Auth) | **$0** |
| Google Wallet nativo | Tarjeta en Android | **$0** API (requiere JSON GCP en secrets) |

---

## Tabla paso a paso — configuración wallet (gratis)

| Paso | Qué hacer | Dónde | Responsable | Estado |
|------|-----------|-------|-------------|--------|
| **0** | Aprobar reglas de negocio | `content/wallet-program.json` | Dueños Más Café | ☐ |
| **1** | Proyecto **Supabase** creado | https://supabase.com/dashboard | Dev | ☑ |
| **2** | Secrets en GitHub: `SUPABASE_URL`, claves API, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` | [GitHub Secrets](https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions) | Dev | ☐ |
| **3** | Deploy backend: workflow **Deploy wallet Supabase** o `npm run wallet:setup` | `.github/workflows/deploy-supabase-wallet.yml` | Dev / CI | ☐ |
| **4** | Auth: Email habilitado (+ Google opcional) | Supabase → Authentication → Providers | Dev | ☐ |
| **5** | Migración SQL + Edge Function `wallet` | `supabase/migrations/` + `supabase/functions/wallet/` | Automático con setup | ☐ |
| **6** | Build sitio con claves públicas | `npm run build:github-pages` (inyecta `SUPABASE_URL` en `/wallet/`) | CI / Dev | ☐ |
| **7** | Probar API | `npm run test:wallet` | Dev | ☐ |
| **8** | Modo caja en mostrador | `/caja/` — cambiar PIN por defecto en admin | Dueños | ☐ |
| **9** | Google Wallet nativo (opcional Android) | `npm run wallet:google-console` → descargar JSON GCP → `npm run wallet:google-ingest` | Dev | ☐ |
| **10** | Secret `GOOGLE_WALLET_SERVICE_ACCOUNT` (JSON válido) | GitHub Secrets | Dev | ☐ |
| **11** | Verificar JWT Google | `npm run test:google-wallet -- --strict` → `configured: true` | Dev | ☐ |
| **12** | Probar flujo completo en móvil | Registro → puntos → QR → canje | Dueños + caja | ☐ |
| **13** | Anotar «wallet MVP en línea» | [REGISTRO-HECHO.md](../cuentas/REGISTRO-HECHO.md) | Cualquiera | ☐ |

---

## Decisiones que deben tomar los dueños

| Decisión | Opciones gratis recomendadas | Notas |
|----------|------------------------------|-------|
| Login cliente | Email + contraseña o Google OAuth | Supabase Auth |
| Puntos por compra | Ej. 1 punto / $1.000 COP | `content/wallet-program.json` |
| Premios | Ej. café gratis = 100 puntos | Lista en JSON |
| Quién opera caja | 1–2 personas con PIN staff | Cambiar PIN `123456` |
| Caducidad puntos | 12 meses / nunca | Legal + operación |

---

## Qué NO usar (errores frecuentes)

| ❌ Evitar | Por qué | ✅ Usar en su lugar |
|----------|---------|---------------------|
| Firebase Cloud Functions | Requiere plan **Blaze** (tarjeta) | Supabase Edge Functions |
| `FIREBASE_SERVICE_ACCOUNT` para wallet | Obsoleto; JSON inválido en CI | `GOOGLE_WALLET_SERVICE_ACCOUNT` (solo Google Wallet) |
| `npm run deploy:firebase` para wallet | Redirige a Supabase; no despliega Functions | `npm run deploy:wallet` |
| Firestore para puntos | Código legacy en `functions/` | Postgres en Supabase |

---

## Stack actual (costo $0 al inicio)

```
Cliente (móvil)  →  PWA en GitHub Pages (/wallet/, /caja/)
Auth             →  Supabase Auth (email, Google opcional)
Base de datos    →  Supabase Postgres (tier gratis)
API wallet       →  Supabase Edge Function /functions/v1/wallet
Admin / caja     →  /admin/ + /caja/
Google Wallet    →  JWT vía secrets Supabase (GCP mas-cafe-c8413)
Dominio          →  www.mascafé.com → GitHub Pages (+ API Supabase)
```

---

## Comandos útiles

```bash
npm run wallet:diagnose          # Estado Supabase + Google Wallet
npm run test:wallet              # API + HTML en vivo
npm run wallet:setup             # Migraciones + Edge Function + seed
npm run wallet:connect           # Subir secrets a GitHub + deploy
npm run validate:supabase        # Comprobar variables locales
```

**Seguridad:** [SEGURIDAD.md](../cuentas/SEGURIDAD.md)  
**Enlaces:** [ENLACES-CONFIGURACION.md](../cuentas/ENLACES-CONFIGURACION.md)

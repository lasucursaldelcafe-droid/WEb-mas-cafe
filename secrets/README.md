# Google Wallet — descarga el JSON aquí

## Paso 1 — Preparar (ya hecho en CI si hay token Supabase)

```bash
npm run wallet:google-console
```

## Paso 2 — En Google Cloud (enlaces directos)

| Paso | URL |
|------|-----|
| Activar Wallet API | https://console.cloud.google.com/apis/library/walletobjects.googleapis.com?project=mas-cafe-c8413 |
| Cuenta de servicio | https://console.cloud.google.com/iam-admin/serviceaccounts?project=mas-cafe-c8413 |
| Pay Console (autorizar) | https://pay.google.com/business/console |

1. Abre **firebase-adminsdk-fbsvc@mas-cafe-c8413.iam.gserviceaccount.com**
2. **Claves** → **Añadir clave** → **JSON** → Descargar
3. En Pay Console → **Usuarios autorizados** → añade ese mismo email

## Paso 3 — Importar (un solo comando)

```bash
npm run wallet:google-ingest -- ~/Downloads/mas-cafe-c8413-xxxxx.json
```

O copia el archivo a:

```
secrets/google-wallet-sa.json
npm run wallet:google-ingest
```

## Paso 4 — Probar en Android

https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/

Login → **Añadir a Google Wallet**

## GitHub Secrets (estado verificado en CI)

| Secret | Debe contener | Estado actual |
|--------|----------------|---------------|
| `GOOGLE_WALLET_SERVICE_ACCOUNT` | JSON completo en una línea | **No configurado** |
| `FIREBASE_SERVICE_ACCOUNT` | JSON completo (legacy) | **Solo email** (~31 caracteres) — inválido |
| `FIREBASE_TOKEN` | Token de `npx firebase login:ci` | **Expirado** — no puede crear claves IAM |
| `GOOGLE_WALLET_ISSUER_ID` | `3388000000023162431` | OK |

## GitHub (sin PC local)

**Opción recomendada — workflow con pegado de JSON:**

1. Actions → **Ingestar JSON Google Wallet** → Run workflow  
2. Pega el JSON completo descargado de GCP  
3. El workflow importa a Supabase, actualiza secrets y republica Pages  

**Opción secret:**

Secret: **GOOGLE_WALLET_SERVICE_ACCOUNT** = contenido del JSON (una línea, sin saltos rotos en `private_key`)  
Luego: **Actions → Setup Google Wallet → Run workflow**

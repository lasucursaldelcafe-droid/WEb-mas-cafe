# Google Wallet nativo — rutas e instrucciones (Más Café)

Objetivo: que el cliente pulse **«Añadir a Google Wallet»** en `/wallet/` y la tarjeta quede instalada en el monedero digital del Android.

**Estado técnico hoy:** Issuer ID y clase loyalty ya existen. Falta desplegar el **JSON de cuenta de servicio** en Supabase (`configured: true`).

---

## Ruta 1 — Consola Google Pay & Wallet (emisor)

| | |
|---|---|
| **URL** | https://pay.google.com/business/console |
| **Clase loyalty** | https://pay.google.com/business/console/passes/BCR2DN5TR7J4FLAR/issuer/3388000000023162431/loyalty/edit/3388000000023162431.mas_cafe_loyalty |

**Qué hacer:**
1. Confirmar **Issuer ID:** `3388000000023162431`
2. Confirmar **Merchant ID:** `BCR2DN5TR7J4FLAR`
3. **Usuarios autorizados** → añadir el email de la cuenta de servicio (ej. `firebase-adminsdk-…@mas-cafe-c8413.iam.gserviceaccount.com`)
4. Esperar estado del emisor/clase **aprobado** si Google lo pide (24–48 h)

---

## Ruta 2 — Google Cloud (JSON de firma)

| | |
|---|---|
| **Cuentas de servicio** | https://console.cloud.google.com/iam-admin/serviceaccounts?project=mas-cafe-c8413 |
| **Wallet API** | https://console.cloud.google.com/apis/library/walletobjects.googleapis.com?project=mas-cafe-c8413 |

**Qué hacer:**
1. Abrir la cuenta `firebase-adminsdk-fbsvc@mas-cafe-c8413.iam.gserviceaccount.com`
2. Pestaña **Claves** → **Añadir clave** → **JSON** → descargar
3. Guardar como `secrets/google-wallet-sa.json` en el repo (local, no se sube a Git)
4. O pegar el JSON completo en GitHub Secret **`GOOGLE_WALLET_SERVICE_ACCOUNT`**

---

## Ruta 3 — GitHub Secrets (CI)

| | |
|---|---|
| **URL** | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions |

| Secret | Valor |
|--------|--------|
| `GOOGLE_WALLET_ISSUER_ID` | `3388000000023162431` ✅ |
| `GOOGLE_PAY_MERCHANT_ID` | `BCR2DN5TR7J4FLAR` ✅ |
| `GOOGLE_WALLET_SERVICE_ACCOUNT` | **JSON completo en una línea** ⚠️ pendiente |
| `SUPABASE_ACCESS_TOKEN` | Para desplegar secrets ✅ |
| `SUPABASE_PROJECT_REF` | `oogzhvdsjkvmwscqrfyu` ✅ |

**Acción:** crear o reemplazar `GOOGLE_WALLET_SERVICE_ACCOUNT` con el JSON descargado (no texto suelto).  
Disparar workflow: **Actions → Setup Google Wallet → Run workflow**

---

## Ruta 4 — Supabase (backend JWT)

| | |
|---|---|
| **Proyecto** | https://supabase.com/dashboard/project/oogzhvdsjkvmwscqrfyu |
| **Edge Functions** | …/functions/wallet |
| **Secrets** | …/settings/functions |

**Secrets requeridos en la función `wallet`:**
- `GOOGLE_WALLET_ISSUER_ID` = `3388000000023162431`
- `GOOGLE_WALLET_SERVICE_ACCOUNT` = JSON string de la cuenta de servicio

**Comando local (con JSON en `secrets/`):**
```bash
npm run wallet:google-publish -- ./ruta/al-archivo.json
```

**Verificación API:**
```bash
npm run test:google-wallet -- --strict
```
Debe mostrar: `Supabase JWT — botón activo` (`configured: true`).

---

## Ruta 5 — Wallet web (cliente Android)

| | |
|---|---|
| **URL producción** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/ |
| **Dominio** | http://xn--mascaf-gva.com/wallet/ |

**Prueba en el móvil (Android):**
1. Abrir `/wallet/` en Chrome
2. **Crear cuenta** o iniciar sesión
3. En la tarjeta de puntos o pestaña **QR**, pulsar **«Añadir a Google Wallet»**
4. Se abre Google Pay → **Guardar**
5. Abrir app **Google Wallet** → debe aparecer la tarjeta Más Café con puntos y QR

**Si no aparece el botón:** `getGoogleWalletStatus.configured` es `false` → volver a Ruta 3 y 4.

---

## Ruta 6 — Fidelización (activación QR)

| | |
|---|---|
| **URL** | …/fidelizacion/ |

QR de activación lleva a `/wallet/` para registro. No sustituye el botón Google Wallet tras login.

---

## Ruta 7 — Caja (mostrador)

| | |
|---|---|
| **URL** | …/caja/ |
| **PIN inicial** | `123456` (cambiar en admin) |

Escanea el QR del cliente o busca por ID `MC-…` para sumar puntos / validar canjes.

---

## Comandos únicos (después del JSON)

```bash
# 0. Preparar Supabase + ver enlaces Google Console
npm run wallet:google-console

# 1. Descargar JSON en GCP (ver secrets/README.md)

# 2. Importar y activar botón Google Wallet
npm run wallet:google-ingest -- ./archivo-descargado.json

# 3. Solo diagnóstico
npm run test:google-wallet -- --strict
```

---

## Apple Wallet (iPhone)

No está en este flujo. En iOS se usa **PWA** (instalar en inicio) o **descargar imagen con QR** desde `/wallet/`. Google Wallet nativo es **solo Android**.

---

## Criterio de aceptación

- [ ] `npm run test:google-wallet -- --strict` → 0 fallos  
- [ ] API `getGoogleWalletStatus` → `"configured": true`  
- [ ] Android: botón visible → tarjeta guardada en Google Wallet  
- [ ] QR de la tarjeta nativa escaneable en `/caja/`

# Google Wallet — tarjeta de fidelización nativa (Android)

La wallet web (`/wallet/`) usa **Supabase** (Auth + Postgres + Edge Functions). **Google Wallet** añade la tarjeta al teléfono Android, con saldo y QR sincronizados.

**No usamos Firebase** para la wallet. Solo necesitas un proyecto **Google Cloud** (gratis para esta API) y la consola **Google Pay & Wallet**.

**Costo:** Google Wallet API es **gratis**. No requiere Apple Developer ($99/año).

---

## Qué necesitas (una sola vez)

| Dato | Dónde obtenerlo |
|------|-----------------|
| **Proyecto Google Cloud** | [Crear proyecto](https://console.cloud.google.com/projectcreate) |
| **Issuer ID** (numérico) | [Google Pay & Wallet Console](https://pay.google.com/business/console) |
| **Cuenta de servicio** (JSON) | [IAM → Service accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) |
| Autorizar la cuenta en la consola | Pay Console → emisor → **Usuarios autorizados** |

---

## Enlaces directos

| Paso | Enlace |
|------|--------|
| Pay & Wallet Console (Issuer ID) | https://pay.google.com/business/console |
| Crear proyecto Google Cloud | https://console.cloud.google.com/projectcreate |
| Cuentas de servicio | https://console.cloud.google.com/iam-admin/serviceaccounts |
| Activar Google Wallet API | https://console.cloud.google.com/apis/library/walletobjects.googleapis.com |
| Credenciales | https://console.cloud.google.com/apis/credentials |

Si ya tienes `project_id` en el JSON de la cuenta de servicio, añade `?project=TU-PROJECT-ID` a los enlaces de Cloud Console.

---

## Pasos manuales

### 1. Proyecto Google Cloud

1. Crear proyecto en https://console.cloud.google.com/projectcreate (ej. `mas-cafe-wallet`).  
2. Anotar el **Project ID** (no el nombre visible).

### 2. Cuenta de servicio

1. IAM → Service accounts → **Create service account** (nombre: `wallet-issuer`).  
2. Rol recomendado: **Editor** del proyecto (o permisos mínimos para Wallet API).  
3. Keys → **Add key** → JSON → descargar.  
4. El JSON incluye `project_id` — úsalo como `GOOGLE_CLOUD_PROJECT_ID` si quieres.

### 3. Emisor en Google Pay & Wallet Console

1. https://pay.google.com/business/console  
2. Crear emisor / programa de loyalty.  
3. Copiar **Issuer ID**.  
4. **Usuarios autorizados** → añadir el email del JSON (`...@...iam.gserviceaccount.com`).

### 4. Activar Google Wallet API

Abrir https://console.cloud.google.com/apis/library/walletobjects.googleapis.com (selecciona tu proyecto) → **Enable**.

O dejar que `npm run wallet:google-setup` la active con la cuenta de servicio.

### 5. Variables en `.env.local`

```env
GOOGLE_CLOUD_PROJECT_ID=mas-cafe-wallet
GOOGLE_WALLET_ISSUER_ID=3388000000022883204
GOOGLE_WALLET_SERVICE_ACCOUNT={"type":"service_account","project_id":"mas-cafe-wallet",...}
```

`GOOGLE_CLOUD_PROJECT_ID` es opcional si el JSON ya trae `project_id`.

### 6. Setup automático (recomendado)

```bash
# Guardar credenciales en .env.local y ejecutar todo el trámite:
npm run wallet:google-auto -- --write-env \
  --merchant-id BCR2DN5TR7J4FLAR \
  --api-key TU_API_KEY \
  --issuer-id 3388000000022883204

# Solo simular:
npm run wallet:google-auto:dry
```

El script automático:

1. Guarda variables en `.env.local` (con `--write-env`)
2. Valida Merchant ID vs Issuer ID (BCR ≠ Issuer)
3. Ejecuta `keytool` si hay keystore (SHA-1 para app Android)
4. Activa Wallet API y crea LoyaltyClass
5. Sube secrets a Supabase + GitHub
6. Redespliega Edge Function y GitHub Pages
7. Ejecuta diagnóstico

**Importante:** `BCR2DN5TR7J4FLAR` es **Merchant ID** (Google Pay). El **Issuer ID** de Wallet API es otro valor **numérico** en la sección «Google Wallet API» de Pay Console.

Setup manual (solo API): `npm run wallet:google-setup`

### 7. Republicar frontend

```bash
npm run build:github-pages
```

En `/wallet/` → pestaña **QR** → botón **«Añadir a Google Wallet»**.

---

## Stack (recordatorio)

| Capa | Tecnología |
|------|------------|
| Frontend | GitHub Pages — `/wallet/`, `/caja/` |
| Backend | Supabase (Auth, Postgres, Edge Function `wallet`) |
| Pase nativo Android | Google Wallet API (Google Cloud) |

---

## Aprobación de Google

La clase queda en `UNDER_REVIEW` hasta que Google apruebe el emisor (~24–48 h). La wallet web con QR sigue funcionando mientras tanto.

---

## Comandos

| Comando | Qué hace |
|---------|----------|
| `npm run wallet:google-auto` | Trámite completo (env + API + deploy + diagnose) |
| `npm run wallet:google-auto:dry` | Simular sin cambios |
| `npm run wallet:google-setup` | Solo API + secrets (sin merchant/keytool) |
| `npm run wallet:diagnose` | Supabase + Google Wallet |

---

## Secrets en GitHub

| Secret | Para qué |
|--------|----------|
| `GOOGLE_WALLET_ISSUER_ID` | ID del emisor |
| `GOOGLE_WALLET_SERVICE_ACCOUNT` | JSON cuenta de servicio |

Enlaces generales: [ENLACES-CONFIGURACION.md](../cuentas/ENLACES-CONFIGURACION.md)

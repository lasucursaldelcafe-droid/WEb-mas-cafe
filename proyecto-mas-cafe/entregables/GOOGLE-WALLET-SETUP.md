# Google Wallet — tarjeta de fidelización nativa (Android)

La wallet web (`/wallet/`) ya funciona con QR y puntos. **Google Wallet** añade la tarjeta al teléfono Android (app Google Wallet), con saldo y QR sincronizados.

**Costo:** Google Wallet API es **gratis**. No requiere Apple Developer ($99/año).

---

## Qué necesitas (una sola vez)

| Dato | Dónde obtenerlo |
|------|-----------------|
| **Issuer ID** (numérico) | [Google Pay & Wallet Console](https://pay.google.com/business/console) |
| **Cuenta de servicio** (JSON) | [Google Cloud IAM](https://console.cloud.google.com/iam-admin/serviceaccounts?project=mas-cafe-c8413) |
| Autorizar la cuenta en la consola | Pay Console → tu emisor → **Usuarios autorizados** → email de la service account |

Proyecto Google Cloud recomendado: **mas-cafe-c8413** (el mismo de Firebase).

---

## Pasos manuales

### 1. Crear emisor en Google Pay & Wallet Console

1. Abrir https://pay.google.com/business/console  
2. Crear cuenta de negocio / emisor si no existe.  
3. Copiar el **Issuer ID** (número largo, ej. `3388000000022883204`).

### 2. Cuenta de servicio en Google Cloud

1. Abrir https://console.cloud.google.com/iam-admin/serviceaccounts?project=mas-cafe-c8413  
2. Usar la cuenta existente de Firebase Admin SDK **o** crear una nueva.  
3. Keys → Add key → JSON → descargar.  
4. En Pay Console, añadir el email (`...@...iam.gserviceaccount.com`) como **usuario autorizado**.

### 3. Activar Google Wallet API

```bash
# O abrir en consola:
# https://console.cloud.google.com/apis/library/walletobjects.googleapis.com?project=mas-cafe-c8413
```

El script `npm run wallet:google-setup` la activa automáticamente si tienes la clave JSON.

### 4. Variables en `.env.local`

```env
GOOGLE_WALLET_ISSUER_ID=3388000000022883204
GOOGLE_WALLET_SERVICE_ACCOUNT={"type":"service_account",...}
```

> Puedes pegar el JSON completo en una sola línea, o reutilizar `FIREBASE_SERVICE_ACCOUNT` si es la misma clave.

### 5. Ejecutar setup automático

```bash
npm run wallet:google-setup
```

Esto:

- Crea la **LoyaltyClass** `mas_cafe_loyalty` en Google Wallet API  
- Sube secrets a **Supabase Edge Function**  
- Sube secrets a **GitHub Actions**  
- Redespliega la function `wallet`

### 6. Republicar frontend

```bash
npm run build:github-pages
# o disparar workflow «Publicar HTML en GitHub Pages»
```

En `/wallet/` → pestaña **QR** aparece el botón **«Añadir a Google Wallet»**.

---

## Aprobación de Google

La clase queda en estado `UNDER_REVIEW` hasta que Google apruebe el emisor (normalmente **24–48 h**). Mientras tanto el botón puede fallar al guardar — la wallet web sigue funcionando.

---

## Comandos útiles

| Comando | Qué hace |
|---------|----------|
| `npm run wallet:google-setup:dry` | Verifica env sin cambiar nada |
| `npm run wallet:google-setup` | Configura API + secrets + deploy |
| `npm run wallet:diagnose` | Comprueba Supabase + Google Wallet |

---

## Cómo lo ve el cliente

1. Registrarse en http://xn--mascaf-gva.com/wallet/  
2. Pestaña **QR** → **Añadir a Google Wallet**  
3. Iniciar sesión con cuenta Google en el móvil  
4. La tarjeta queda en la app Google Wallet con puntos y QR `MC-XXXXXX`  
5. Al sumar puntos en caja, el saldo se actualiza en el pase (PATCH automático)

---

## Secrets en GitHub

| Secret | Para qué |
|--------|----------|
| `GOOGLE_WALLET_ISSUER_ID` | ID del emisor |
| `GOOGLE_WALLET_SERVICE_ACCOUNT` | JSON cuenta de servicio |

Enlaces: [ENLACES-CONFIGURACION.md](../cuentas/ENLACES-CONFIGURACION.md)

# Google Wallet nativo — credenciales

La tarjeta en el **monedero digital del Android** requiere el JSON de cuenta de servicio de Google Cloud.

## Archivo local (recomendado)

```bash
# Coloca el JSON descargado de GCP aquí:
secrets/google-wallet-sa.json

npm run wallet:google-bootstrap -- ./ruta/descarga.json
npm run wallet:google-publish
```

## GitHub Secret (CI)

Nombre: **`GOOGLE_WALLET_SERVICE_ACCOUNT`**  
Valor: contenido completo del `.json` (una sola línea).

Workflow: **Actions → Setup Google Wallet → Run workflow**

## Pay Console — usuario autorizado

https://pay.google.com/business/console → emisor → **Usuarios autorizados**  
Añadir: `client_email` del JSON (ej. `firebase-adminsdk-fbsvc@mas-cafe-c8413.iam.gserviceaccount.com`)

## Probar

```bash
npm run test:google-wallet -- --strict
```

En Android: https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/wallet/ → login → **Añadir a Google Wallet**

Guía completa: `proyecto-mas-cafe/entregables/GOOGLE-WALLET-RUTAS.md`

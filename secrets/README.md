# Alternativa a Google Wallet nativo (sin clave JSON de Google Cloud)

Tu captura muestra **«No hay claves»** en la cuenta de servicio. Sin una clave JSON,
Google no permite firmar el pase nativo. **No necesitas eso** para operar la fidelización.

## Opción recomendada (ya activa en /wallet/)

| Método | Cómo |
|--------|------|
| **QR en caja** | Pestaña QR → muestra el código en mostrador |
| **Descargar tarjeta** | Botón «Descargar imagen con QR» → PNG en el teléfono |
| **Instalar app** | «Instalar en inicio» → acceso rápido como app |
| **Copiar ID** | Dictar `MC-…` en caja si falla el QR |

Todo funciona solo con **Supabase** — sin Firebase ni claves GCP.

## Si más adelante quieres Google Wallet nativo

1. En la fila `firebase-adminsdk@mas-cafe-c8413…` → menú **⋮** → **Administrar claves**
2. **Añadir clave** → **JSON** → descargar archivo
3. Guardar como `secrets/google-wallet-sa.json`
4. En [Pay Console](https://pay.google.com/business/console) → **Usuarios autorizados** → añadir ese email
5. `npm run wallet:google-bootstrap -- ./archivo.json && npm run wallet:google-auto`

Hasta entonces, el botón de Google Wallet **no se muestra** (solo QR + descarga + PWA).

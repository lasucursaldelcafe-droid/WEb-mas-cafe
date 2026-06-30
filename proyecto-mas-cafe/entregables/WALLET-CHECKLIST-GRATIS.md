# Wallet de fidelización — checklist gratis (paso a paso)

Plan **sin costo inicial** para el MVP de puntos. Opciones de pago solo si superan límites gratuitos (SMS masivos, etc.).

**Mockup visual (ya hecho):** https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/wallet/

---

## Resumen rápido

| Fase | Qué | Costo |
|------|-----|-------|
| Ahora | Sitio web + informe + mockup | **$0** (GitHub Pages) |
| MVP wallet | Login + puntos + admin caja | **$0** con tier gratis Firebase/Vercel |
| Dominio | mascafé.com en GoDaddy | Ya pagado (dominio) |
| SMS OTP Colombia | Firebase Phone Auth | Gratis hasta ~10k verificaciones/mes* |
| Apple/Google Wallet nativo | Passes en cartera del teléfono | Requiere cuenta desarrollador ($)** |

\* Ver cuotas actuales en Firebase.  
\*\* Apple Developer $99/año; Google Wallet API gratis. El MVP puede ser **PWA web** sin passes nativos.

---

## Tabla paso a paso — configuración wallet (gratis)

| Paso | Qué hacer | Dónde | Responsable | Estado |
|------|-----------|-------|-------------|--------|
| **0** | Aprobar reglas de negocio (puntos por $, premios, caducidad) | `content/informe-requisitos.json` → `wallet.reglasNegocio` | Dueños Más Café | ☐ |
| **1** | Crear org GitHub **solo Más Café** (futuro) | https://github.com/organizations/plan | Dueño | ☐ |
| **2** | Transferir o clonar repo a org Más Café | Repo → Settings → Transfer | Dueño + dev | ☐ |
| **3** | Activar **Firebase Authentication** | [Auth console](https://console.firebase.google.com/project/mas-cafe-c8413/authentication) → Sign-in → Email y/o Phone | Dev | ☐ |
| **4** | Activar **Firestore** (modo producción) | [Firestore](https://console.firebase.google.com/project/mas-cafe-c8413/firestore) → Crear base de datos | Dev | ☐ |
| **5** | Reglas Firestore (solo usuario ve sus puntos) | Firestore → Rules | Dev (Cursor) | ☐ |
| **6** | Habilitar **Phone Auth** solo si usan SMS | Auth → Phone → reCAPTCHA | Dev | ☐ |
| **7** | (Opcional gratis) Login por **email link** en vez de SMS | Auth → Email link | Dev | ☐ |
| **8** | Implementar MVP en código | Pedir a Cursor: «implementar wallet MVP» | Cursor | ☐ |
| **9** | Deploy backend en **Vercel** (tier Hobby gratis) | https://vercel.com → Import repo | Dev | ☐ |
| **10** | Variables en Vercel: Firebase config, `ADMIN_PUBLISH_KEY` | Vercel → Project → Environment Variables | Dev | ☐ |
| **11** | Apuntar **www.mascafé.com** al hosting con API (no solo Pages) | GoDaddy DNS → CNAME a Vercel | Automático con `domain:configure` adaptado | ☐ |
| **12** | Panel admin: buscar cliente + sumar puntos | `/admin/` ampliado | Cursor | ☐ |
| **13** | Modo caja: tablet en mostrador | URL `/caja/` o `/admin/caja` | Cursor | ☐ |
| **14** | 2–3 premios canjeables en Firestore | Admin programa fidelización | Dueños definen + Cursor | ☐ |
| **15** | Términos y privacidad del programa | Página `/legal/wallet` | Dueños (texto) + Cursor | ☐ |
| **16** | Probar flujo completo en móvil (PWA) | Chrome → Añadir a pantalla inicio | Dueños + caja | ☐ |
| **17** | Secret `FIREBASE_SERVICE_ACCOUNT` en GitHub (CI) | GitHub Secrets | Dev | ☐ |
| **18** | Anotar «wallet MVP en línea» | [REGISTRO-HECHO.md](../cuentas/REGISTRO-HECHO.md) | Cualquiera | ☐ |

---

## Decisiones que deben tomar los dueños (antes del paso 8)

| Decisión | Opciones gratis recomendadas | Notas |
|----------|------------------------------|-------|
| Login cliente | Email mágico (link) o Google | Sin costo SMS |
| Login cliente (Colombia) | Teléfono + Firebase Phone | Gratis con límites; luego puede costar |
| Puntos por compra | Ej. 1 punto / $1.000 COP | Escribir en `reglasNegocio` |
| Premios | Ej. café gratis = 50 puntos | Lista en JSON |
| Quién opera caja | 1–2 personas con PIN staff | No todo el mundo suma puntos |
| Caducidad puntos | 12 meses / nunca | Legal + operación |

---

## Qué NO está incluido en «gratis»

| Ítem | Alternativa gratis |
|------|-------------------|
| Pass nativo Apple Wallet | PWA web con QR en pantalla |
| Pass nativo Google Wallet | Igual — PWA primero |
| SMS ilimitados | Email o WhatsApp manual (fase 2) |
| POS integrado | Caja manual: buscar teléfono + monto |
| App iOS/Android tienda | PWA; app nativa fase 3 |

---

## Stack recomendado (costo $0 al inicio)

```
Cliente (móvil)  →  PWA Next.js en Vercel Hobby
Auth             →  Firebase Auth (email o phone)
Base de datos    →  Firestore (tier Spark)
Admin / caja     →  Mismo sitio /admin + rol staff
Dominio          →  www.mascafé.com → Vercel
Sitio estático   →  GitHub Pages (hasta migrar todo a Vercel)
```

---

## Después de cada paso

1. Marca ☐ → ☑ en esta tabla o en [REGISTRO-HECHO.md](../cuentas/REGISTRO-HECHO.md).  
2. En el chat: «listo paso 4 Firestore» — sin pegar contraseñas.  
3. Cursor actualiza código y deploy.

**Seguridad:** [SEGURIDAD.md](../cuentas/SEGURIDAD.md)

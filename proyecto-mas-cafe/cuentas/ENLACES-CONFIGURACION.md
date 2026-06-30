# Enlaces de configuración — ingresa credenciales aquí

Abre cada enlace, inicia sesión con la cuenta de **Más Café** (o la que vayan a transferir) y completa la configuración. Cuando termines un ítem, anótalo en [REGISTRO-HECHO.md](./REGISTRO-HECHO.md).

---

## GitHub (código y deploy actual)

| Qué configurar | Enlace |
|----------------|--------|
| Repositorio del proyecto | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe |
| Settings del repo | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings |
| **GitHub Pages** (dominio custom) | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages |
| **Secrets** (Firebase token, admin publish) | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions |
| **Actions** (ver si deploy está verde) | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions |
| Crear organización Más Café (futuro) | https://github.com/organizations/plan |
| Transferir repositorio | Repo → Settings → Danger Zone → Transfer |

**Secrets recomendados en GitHub:**

| Secret | Para qué | Cómo obtenerlo |
|--------|----------|----------------|
| **`FIREBASE_SERVICE_ACCOUNT`** | **Setup wallet completo** (Auth, Firestore, APIs, permisos IAM) | Firebase → Configuración → Cuentas de servicio → Generar clave JSON |
| `FIREBASE_TOKEN` | Deploy parcial (sin configurar Auth/Firestore por API) | En PC: `npx firebase login:ci` |
| `ADMIN_PUBLISH_KEY` | Publicar desde admin vía API | String aleatorio que definan ustedes |
| `GODADDY_API_KEY` | Automatizar DNS mascafé.com | https://developer.godaddy.com/keys |
| `GODADDY_API_SECRET` | Automatizar DNS | Mismo panel API |
| `GH_PAGES_PAT` | Workflow dominio (PAT con permisos repo + admin) | https://github.com/settings/tokens |

---

## GoDaddy API (automatizar DNS)

| Qué | Enlace |
|-----|--------|
| Crear API Key | https://developer.godaddy.com/keys |
| DNS manual (respaldo) | https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com |

**Workflow automático:** `npm run domain:configure` — ver [AUTOMATIZAR-DOMINIO.md](../migracion/AUTOMATIZAR-DOMINIO.md)

---

| Qué configurar | Enlace |
|----------------|--------|
| Inicio de sesión GoDaddy | https://sso.godaddy.com/ |
| Mis productos / dominios | https://dcc.godaddy.com/control/portfolio |
| DNS de **mascafé.com** | https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com |
| Correo profesional (opcional) | https://email.godaddy.com/ |
| **Correo institucional (guía)** | [CORREO-INSTITUCIONAL.md](../entregables/CORREO-INSTITUCIONAL.md) |
| Zoho Mail gratis (recomendado) | https://www.zoho.com/mail/ |
| Zoho Admin (crear buzones) | https://mailadmin.zoho.com/ |
| Activar MX automático | `npm run email:configure -- --provider zoho` |
| Forwarding / reenvío (desactivar parking) | https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com → **Reenvío** → Eliminar |
| Optimización completa GoDaddy | `npm run godaddy:optimize` |
| Activar HTTPS automático | `npm run domain:enable-https` |

**DNS para GitHub Pages (fase actual — sitio estático):**

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |
| CNAME | www | `lasucursaldelcafe-droid.github.io` |

Guía completa: [docs/DOMINIO-MASCAFE-COM.md](../../docs/DOMINIO-MASCAFE-COM.md)

---

## Firebase (backend + hosting respaldo)

Proyecto actual: **mas-cafe-c8413**

| Qué configurar | Enlace |
|----------------|--------|
| Consola del proyecto | https://console.firebase.google.com/project/mas-cafe-c8413 |
| Hosting | https://console.firebase.google.com/project/mas-cafe-c8413/hosting |
| Authentication (wallet — futuro) | https://console.firebase.google.com/project/mas-cafe-c8413/authentication |
| Firestore Database (wallet — futuro) | https://console.firebase.google.com/project/mas-cafe-c8413/firestore |
| Configuración general | https://console.firebase.google.com/project/mas-cafe-c8413/settings/general |
| Cuentas de servicio (CI/CD) | https://console.firebase.google.com/project/mas-cafe-c8413/settings/serviceaccounts/adminsdk |
| Uso y facturación (plan **Blaze** — obligatorio para Functions) | https://console.firebase.google.com/project/mas-cafe-c8413/usage/details |
| **Google Cloud — IAM / permisos** | https://console.cloud.google.com/iam-admin/grantaccess?project=mas-cafe-c8413 |
| **OAuth consent (login con Google)** | https://console.cloud.google.com/apis/credentials/consent?project=mas-cafe-c8413 |
| **APIs habilitadas** | https://console.cloud.google.com/apis/dashboard?project=mas-cafe-c8413 |
| Auth providers (email + Google) | https://console.firebase.google.com/project/mas-cafe-c8413/authentication/providers |
| Workflow setup automático | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/setup-firebase-wallet.yml |

**Comandos locales (permisos + backend):**

| Comando | Qué hace |
|---------|----------|
| `npm run wallet:diagnose` | Muestra qué bloquea el setup y enlaces directos |
| `npm run wallet:diagnose -- --fix` | Intenta asignar roles IAM y activar APIs automáticamente |
| `npm run wallet:setup` | Diagnóstico + Auth + Firestore + deploy + seed |

**Por qué a veces “no deja hacer cosas”:**

| Bloqueo | Causa | Solución |
|---------|-------|----------|
| Cloud Functions | Sin plan Blaze | Activar facturación en el enlace de usage arriba |
| APIs / Auth vía script | Cuenta de servicio sin roles | `wallet:diagnose --fix` o IAM manual |
| Solo `FIREBASE_TOKEN` | No puede configurar Google Console | Usar `FIREBASE_SERVICE_ACCOUNT` (JSON completo) |
| Login con Google | OAuth consent sin configurar | Enlace OAuth consent arriba |

**Sitio en vivo Firebase:**

- https://mas-cafe-c8413.web.app/
- https://mas-cafe-c8413.firebaseapp.com/

---

## Hosting con backend (fase wallet — elegir uno)

Cuando activemos wallet, **www.mascafé.com** deberá apuntar aquí (no solo GitHub Pages).

| Plataforma | Panel | Notas |
|------------|-------|-------|
| **Vercel** (recomendado para Next.js) | https://vercel.com/dashboard | Conectar repo GitHub → dominio custom |
| **Render** | https://dashboard.render.com/ | Web service Node.js |
| **Firebase Hosting + Functions** | Ver Firebase arriba | Si todo queda en Google |

---

## Google Drive (activos de marca)

| Qué | Enlace |
|-----|--------|
| Carpeta de marca | https://drive.google.com/drive/folders/153OUmu9lChpCk2NiiirUwI_Z5EDQQNtC |
| ID en el repo | `content/settings.json` → `googleDriveFolderId` |

---

## Redes y conversión

| Qué | Enlace |
|-----|--------|
| Instagram | https://www.instagram.com/mascafecol315 |
| Facebook | https://www.facebook.com/mascafecol |
| WhatsApp negocio | https://wa.me/573156573897 |
| Google Business Profile | https://business.google.com/ |

---

## Sitio en línea (verificar)

| Página | URL |
|--------|-----|
| Inicio | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| Admin | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/admin/ |
| Informe | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/ |
| Dominio objetivo | https://www.mascafé.com |

---

## Cursor (seguir actualizando)

| Qué | Enlace |
|-----|--------|
| Cursor dashboard | https://cursor.com/dashboard |
| Conectar repo GitHub | Settings → GitHub → autorizar org/repo |
| Cloud Agents | Usar este mismo flujo: pegar links en `REGISTRO-HECHO.md` |

---

## Wallet — proveedores OTP (fase 2, cuando decidan)

| Proveedor | Panel | Uso |
|-----------|-------|-----|
| Firebase Phone Auth | [Authentication](https://console.firebase.google.com/project/mas-cafe-c8413/authentication) | Login por SMS |
| Twilio | https://console.twilio.com/ | SMS OTP alternativo |

---

## Después de configurar cada uno

1. Anota en [REGISTRO-HECHO.md](./REGISTRO-HECHO.md): servicio, link, estado, fecha
2. Copia datos sensibles a [CREDENCIALES.md](./CREDENCIALES.md) (archivo local, no en Git)
3. Avísame en el chat: «listo GoDaddy» o pega el link → conecto el resto

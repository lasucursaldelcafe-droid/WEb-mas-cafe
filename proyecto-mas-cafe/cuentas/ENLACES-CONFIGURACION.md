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
| **`SUPABASE_URL`** | URL del proyecto wallet | Supabase → Settings → API |
| **`SUPABASE_ANON_KEY`** | Clave pública (frontend) | Supabase → Settings → API → anon |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Seed + CI (nunca en frontend) | Supabase → Settings → API → service_role |
| **`SUPABASE_ACCESS_TOKEN`** | Deploy automático CLI | https://supabase.com/dashboard/account/tokens |
| **`SUPABASE_PROJECT_REF`** | ID corto del proyecto | Supabase → Settings → General → Reference ID |
| `FIREBASE_TOKEN` | *(legacy)* Solo hosting Firebase | Obsoleto para wallet |
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

## Supabase (backend wallet — plan gratuito)

> **Migración desde Firebase:** Cloud Functions exige plan Blaze (facturación). Supabase incluye Auth, Postgres y Edge Functions en el tier gratis.

| Qué configurar | Enlace |
|----------------|--------|
| Crear proyecto (gratis) | https://supabase.com/dashboard/new/new-project |
| Token CLI (CI/CD) | https://supabase.com/dashboard/account/tokens |
| GitHub Secrets | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions |
| Workflow deploy | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/deploy-supabase-wallet.yml |

**Secrets requeridos:**

| Secret | Para qué |
|--------|----------|
| `SUPABASE_URL` | URL del proyecto (`https://xxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Clave anon — se embebe en el build de `/wallet/` |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed del programa + Edge Function (solo CI) |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI en GitHub Actions |
| `SUPABASE_PROJECT_REF` | Reference ID del proyecto |

**Pasos (una sola vez):**

1. Crear proyecto en Supabase (región `South America` recomendada).
2. Settings → API → copiar URL, anon key y service_role.
3. Account → Access Tokens → crear token para CI.
4. Pegar los 5 secrets en GitHub.
5. Supabase → Authentication → Providers → activar **Email** y **Google** (Redirect URL: `https://xn--mascaf-gva.com/wallet/`).
6. Ejecutar workflow **Deploy wallet Supabase** o `npm run wallet:setup`.

**Conectar todo de una vez (local):**

1. Copiar `.env.example` → `.env.local` y pegar las 5 claves Supabase + `GITHUB_TOKEN`.
2. Ejecutar: `npm run wallet:connect`  
   (sube secrets, configura redirects, despliega backend y republica GitHub Pages)

**Comandos:**

| Comando | Qué hace |
|---------|----------|
| `npm run wallet:diagnose` | Verifica secrets y si responde la Edge Function |
| `npm run wallet:setup` | Migraciones SQL + deploy function + seed programa |

**Wallet en vivo (frontend GitHub Pages):**

- https://xn--mascaf-gva.com/wallet/
- https://xn--mascaf-gva.com/caja/

---

## Firebase (legacy — solo hosting estático)

Proyecto: **mas-cafe-c8413** — ya no se usa para la wallet (requiere Blaze).

| Enlace | Notas |
|--------|-------|
| https://console.firebase.google.com/project/mas-cafe-c8413 | Consola legacy |
| https://mas-cafe-c8413.web.app/ | Hosting respaldo |

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

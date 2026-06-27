# Firebase — Más Café (mas-cafe-c8413)

## URLs del sitio

| URL |
|-----|
| **https://mas-cafe-c8413.web.app/** |
| **https://mas-cafe-c8413.firebaseapp.com/** |

---

## Si tu organización bloquea claves JSON

Mensaje típico en Firebase Console:

> *No se permite crear claves en esta cuenta de servicio. Verifica si las políticas de la organización restringen la creación de claves.*

**No necesitas una clave JSON** para publicar. Usa una de estas opciones (de más simple a más avanzada):

---

## Opción A — Deploy desde tu computador (recomendada)

No usa claves de cuenta de servicio. Solo inicio de sesión con tu cuenta de Google.

### 1. Activar Hosting (una vez)

Firebase Console → **Hosting** → **Comenzar**

### 2. Publicar

```bash
npm install
npx firebase login
npm run deploy:firebase
```

Tu cuenta de Google debe tener rol **Editor** o **Firebase Hosting Admin** en el proyecto `mas-cafe-c8413`.

### 3. Repetir cuando cambies contenido

```bash
# Edita content/site.json, luego:
npm run deploy:firebase
```

---

## Opción B — GitHub Actions con token CI (sin clave JSON)

Usa `firebase login:ci`, que genera un **token de refresco** (no es una clave de cuenta de servicio).

### 1. Generar el token en tu PC

```bash
npx firebase login:ci
```

Se abre el navegador. Inicia sesión con la cuenta que tiene acceso al proyecto. Copia el token que aparece en la terminal.

### 2. Guardar en GitHub

Repo **WEb-mas-cafe** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Nombre | Valor |
|--------|-------|
| `FIREBASE_TOKEN` | El token que copiaste |

### 3. Publicar

- Push a `main`, o
- **Actions** → **Publicar en Firebase Hosting** → **Run workflow**

> El token puede expirar si cambias la contraseña o revocas acceso. Si falla el deploy, genera uno nuevo con `firebase login:ci`.

---

## Opción C — Workload Identity Federation (empresas)

Si también bloquean tokens CI, un administrador de Google Cloud puede configurar autenticación sin claves con OIDC + GitHub Actions.

Requiere permisos de administrador en GCP. Guía oficial:  
https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines

Variables de repositorio en GitHub (**Settings** → **Variables** → **Actions**):

| Variable | Ejemplo |
|----------|---------|
| `WIF_PROVIDER` | `projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github` |
| `WIF_SERVICE_ACCOUNT` | `firebase-deploy@mas-cafe-c8413.iam.gserviceaccount.com` |

La cuenta de servicio necesita rol `roles/firebasehosting.admin` (sin crear clave JSON).

---

## Opción D — Clave JSON (solo si tu org lo permite)

Si **sí** puedes generar claves:

1. https://console.firebase.google.com/project/mas-cafe-c8413/settings/serviceaccounts/adminsdk
2. **Generar nueva clave privada**
3. Secret en GitHub: `FIREBASE_SERVICE_ACCOUNT` = contenido del JSON

---

## Configuración Firebase del sitio

Proyecto: `mas-cafe-c8413`  
Config web en: `mas-cafe/js/firebase-config.js` (generado al hacer build)

---

## Actualizar contenido

1. Edita `content/site.json`
2. `npm run build:mas-cafe` o `npm run deploy:firebase`
3. Si usas GitHub Actions, push a `main`

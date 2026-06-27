# Firebase — Más Café (mas-cafe-c8413)

## URLs del sitio

| URL |
|-----|
| **https://mas-cafe-c8413.web.app/** |
| **https://mas-cafe-c8413.firebaseapp.com/** |

---

## Publicar desde tu computador

```bash
npm install
npm run deploy:firebase
```

La primera vez:

```bash
npx firebase login
```

---

## Publicar automático (GitHub Actions)

### 1. Generar clave de cuenta de servicio

1. https://console.firebase.google.com/project/mas-cafe-c8413/settings/serviceaccounts/adminsdk
2. **Generar nueva clave privada** → descarga el JSON
3. GitHub repo **WEb-mas-cafe** → **Settings** → **Secrets** → **Actions**
4. Nuevo secret: `FIREBASE_SERVICE_ACCOUNT` = contenido del JSON

### 2. Activar Hosting en Firebase (si no lo hiciste)

1. Firebase Console → **Hosting** → **Comenzar**
2. Push a `main` o **Actions** → **Publicar en Firebase Hosting** → Run

---

## Configuración Firebase

Proyecto: `mas-cafe-c8413`  
Config en: `mas-cafe/js/firebase-config.js` (generado al hacer build)

---

## Actualizar contenido

1. Edita `content/site.json`
2. `npm run build:mas-cafe` o push a `main`

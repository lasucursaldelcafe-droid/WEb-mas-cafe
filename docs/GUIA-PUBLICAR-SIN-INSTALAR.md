# Publicar Más Café SIN instalar nada en tu PC

**Tiempo estimado:** 15–20 minutos  
**Solo necesitas:** navegador (Chrome/Edge) y tu cuenta de Google del proyecto Firebase.

> **Importante:** Ningún asistente ni herramienta debe pedirte “acceso total” a tu computador (TeamViewer, AnyDesk, contraseñas, etc.). Eso no es necesario y es un riesgo de seguridad. Esta guía usa solo servicios oficiales de Google y GitHub.

---

## ¿Por qué no puedo instalar en tu PC?

El agente de Cursor trabaja en un servidor en la nube. **No puede entrar a tu Windows/Mac** ni instalar programas ahí. Lo que sí puedes hacer tú (o con ayuda de alguien de confianza) es seguir estos pasos en el **navegador** o con **un solo instalador** (guía alternativa al final).

---

## Método recomendado: Google Cloud Shell (0 instalaciones)

Cloud Shell es una terminal **dentro del navegador**. Ya trae Node.js y Git.

### Paso 1 — Abrir Cloud Shell

1. Entra a: https://console.cloud.google.com/
2. Arriba, junto al nombre del proyecto, haz clic en el selector de proyecto.
3. Elige **`mas-cafe-c8413`** (Más Café).
4. Arriba a la derecha, haz clic en el icono **`>_`** (**Activar Cloud Shell**).
5. Espera a que abra el panel negro abajo (la terminal).

### Paso 2 — Activar Firebase Hosting (solo la primera vez)

1. En otra pestaña: https://console.firebase.google.com/project/mas-cafe-c8413/hosting
2. Si dice **Comenzar** o **Get started**, haz clic y sigue los pasos (puedes cancelar el asistente después; solo necesitas que Hosting quede habilitado).

### Paso 3 — Token de GitHub (repo privado)

Como el repo es privado, Cloud Shell necesita permiso para clonarlo.

1. GitHub → tu foto → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. **Generate new token (classic)**.
3. Nombre: `cloud-shell-mas-cafe`.
4. Marca solo: **`repo`** (acceso completo a repos privados).
5. **Generate token** → **copia el token** (empieza con `ghp_`). Guárdalo un momento; no lo compartas en chats públicos.

### Paso 4 — Clonar el proyecto en Cloud Shell

En la terminal de Cloud Shell, pega (cambia `TU_TOKEN` por el token que copiaste):

```bash
git clone https://TU_TOKEN@github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
git checkout main
git pull
```

Si ya mergeaste el PR de Firebase, `main` tendrá la config lista. Si no:

```bash
git fetch origin cursor/firebase-mas-cafe-c8413-5352
git checkout cursor/firebase-mas-cafe-c8413-5352
```

### Paso 5 — Instalar dependencias y publicar

```bash
npm install
npx firebase login --no-localhost
```

`firebase login --no-localhost` mostrará una **URL** y un **código**:

1. Copia la URL → ábrela en una pestaña nueva.
2. Inicia sesión con la **misma cuenta de Google** que usa Firebase `mas-cafe-c8413`.
3. Pega el código cuando lo pida.
4. Vuelve a Cloud Shell; debería decir que el login fue exitoso.

Luego publica:

```bash
npm run deploy:firebase
```

Al terminar verás algo como:

```
✔  Deploy complete!
Hosting URL: https://mas-cafe-c8413.web.app
```

### Paso 6 — Verificar

Abre en el navegador:

- https://mas-cafe-c8413.web.app/
- https://mas-cafe-c8413.firebaseapp.com/

---

## Automatizar futuros deploys (opcional)

Para no repetir Cloud Shell cada vez que cambies el sitio:

### Una vez en Cloud Shell

```bash
npx firebase login:ci --no-localhost
```

Copia el **token largo** que imprime.

### En GitHub

1. Repo **WEb-mas-cafe** → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret**:
   - Name: `FIREBASE_TOKEN`
   - Secret: pega el token.

### Cada actualización

1. Editas `content/site.json` (en GitHub web o en tu editor).
2. Push a `main`.
3. GitHub Actions despliega solo (workflow **Publicar en Firebase Hosting**).

---

## Si prefieres instalar Node en tu PC (Windows)

Ver guía: [GUIA-INSTALAR-WINDOWS.md](./GUIA-INSTALAR-WINDOWS.md)

O ejecuta el script (PowerShell como administrador):

```powershell
# Desde la carpeta del proyecto clonado:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\publicar-windows.ps1
```

---

## Problemas frecuentes

| Error | Solución |
|-------|----------|
| `403` al clonar | Token GitHub incorrecto o sin permiso `repo` |
| `Firebase CLI login failed` | Usa la misma cuenta Google que es dueña del proyecto Firebase |
| `HTTP Error: 403` en deploy | Tu cuenta necesita rol **Editor** o **Firebase Hosting Admin** en el proyecto |
| Hosting 404 después del deploy | Espera 1–2 minutos y recarga; verifica que Hosting esté activado |
| Org bloquea claves JSON | **No las necesitas** con este método |

---

## Resumen en 4 líneas

1. Cloud Shell en https://console.cloud.google.com/ (proyecto `mas-cafe-c8413`).
2. Clonar repo con token GitHub.
3. `npm install` → `npx firebase login --no-localhost` → `npm run deploy:firebase`.
4. Abrir https://mas-cafe-c8413.web.app/

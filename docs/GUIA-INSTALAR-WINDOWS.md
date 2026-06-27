# Instalar todo en Windows (paso a paso)

Usa esta guía **solo si quieres trabajar desde tu PC** en lugar de Cloud Shell.

**Alternativa sin instalar nada:** [GUIA-PUBLICAR-SIN-INSTALAR.md](./GUIA-PUBLICAR-SIN-INSTALAR.md)

---

## Paso 1 — Instalar Node.js

### Opción A: Instalador oficial (más fácil)

1. Abre: https://nodejs.org/
2. Descarga la versión **LTS** (botón verde).
3. Ejecuta el instalador → **Next** en todo → marca **Automatically install necessary tools** si aparece.
4. Reinicia **PowerShell** o **Símbolo del sistema**.

### Opción B: Con winget (Windows 11)

Abre **PowerShell como administrador**:

```powershell
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
```

Cierra y vuelve a abrir PowerShell.

### Verificar

```powershell
node --version
npm --version
```

Deberías ver números de versión (ej. `v22.x.x` y `10.x.x`).

---

## Paso 2 — Instalar Git (si no lo tienes)

1. https://git-scm.com/download/win
2. Instalar con opciones por defecto.

```powershell
git --version
```

---

## Paso 3 — Clonar el repositorio

Elige una carpeta (ej. Documentos):

```powershell
cd $HOME\Documents
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
```

Si el repo es privado, GitHub pedirá usuario y **Personal Access Token** (no tu contraseña normal). Crea uno en GitHub → Settings → Developer settings → Personal access tokens → permiso `repo`.

---

## Paso 4 — Activar Firebase Hosting

1. https://console.firebase.google.com/project/mas-cafe-c8413/hosting
2. Clic en **Comenzar** si aún no está activo.

---

## Paso 5 — Instalar dependencias del proyecto

```powershell
npm install
```

---

## Paso 6 — Iniciar sesión en Firebase

```powershell
npx firebase login
```

Se abre el navegador → inicia sesión con la cuenta de Google del proyecto **mas-cafe-c8413**.

---

## Paso 7 — Publicar el sitio

```powershell
npm run deploy:firebase
```

Al finalizar:

```
Hosting URL: https://mas-cafe-c8413.web.app
```

Abre esa URL en el navegador.

---

## Actualizar el sitio después

1. Edita `content\site.json`.
2. En PowerShell, dentro de la carpeta del proyecto:

```powershell
npm run deploy:firebase
```

---

## Script automático (opcional)

Desde la carpeta del proyecto, PowerShell **como administrador**:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\publicar-windows.ps1
```

El script intenta instalar Node con winget y muestra los siguientes pasos.

---

## Automatizar con GitHub Actions

```powershell
npx firebase login:ci
```

Copia el token → GitHub repo → Settings → Secrets → `FIREBASE_TOKEN`.

Cada push a `main` publicará solo.

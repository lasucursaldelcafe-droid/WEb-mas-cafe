# Publicar en Firebase Hosting

Firebase Hosting publica el sitio **públicamente** aunque el repositorio de GitHub sea privado.

---

## Paso 1: Crear proyecto Firebase (5 minutos)

1. Abre https://console.firebase.google.com
2. **Agregar proyecto** → nombre: `Más Café` (o el que prefieras)
3. ID sugerido: `mas-cafe-col` (anótalo)
4. No necesitas Google Analytics para el hosting
5. En el menú lateral: **Build** → **Hosting** → **Comenzar**

---

## Paso 2: Configurar el proyecto en el código

Edita `.firebaserc` y pon tu ID de proyecto:

```json
{
  "projects": {
    "default": "TU-PROYECTO-ID"
  }
}
```

---

## Paso 3: Publicar desde tu computador

```bash
npm install
npm run deploy:firebase
```

La primera vez te pedirá iniciar sesión:

```bash
npx firebase login
```

Al terminar verás la URL pública, por ejemplo:

**https://mas-cafe-col.web.app**

**https://mas-cafe-col.firebaseapp.com**

---

## Paso 4: Deploy automático (GitHub Actions)

Para que cada `push` a `main` publique solo:

### A) Crear cuenta de servicio

1. Firebase Console → ⚙️ **Configuración del proyecto**
2. **Cuentas de servicio** → **Generar nueva clave privada** (JSON)
3. Guarda el archivo JSON

### B) Secrets en GitHub

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Valor |
|--------|-------|
| `FIREBASE_PROJECT_ID` | Tu ID de proyecto (ej. `mas-cafe-col`) |
| `FIREBASE_SERVICE_ACCOUNT` | Contenido completo del JSON de la cuenta de servicio |

### C) Listo

Cada push a `main` ejecuta **Publicar en Firebase Hosting** y actualiza el sitio.

---

## Actualizar contenido

1. Edita `content/site.json`
2. Push a `main` (automático) o `npm run deploy:firebase` (manual)

---

## Dominio mascafecol.com (opcional)

Firebase Console → Hosting → **Agregar dominio personalizado** → `mascafecol.com`

Sigue las instrucciones DNS en GoDaddy (registros que te da Firebase).

---

## Enlaces útiles

| Recurso | URL |
|---------|-----|
| Consola Firebase | https://console.firebase.google.com |
| Documentación Hosting | https://firebase.google.com/docs/hosting |

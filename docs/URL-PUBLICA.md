# Sitio público Más Café — igual que La Sucursal

Mismo Firebase que **La Sucursal del Café** (`la-sucursal-del-cafe`).

## URL del sitio (cuando esté publicado)

**https://mas-cafe.web.app**

(Como La Sucursal: https://la-sucursal-del-cafe.web.app/)

---

## Por qué no abría antes

1. El repo de GitHub es **privado** → jsDelivr y GitHub Pages no funcionan.
2. Faltaba el secret **FIREBASE_SERVICE_ACCOUNT** en este repo.
3. La Sucursal ya usa Firebase y funciona sin instalar nada en tu PC.

---

## Activar (una sola vez — 2 minutos)

### Copiar el secret de Firebase desde La Sucursal

1. Abre el repo **feria-cafe-inscripcion** en GitHub  
2. **Settings** → **Secrets and variables** → **Actions**  
3. Copia el valor de `FIREBASE_SERVICE_ACCOUNT`  
4. Abre el repo **WEb-mas-cafe** → **Settings** → **Secrets** → **New secret**  
5. Nombre: `FIREBASE_SERVICE_ACCOUNT`  
6. Pega el mismo JSON  

### Publicar

Haz un push a `main` o en GitHub → **Actions** → **Publicar en Firebase** → **Run workflow**.

En ~1 minuto el sitio queda en **https://mas-cafe.web.app**

---

## Publicar desde tu computador

```bash
npm install
npm run build:mas-cafe
npx firebase login
npm run deploy:firebase
```

---

## Actualizar contenido

1. Edita `content/site.json`  
2. Push a `main` → se publica solo  

O manualmente: `npm run deploy:firebase`

---

## Estructura (como La Sucursal)

```
mas-cafe/
  index.html      ← sitio completo (HTML puro)
  images/         ← logos y fotos (solo las que usa el sitio)
```

No necesitas Next.js ni servidor local para ver el sitio publicado.

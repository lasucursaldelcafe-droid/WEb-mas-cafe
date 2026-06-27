# Guía de despliegue en GoDaddy — Más Café

Esta guía explica cómo publicar la web en tu hosting y dominio de GoDaddy (cPanel con Node.js).

**Dominio objetivo:** `mascafecol.com`  
**Requisito:** plan GoDaddy con **Setup Node.js App** en cPanel (Web Hosting Deluxe/Ultimate o VPS).

---

## 1. Preparar el paquete en tu computador

En la carpeta del proyecto:

```bash
npm install
npm run health-check
npm run godaddy:prep
```

Esto genera:

- `deploy/mascafe-web/` — carpeta lista para el servidor
- `deploy/mascafe-web-godaddy.zip` — archivo para subir por FTP o Administrador de archivos

> **Importante:** compila en Linux (o en este entorno cloud). No subas `node_modules` compilado en Windows si el servidor es Linux.

---

## 2. Subir archivos a GoDaddy

1. Entra a **GoDaddy → Mi producto → Hosting → Administrar**
2. Abre **cPanel**
3. Ve a **Administrador de archivos**
4. Crea la carpeta `mascafe-web` (recomendado fuera de `public_html`, ej. en la raíz del usuario: `~/mascafe-web`)
5. Sube `mascafe-web-godaddy.zip` y **extrae** el contenido ahí
6. Verifica que existan:
   - `server.js`
   - `package.json`
   - `node_modules/`
   - `.next/`
   - `public/`
   - `content/`

---

## 3. Crear la aplicación Node.js en cPanel

1. En cPanel → **Software** → **Setup Node.js App** (o "Aplicación Node.js")
2. Clic en **Create Application**
3. Configura:

| Campo | Valor |
|-------|-------|
| Node.js version | **18** o **20** (la más alta disponible) |
| Application mode | **Production** |
| Application root | `mascafe-web` |
| Application URL | tu dominio (`mascafecol.com`) |
| Application startup file | `server.js` |

4. En **Environment variables** agrega:

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `HOSTNAME` | `0.0.0.0` |
| `ADMIN_PASSWORD` | `mascafe2025` (cámbiala después) |

5. Clic en **Create**

---

## 4. Permisos y arranque

1. En Terminal de cPanel (o SSH):

```bash
cd ~/mascafe-web
chmod -R 755 content
```

La carpeta `content/` debe ser **escribible** para que el panel admin guarde cambios.

2. En Setup Node.js App → tu aplicación:
   - Si aparece **Run NPM Install**, ejecútalo (opcional si ya viene `node_modules` en el ZIP)
   - Clic en **Start App** o **Restart**

3. Abre `https://mascafecol.com` en el navegador.

---

## 5. Conectar el dominio

Si el dominio está en GoDaddy pero apunta a otro sitio:

1. **GoDaddy → DNS** del dominio `mascafecol.com`
2. Asegura un registro **A** apuntando a la IP de tu hosting
3. O un **CNAME** según indique GoDaddy para el hosting compartido
4. En cPanel → **Dominios** → asocia `mascafecol.com` a la app Node.js

Espera 15–60 minutos para propagación DNS.

---

## 6. SSL (HTTPS)

En cPanel → **SSL/TLS Status** → activa **Let's Encrypt** para `mascafecol.com`.

---

## 7. Verificar que todo funciona

| URL | Debe mostrar |
|-----|----------------|
| `/` | Home |
| `/cafe` | Página café |
| `/menu` | Menú |
| `/admin/login` | Login admin |
| `/admin` | Dashboard (tras login) |

**Login admin:**
- Usuario: `admin`
- Contraseña: `mascafe2025`

El sitio público **no pide contraseña**.

---

## 8. Actualizar la web en el futuro

1. En local: `npm run godaddy:prep`
2. Sube el nuevo ZIP a GoDaddy (reemplaza archivos)
3. En cPanel → **Restart** la app Node.js

---

## Solución de problemas

### Error 503
- La app Node.js no está corriendo → **Start App** en cPanel
- Revisa logs en Setup Node.js App → **Open Logs**

### Página en blanco o sin estilos
- Falta `.next/static` → vuelve a ejecutar `npm run godaddy:prep` y sube todo de nuevo

### El admin no guarda cambios
- Permisos: `chmod -R 775 content` en el servidor

### Imágenes rotas
- Verifica que la carpeta `public/images/` se subió completa

---

## Alternativa: Firebase (opcional)

Para datos en la nube en lugar de JSON local, configura en cPanel las variables `FIREBASE_*` y `NEXT_PUBLIC_FIREBASE_*`. Ver `.env.example`.

---

## Contacto técnico

Si tu plan GoDaddy **no tiene Node.js**, opciones:
1. Actualizar a un plan con Node.js
2. Usar **GoDaddy VPS** con Node 18+
3. Contactar soporte GoDaddy y preguntar por "Setup Node.js App" en cPanel

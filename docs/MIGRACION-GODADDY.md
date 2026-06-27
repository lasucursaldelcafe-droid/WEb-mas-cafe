# Despliegue estático en GoDaddy — Más Café

Sitio **100% estático** para hosting compartido de GoDaddy (`public_html`).  
**Dominio:** `mascafecol.com`

> El panel admin no está incluido en esta versión estática.  
> Para cambiar contenido, edita `content/site.json` y vuelve a ejecutar `npm run godaddy:prep`.

---

## 1. Generar el sitio

```bash
npm install
npm run health-check
npm run godaddy:prep
```

Resultado:
- `out/` — archivos HTML del sitio
- `deploy/mascafe-web-godaddy.zip` — subir a GoDaddy

---

## 2. Subir a GoDaddy

1. **GoDaddy** → tu hosting → **Administrar** → **cPanel**
2. **Administrador de archivos** → abre `public_html`
3. **Respalda** lo que haya (si aplica)
4. Borra el contenido viejo de `public_html`
5. Sube `mascafe-web-godaddy.zip`
6. **Extrae** el ZIP dentro de `public_html`
7. Verifica que en la raíz estén:
   - `index.html`
   - `.htaccess`
   - carpetas `_next/`, `cafe/`, `menu/`, etc.

---

## 3. Dominio

Si el dominio `mascafecol.com` ya está en este hosting, debería funcionar al instante.

Si el dominio está en GoDaddy pero apunta a otro lado:
1. **GoDaddy → DNS** del dominio
2. Registro **A** → IP de tu hosting (la muestra cPanel)
3. Espera 15–60 min (propagación DNS)

---

## 4. SSL (HTTPS)

En cPanel → **SSL/TLS Status** → activa **Let's Encrypt** para `mascafecol.com`.

---

## 5. Verificar

| URL | Página |
|-----|--------|
| `https://mascafecol.com/` | Inicio |
| `https://mascafecol.com/cafe/` | Café |
| `https://mascafecol.com/menu/` | Menú |
| `https://mascafecol.com/nosotros/` | Nosotros |
| `https://mascafecol.com/tienda/` | Tienda |
| `https://mascafecol.com/blog/` | Blog |
| `https://mascafecol.com/contacto/` | Contacto |

**No se pide contraseña** en ninguna página pública.

---

## 6. Actualizar contenido

1. Edita `content/site.json` (productos, menú, textos, blog)
2. Ejecuta `npm run godaddy:prep`
3. Sube el nuevo ZIP a `public_html`

---

## Solución de problemas

### Página en blanco
- ¿Existe `index.html` en `public_html`? Debe estar en la raíz, no dentro de una subcarpeta.

### Sin estilos / imágenes rotas
- Asegúrate de subir **todo** el ZIP, incluida la carpeta `_next/`

### Error 404 en rutas
- Verifica que `.htaccess` se subió (archivos que empiezan con `.` a veces se ocultan)
- En Administrador de archivos → **Configuración** → activa "Mostrar archivos ocultos"

### Enlaces no funcionan
- Las rutas usan barra final: `/cafe/`, `/menu/`, etc.

---

## Requisitos del plan GoDaddy

Cualquier plan con **hosting web estándar** (cPanel + `public_html`) sirve.  
**No necesitas Node.js** en esta versión estática.

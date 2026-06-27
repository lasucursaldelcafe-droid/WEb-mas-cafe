# Publicar en GitHub Pages + dominio GoDaddy

Hosting **gratis** con GitHub Pages. El dominio `mascafecol.com` (en GoDaddy) apunta a GitHub.

**No necesitas hosting de GoDaddy** — solo el dominio.

---

## Paso 1 — Activar GitHub Pages en el repositorio

1. Abre: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe
2. **Settings** → **Pages**
3. En **Build and deployment** → **Source**: elige **GitHub Actions**
4. Guarda

---

## Paso 2 — Publicar el sitio (automático)

Cada vez que se hace push a `main`, GitHub Actions:
1. Compila el sitio estático (`npm run build`)
2. Lo publica en GitHub Pages

También puedes lanzarlo manualmente:
- Pestaña **Actions** → **Deploy GitHub Pages** → **Run workflow**

URL temporal (mientras configuras DNS):
`https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/`

---

## Paso 3 — Configurar dominio en GitHub

1. **Settings** → **Pages** → **Custom domain**
2. Escribe: `mascafecol.com`
3. Clic en **Save**
4. Espera la verificación DNS (puede tardar unos minutos)

El archivo `public/CNAME` ya incluye `mascafecol.com` en el build.

---

## Paso 4 — DNS en GoDaddy (solo dominio, sin hosting)

1. Entra a **GoDaddy** → **Mis productos** → dominio `mascafecol.com`
2. **DNS** o **Administrar DNS**

### Registros para el dominio raíz (`mascafecol.com`)

Agrega **4 registros tipo A** apuntando a las IPs de GitHub Pages:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |

### Opcional — subdominio `www`

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| CNAME | www | lasucursaldelcafe-droid.github.io | 600 |

3. **Elimina** registros A o CNAME viejos que apunten al hosting de GoDaddy (si los hay)
4. Espera **15 minutos a 48 horas** (propagación DNS)

---

## Paso 5 — HTTPS

En GitHub → **Settings** → **Pages** → activa **Enforce HTTPS** cuando el dominio esté verificado.

---

## Verificar que funciona

| URL | Debe mostrar |
|-----|--------------|
| `https://mascafecol.com/` | Inicio |
| `https://mascafecol.com/cafe/` | Café |
| `https://mascafecol.com/menu/` | Menú |
| `https://mascafecol.com/contacto/` | Contacto |

---

## Actualizar contenido del sitio

1. Edita `content/site.json` en GitHub (o en local y haz push)
2. GitHub Actions vuelve a desplegar solo
3. En 1–3 minutos el sitio se actualiza

### Editar desde GitHub (sin instalar nada)

1. Repo → `content/site.json` → lápiz ✏️
2. Cambia textos, productos, menú
3. **Commit changes**
4. Espera el deploy en **Actions**

---

## Build local (opcional)

```bash
npm install
npm run build      # genera carpeta out/
npm run health-check
```

---

## Solución de problemas

### El dominio no carga
- Revisa DNS en GoDaddy (los 4 registros A)
- Usa https://dnschecker.org para ver propagación

### GitHub Pages no despliega
- **Settings → Pages → Source** debe ser **GitHub Actions**
- Revisa la pestaña **Actions** por errores en el workflow

### CSS o imágenes rotas
- Asegúrate de que el último workflow terminó en verde ✅

### Quiero www en lugar de raíz
- En GitHub Pages pon `www.mascafecol.com` como custom domain
- En GoDaddy: CNAME `www` → `lasucursaldelcafe-droid.github.io`

---

## Resumen

| Qué | Dónde |
|-----|-------|
| Código | GitHub (gratis) |
| Hosting | GitHub Pages (gratis) |
| Dominio | GoDaddy (solo DNS) |
| Cambios de contenido | Editar `content/site.json` + push |

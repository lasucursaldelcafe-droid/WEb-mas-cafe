# Terminar el proyecto — guía paso a paso

**Objetivo:** sitio en **https://www.mascafé.com** con candado verde, contenido actualizado y (opcional) wallet de fidelización.

**Estado al 2026-07-19:**

| Fase | Estado |
|------|--------|
| Sitio HTML en GitHub Pages | ✅ En línea |
| DNS GoDaddy → GitHub | ✅ Correcto |
| HTTP mascafé.com | ✅ Responde 200 |
| HTTPS / candado | ❌ **Pendiente** (certificado GitHub atascado) |
| Wallet Supabase | ⏳ Backend listo; falta HTTPS y Google Wallet SA |
| Correo Zoho | ⏳ Configurar MX si aún no está activo |

---

## Paso 0 — Diagnóstico rápido

En tu PC (Windows) o en Cloud Shell:

```bash
git pull origin main
npm install
npm run project:status
```

Interpretación:

- **DNS OK + HTTP OK + HTTPS bloqueado** → sigue Pasos 1–3 (tu caso actual).
- **Todo ✅** → salta al Paso 4 (contenido y entrega).
- **DNS bloqueado** → `npm run domain:configure` primero.

---

## Paso 1 — Credenciales en tu PC (15 min)

### 1.1 Clonar el repo

```powershell
cd $HOME\Documents
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
```

### 1.2 Crear `.env.local`

```powershell
copy .env.example .env.local
notepad .env.local
```

Rellena **obligatorio para HTTPS**:

```env
GODADDY_API_KEY=...
GODADDY_API_SECRET=...
GH_PAGES_PAT=ghp_...
```

| Variable | Dónde obtenerla |
|----------|-----------------|
| `GODADDY_API_*` | https://developer.godaddy.com/keys → Production |
| `GH_PAGES_PAT` | https://github.com/settings/tokens → permisos `repo` + **Administration** |

### 1.3 Validar

```powershell
npm run validate:credentials
```

Debe mostrar ✅ GoDaddy y ✅ GitHub.

---

## Paso 2 — Instalar app Windows automática (10 min)

```powershell
# Requiere Python 3.11+ y Node.js 22+
.\tools\windows-https-agent\install.ps1 -Startup
```

Qué hace:

1. Instala dependencias Python y Node
2. Crea acceso directo **Mas Cafe HTTPS** en el Escritorio
3. Registra tarea **MasCafe-HTTPS-Agent** (cada 3 horas)
4. Abre la app gráfica

En la app:

1. Pulsa **Actualizar** → debe mostrar DNS OK, HTTPS pendiente
2. Pulsa **Reparar vía CI** (usa Secrets de GitHub, más fiable)
3. Deja marcado **Auto-reparar cada 3 horas**

Alternativa sin app:

```powershell
npm run domain:enable-https -- --wait --max-wait=45 --kickstart --aggressive-kickstart --try-www
```

---

## Paso 3 — Desbloquear HTTPS (bloqueador principal)

> **Guía detallada:** [SOLUCION-HTTPS-BLOQUEADO.md](./SOLUCION-HTTPS-BLOQUEADO.md)

GitHub Pages a veces deja el certificado en estado `new` aunque el DNS sea correcto.

### 3.1 Opción A — Automatización (probar 24–48 h)

Ya configurado en el repo:

| Mecanismo | Frecuencia |
|-----------|------------|
| Workflow `enable-https.yml` | Cada 3 h en GitHub Actions |
| App Windows / tarea programada | Cada 3 h en tu PC |
| Manual | `run-fix.bat` o app → Reparar |

Monitor CI: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/enable-https.yml

### 3.2 Opción B — Ticket GitHub Support (si >48 h en `new`)

1. Abre: https://support.github.com/contact
2. Tipo: **GitHub Pages**
3. Asunto: *SSL certificate stuck in "new" for custom domain*
4. Datos a incluir:

```
Repo: lasucursaldelcafe-droid/WEb-mas-cafe
Custom domain: www.xn--mascaf-gva.com (mascafé.com)
DNS: 4 A records → 185.199.108–111.153, CNAME www → lasucursaldelcafe-droid.github.io
Health: domain is_valid=true, is_https_eligible=true
Certificate state: new (stuck >7 days)
HTTP works: http://www.mascafé.com returns 200
HTTPS fails: certificate not issued
```

### 3.3 Opción C — Cloudflare (SSL en ~15 min, cambio de DNS)

Si necesitas HTTPS **ya** y GitHub no emite certificado:

1. Cuenta gratis: https://dash.cloudflare.com/
2. Añadir sitio `mascafé.com`
3. Cambiar nameservers en GoDaddy a los de Cloudflare
4. DNS en Cloudflare:
   - `A` `@` → IPs GitHub (185.199.x.x) **o** CNAME a `lasucursaldelcafe-droid.github.io`
   - `CNAME` `www` → `lasucursaldelcafe-droid.github.io`
5. SSL/TLS → **Full** (no Flexible)
6. Esperar 5–15 min → https://www.mascafé.com con candado

Documentación: `docs/DOMINIO-MASCAFE-COM.md`

### 3.4 Verificar éxito

```bash
npm run domain:verify
npm run project:status
```

Cuando HTTPS funcione, el script actualiza automáticamente `content/settings.json`:

- `seo.siteUrl` → `https://www.mascafé.com`
- `seo.httpsReady` → `true`

Luego:

```bash
npm run build:github-pages
git add content/settings.json
git commit -m "chore(seo): HTTPS activo en mascafé.com"
git push origin main
```

---

## Paso 4 — Cierre fase estática (sitio web)

### 4.1 Comprobaciones finales

| Check | Comando / URL |
|-------|----------------|
| Inicio | https://www.mascafé.com/ |
| Menú, contacto, blog | Navegar manualmente |
| Admin | https://www.mascafé.com/admin/ |
| Informe marca | https://www.mascafé.com/informe/ |
| SEO | `npm run verify:seo` |
| Enlaces rotos | `npm run verify:links` |
| Google Search Console | https://search.google.com/search-console |

### 4.2 Actualizar registro

Marca completado en `proyecto-mas-cafe/cuentas/REGISTRO-HECHO.md`:

- [x] HTTPS certificado + Enforce HTTPS
- [x] Sitio en https://www.mascafé.com

### 4.3 Entregar a dueños Más Café

Documentos de entrega:

| Archivo | Contenido |
|---------|-----------|
| `proyecto-mas-cafe/entregables/README.md` | Resumen URLs |
| `informes/` | Constitución web |
| `proyecto-mas-cafe/cuentas/CREDENCIALES.md` | **Solo local** — cuentas y accesos |

---

## Paso 5 — Fase wallet (opcional, después de HTTPS)

### 5.1 Pendientes técnicos

| Item | Acción |
|------|--------|
| Google Wallet SA | Descargar JSON GCP → `secrets/google-wallet-sa.json` |
| Auth Google en Supabase | Client ID en Google Cloud + Supabase Auth |
| HTTPS obligatorio | Completar Paso 3 primero |
| Reglas de negocio | Completar `content/informe-requisitos.json` → `wallet.reglasNegocio` |

### 5.2 Comandos wallet

```bash
npm run wallet:connect          # Secrets GitHub ↔ Supabase
npm run wallet:google-auto    # Tras pegar SA JSON
npm run test:wallet             # Prueba registro cliente
```

Detalle: `proyecto-mas-cafe/entregables/WALLET-CHECKLIST-GRATIS.md`

### 5.3 Hosting wallet en Vercel (futuro)

Cuando la wallet necesite API en vivo en el dominio:

1. Crear proyecto Vercel → importar repo
2. Secrets reales: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
3. `www` CNAME → Vercel (o subdominio `app.mascafé.com`)

Guía: `docs/VERCEL.md`

---

## Paso 6 — Correo corporativo (paralelo)

```bash
npm run email:status
npm run email:configure
npm run email:verify
```

Buzones objetivo (Zoho):

- `hola@mascafé.com`
- `administracion@mascafé.com`

Panel: https://mailadmin.zoho.com/

---

## Resumen — orden recomendado

```
1. .env.local + validate:credentials
2. install.ps1 (app Windows)
3. Reparar HTTPS (CI + esperar 24–48 h)
   └─ si falla → ticket GitHub o Cloudflare
4. domain:verify + project:status → todo ✅
5. push settings.json + build
6. REGISTRO-HECHO.md actualizado
7. (Opcional) wallet + correo
```

---

## Comandos de referencia

| Comando | Uso |
|---------|-----|
| `npm run project:status` | Diagnóstico completo |
| `npm run domain:verify` | DNS + HTTP/HTTPS |
| `npm run domain:enable-https:cloud` | HTTPS local o delega CI |
| `npm run domain:windows-agent -- gui` | App gráfica Windows |
| `npm run ci:validate` | Validar antes de entregar |
| `npm run preview` | Ver sitio en local |

---

## Ayuda

| Problema | Solución |
|----------|----------|
| «No es seguro» en navegador | Paso 3 — HTTPS |
| Sitio no carga | Paso 1 — DNS / GoDaddy forwarding |
| App Windows no abre | Instalar Python con tkinter + Node.js |
| CI falla en Secrets | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions |

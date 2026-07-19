# Cómo resolver el bloqueador HTTPS (candado verde)

**Problema:** DNS ✅ · HTTP ✅ · HTTPS ❌  
**Causa:** GitHub Pages no emite el certificado SSL (atascado en estado `new` desde junio 2026).  
**No es culpa del DNS** — el sitio ya responde en http://www.mascafé.com

---

## Elige una solución

| Opción | Tiempo | Dificultad | Recomendado si… |
|--------|--------|------------|-----------------|
| **A — Cloudflare** | ~15 min | Media | Quieres HTTPS **hoy** |
| **B — Forzar kickstart** | 1–24 h | Fácil | Quieres seguir solo con GitHub |
| **C — Ticket GitHub** | 2–5 días | Fácil | Llevas semanas atascado (tu caso) |

Puedes hacer **B + C en paralelo**, o ir directo a **A** si necesitas el candado ya.

---

## Opción A — Cloudflare (HTTPS en ~15 min) ⭐ Más rápida

Cloudflare pone el certificado delante de GitHub. El sitio sigue en GitHub Pages.

### A.1 Crear cuenta y añadir dominio

1. Entra: https://dash.cloudflare.com/sign-up
2. **Add a site** → escribe `mascafé.com` (o `xn--mascaf-gva.com`)
3. Plan **Free** → Continue

### A.2 Cambiar nameservers en GoDaddy

Cloudflare te dará 2 nameservers, por ejemplo:
```
ada.ns.cloudflare.com
bob.ns.cloudflare.com
```

En GoDaddy:
1. https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com
2. **Nameservers** → **Change** → **Enter my own nameservers**
3. Pega los 2 de Cloudflare → Save

Espera 5–30 min (propagación).

### A.3 DNS en Cloudflare

En Cloudflare → **DNS** → **Records**:

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| A | `@` | `185.199.108.153` | Proxied (nube naranja) |
| A | `@` | `185.199.109.153` | Proxied |
| A | `@` | `185.199.110.153` | Proxied |
| A | `@` | `185.199.111.153` | Proxied |
| CNAME | `www` | `lasucursaldelcafe-droid.github.io` | Proxied |

**Importante:** la nube naranja (Proxied) debe estar **activada** en todos.

### A.4 SSL en Cloudflare

1. **SSL/TLS** → Overview → modo **Full** (no «Flexible»)
2. **Edge Certificates** → **Always Use HTTPS** → ON
3. Espera 5–15 min

### A.5 Comprobar

Abre https://www.mascafé.com — debe aparecer el candado 🔒

Luego en el repo (cuando funcione):

```bash
npm run build:github-pages
# Editar content/settings.json manualmente o tras enable-https:
# seo.siteUrl = "https://www.mascafé.com"
# seo.httpsReady = true
git add content/settings.json && git commit -m "chore: HTTPS vía Cloudflare" && git push
```

---

## Opción B — Forzar kickstart en GitHub (gratis, sin Cloudflare)

El CI **omitía** el kickstart porque el certificado estaba en `new` (corregido en el último fix del repo).

### B.1 Disparar manualmente el workflow

1. Abre: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/enable-https.yml
2. **Run workflow** → branch `main`
3. `wait_minutes`: **90**
4. `kickstart`: **true**
5. **Run workflow**

Espera ~90 min y revisa los logs. Busca: `Certificado tras kickstart: dns_changed` o `issued`.

### B.2 Desde tu PC Windows

```powershell
cd WEb-mas-cafe
git pull
npm install

# Con .env.local (GODADDY_* + GH_PAGES_PAT):
npm run domain:enable-https -- --wait --max-wait=90 --kickstart --aggressive-kickstart --try-www
```

O con la app:

```powershell
.\tools\windows-https-agent\install.ps1
# App → Reparar vía CI
```

### B.3 Reset manual en GitHub (si B.1/B.2 fallan)

1. https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. **Custom domain** → borrar `www.xn--mascaf-gva.com` → Save
3. Esperar **30 minutos** (no tocar nada)
4. Volver a poner: `www.mascafé.com` → Save
5. Esperar 24–48 h
6. Activar **Enforce HTTPS** cuando aparezca la opción

---

## Opción C — Ticket a GitHub Support

Si llevas **más de 2 semanas** en `new`, GitHub debe desbloquearlo manualmente.

1. https://support.github.com/contact
2. **Product:** GitHub Pages
3. **Subject:** SSL certificate stuck in "new" for custom domain

Pega este texto:

```
Repository: lasucursaldelcafe-droid/WEb-mas-cafe
Custom domain: www.xn--mascaf-gva.com (Unicode: mascafé.com / www.mascafé.com)
Hosting: GitHub Pages (workflow build)

DNS configuration (verified correct):
- Apex A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- www CNAME: lasucursaldelcafe-droid.github.io

Status:
- HTTP works: http://www.mascafé.com returns 200
- HTTPS fails: no certificate issued
- Pages health API: domain is_valid=true, is_https_eligible=true
- Certificate state: "new" since approximately 2026-06-30 (>2 weeks)
- Message: "This domain was recently added. The certificate request process will begin shortly."

We have tried kickstart (remove/re-add custom domain), www fallback, and CAA records for Let's Encrypt. The certificate never progresses past "new".

Please manually trigger or reset the SSL certificate issuance for this custom domain.
```

---

## Después de resolver HTTPS

```powershell
npm run domain:verify
npm run project:status
npm run ci:validate
```

Debe mostrar HTTPS ✅. Luego actualiza `proyecto-mas-cafe/cuentas/REGISTRO-HECHO.md`.

---

## Resumen rápido

```
¿Necesitas HTTPS hoy?
  → Cloudflare (Opción A)

¿Prefieres solo GitHub gratis?
  → Run workflow + kickstart (Opción B)
  → Si en 48 h sigue igual → ticket (Opción C)

¿Qué NO sirve?
  ✗ Volver a configurar DNS (ya está bien)
  ✗ Esperar más sin hacer nada (llevas semanas)
  ✗ Solo abrir el sitio por HTTP (el candado no aparece solo)
```

# Automatizar dominio mascafé.com → GitHub Pages

Un solo comando configura **DNS en GoDaddy** y **custom domain en GitHub Pages**.

---

## Opción A — Desde tu PC (recomendado la primera vez)

### 1. Crear claves API GoDaddy

1. Entra: https://developer.godaddy.com/keys
2. **Create new API key** → Production
3. Copia **Key** y **Secret**

### 2. Crear token GitHub

1. Entra: https://github.com/settings/tokens
2. **Fine-grained token** o Classic con permisos:
   - `repo`
   - **Administration** (o Pages: read/write)
3. Repositorio: `lasucursaldelcafe-droid/WEb-mas-cafe`

### 3. Configurar variables locales

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
GODADDY_API_KEY=tu_key
GODADDY_API_SECRET=tu_secret
GITHUB_TOKEN=ghp_...
```

### 4. Ejecutar

```bash
# Simular (no cambia nada)
npm run domain:configure:dry

# Aplicar de verdad
npm run domain:configure

# Solo verificar DNS/HTTP
npm run domain:verify
```

---

## Opción B — Desde GitHub Actions (sin PC)

1. Añade **Secrets** en el repo:
   - https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions
   - `GODADDY_API_KEY`
   - `GODADDY_API_SECRET`
   - `GITHUB_TOKEN` (PAT con permisos admin si el token por defecto no alcanza)

2. Ejecuta el workflow manual:
   - https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/autonomous-setup.yml
   - O el workflow específico: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/configure-domain.yml
   - Primera vez: `dry_run: true` para ver qué haría
   - Segunda vez: `dry_run: false` para aplicar

Guía completa sin intervención: `proyecto-mas-cafe/migracion/AUTOMATIZACION-AUTONOMA.md`

---

## Qué hace el script automáticamente

| Paso | Acción |
|------|--------|
| 1 | GoDaddy: 4 registros **A** en `@` → IPs GitHub Pages |
| 2 | GoDaddy: **CNAME** `www` → `lasucursaldelcafe-droid.github.io` |
| 3 | GitHub: custom domain `mascafé.com` en Pages |
| 4 | Verifica DNS con `dig` y HTTP con `curl` |
| 5 | Anota en `REGISTRO-HECHO.md` si todo OK |

**Dominio técnico (punycode):** `xn--mascaf-gva.com` — mismo que mascafé.com.

---

## Comandos útiles

| Comando | Uso |
|---------|-----|
| `npm run domain:configure` | Configuración completa |
| `npm run domain:configure:dry` | Simulación |
| `npm run domain:configure -- --skip-godaddy` | Solo GitHub |
| `npm run domain:configure -- --skip-github` | Solo GoDaddy DNS |
| `npm run domain:verify` | Comprobar estado actual |

---

## Si falla GoDaddy API

Algunas cuentas GoDaddy requieren **10+ dominios** para API Production, o dominio en la misma cuenta que la key.

**Alternativa manual:** el script igual configura GitHub; DNS manual en:
https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com

---

## Después de configurar

1. Espera propagación DNS (10 min – 48 h)
2. En GitHub Pages → activa **Enforce HTTPS** cuando el check esté verde
3. Verifica: `npm run domain:verify`
4. Sitio final: https://www.mascafé.com/

---

## Archivos del sistema

| Archivo | Rol |
|---------|-----|
| `scripts/configure-domain.mjs` | Orquestador principal |
| `scripts/verify-domain.mjs` | Verificación |
| `scripts/lib/godaddy-api.mjs` | API GoDaddy |
| `scripts/lib/github-pages-api.mjs` | API GitHub Pages |
| `scripts/lib/domain-config.mjs` | Constantes del dominio |
| `.github/workflows/configure-domain.yml` | Automatización en CI |

# Seguridad y credenciales — ejecución autónoma

Guía para guardar secretos **sin subirlos a Git** y para que Cursor / GitHub Actions ejecuten deploy, dominio y (más adelante) wallet **sin pedirte contraseñas en cada chat**.

---

## Regla de oro

| ✅ Sí | ❌ Nunca |
|-------|----------|
| GitHub **Secrets** (Actions) | Contraseñas en commits |
| `.env.local` en tu PC (gitignored) | Pegar tokens en el chat |
| `CREDENCIALES.md` local (gitignored) | `CREDENCIALES.md` en el repo |
| Decir en chat: «configurado» + link | Reutilizar keys expuestas en chat |

---

## Dónde guardar cada cosa

| Tipo | Dónde | Quién lo usa | Para qué |
|------|-------|--------------|----------|
| Deploy sitio HTML | GitHub Secret `ADMIN_PUBLISH_KEY` | Workflow Pages | Publicar desde `/admin/` (PAT con `contents: write`; si falta, se usa `GH_PAGES_PAT`) |
| **Wallet backend (activo)** | `SUPABASE_URL`, `SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` | Workflow `deploy-supabase-wallet`, build Pages | Auth, Postgres, Edge Functions |
| Google Wallet nativo | `GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_SERVICE_ACCOUNT` (JSON GCP) | Workflow `setup-google-wallet`, secrets Supabase | JWT «Añadir a Google Wallet» |
| DNS GoDaddy | `GODADDY_API_KEY` + `GODADDY_API_SECRET` | Workflows + `npm run domain:configure` | Automatizar mascafé.com |
| GitHub Pages API | `GH_PAGES_PAT` (o `GITHUB_TOKEN` local) | Workflows dominio | Custom domain |
| Desarrollo local / agente | `.env.local` (copiar de `.env.example`) | Cursor en tu máquina | Scripts npm |
| Entrega al dueño | `CREDENCIALES.md` (copiar de plantilla) | Personas | Bloc de notas privado |
| Firebase (legacy) | `FIREBASE_TOKEN` — solo hosting espejo | `deploy-firebase` (desactivado) | **No** usar para wallet |

**Panel Secrets:** https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions

---

## Configuración única (para que yo ejecute sin ti)

### Paso 1 — GitHub Secrets (obligatorio para dominio automático)

1. Abre https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions  
2. Crea o verifica estos secrets:

| Secret | Cómo obtenerlo | Estado |
|--------|----------------|--------|
| `GODADDY_API_KEY` | https://developer.godaddy.com/keys → Production | ☐ |
| `GODADDY_API_SECRET` | Mismo panel (key + secret van juntos) | ☐ |
| `GH_PAGES_PAT` | https://github.com/settings/tokens → `repo` + Pages | ☐ |
| `ADMIN_PUBLISH_KEY` | PAT con `contents: write` en este repo (o deja vacío si `GH_PAGES_PAT` ya lo tiene) | ☐ |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL | ☐ |
| `SUPABASE_ANON_KEY` o `SUPABASE_PUBLISHABLE_KEY` | Clave pública (va en el build de `/wallet/`) | ☐ |
| `SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_SECRET_KEY` | Clave servidor (solo CI, nunca en frontend) | ☐ |
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens | ☐ |
| `SUPABASE_PROJECT_REF` | Settings → General → Reference ID | ☐ |
| `GOOGLE_WALLET_ISSUER_ID` | Pay Console (ya en `content/google-wallet.json`) | ☐ |
| `GOOGLE_WALLET_SERVICE_ACCOUNT` | JSON descargado de GCP (cuenta de servicio Wallet) | ☐ |
| `FIREBASE_SERVICE_ACCOUNT` | *(legacy — no usar para wallet)* | — |

> **Importante:** GitHub no permite un secret llamado `GITHUB_PAT`. Usa `GH_PAGES_PAT`.

### Paso 2 — Local (opcional, para Cursor en tu PC)

```bash
cp .env.example .env.local
# Edita .env.local con los mismos valores (nunca git add)
npm run validate:credentials
```

### Paso 3 — Bloc privado de entrega

```bash
cp proyecto-mas-cafe/cuentas/CREDENCIALES.template.md proyecto-mas-cafe/cuentas/CREDENCIALES.md
```

Rellena `CREDENCIALES.md` para la entrega final a Más Café. **No se sube a Git.**

### Paso 4 — Verificar

```bash
npm run validate:credentials   # GoDaddy + GitHub OK
npm run validate:supabase      # Variables Supabase wallet
npm run domain:configure       # Aplica DNS + custom domain si DNS listo
npm run domain:verify          # Comprueba propagación
```

En la nube (Cursor Cloud Agent), los workflows usan **GitHub Secrets** automáticamente; no necesitas pegar nada en el chat si los secrets están bien.

---

## Qué puedo ejecutar yo sin preguntarte

Con secrets configurados:

| Comando / Workflow | Qué hace |
|--------------------|----------|
| `Publicar HTML en GitHub Pages` | Build + deploy sitio + informe + mockup wallet |
| `Setup autónomo` | Tras deploy: valida credenciales + DNS |
| `Configurar dominio mascafé.com` | GoDaddy DNS + custom domain (solo si DNS público listo) |
| `npm run verify:links` | Comprueba rutas rotas |
| `npm run wallet:setup` | Migraciones SQL + Edge Function + seed programa |
| `Deploy wallet Supabase` | CI: backend wallet en Supabase |
| `Setup Google Wallet` | Issuer + JWT nativo (si hay JSON GCP) |
| `npm run setup:autonomous` | Pipeline completo (dominio + wallet Supabase) |

**Aún necesita decisión humana:** reglas de puntos, premios, términos legales, transferencia de repo a org Más Café, JSON GCP para Google Wallet nativo.

---

## Rotación de credenciales

Si un token se filtró (chat, captura, email):

1. Revócalo en el panel del proveedor (GoDaddy / GitHub / Firebase).
2. Genera par nuevo (GoDaddy: key **y** secret juntos).
3. Actualiza GitHub Secrets y `.env.local`.
4. `npm run validate:credentials`
5. Anota en [REGISTRO-HECHO.md](./REGISTRO-HECHO.md): «rotado GODADDY / GH_PAGES_PAT — fecha».

---

## Migración a GitHub solo de Más Café (futuro)

Cuando exista la org/repo de Más Café:

1. Crear org: https://github.com/organizations/plan  
2. Transferir repo o hacer mirror limpio (sin historial de La Sucursal si lo prefieren).  
3. **Recrear todos los GitHub Secrets** en el repo nuevo.  
4. Reconectar Cursor al repo nuevo.  
5. Actualizar `content/informe-requisitos.json` → `repositorioFuturo`.  
6. `npm run domain:configure` desde el repo nuevo.

Checklist detallado: [../migracion/CHECKLIST.md](../migracion/CHECKLIST.md)

---

## Archivos relacionados

| Archivo | Uso |
|---------|-----|
| [ENLACES-CONFIGURACION.md](./ENLACES-CONFIGURACION.md) | Links a cada panel |
| [CREDENCIALES.template.md](./CREDENCIALES.template.md) | Plantilla bloc privado |
| [REGISTRO-HECHO.md](./REGISTRO-HECHO.md) | Progreso público (sin secretos) |
| [../entregables/WALLET-CHECKLIST-GRATIS.md](../entregables/WALLET-CHECKLIST-GRATIS.md) | Wallet paso a paso (gratis) |
| `/.env.example` | Variables para `.env.local` |

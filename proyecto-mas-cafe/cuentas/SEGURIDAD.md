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
| Deploy sitio HTML | GitHub Secret `ADMIN_PUBLISH_KEY` | Workflow Pages | Publicar desde `/admin/` |
| Deploy Firebase | GitHub Secret `FIREBASE_TOKEN` | Workflow Firebase | Hosting respaldo |
| DNS GoDaddy | `GODADDY_API_KEY` + `GODADDY_API_SECRET` | Workflows + `npm run domain:configure` | Automatizar mascafé.com |
| GitHub Pages API | `GH_PAGES_PAT` (o `GITHUB_TOKEN` local) | Workflows dominio | Custom domain |
| Desarrollo local / agente | `.env.local` (copiar de `.env.example`) | Cursor en tu máquina | Scripts npm |
| Entrega al dueño | `CREDENCIALES.md` (copiar de plantilla) | Personas | Bloc de notas privado |
| Wallet (futuro) | Firebase / Vercel env vars | Backend | Auth, Firestore, OTP |

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
| `ADMIN_PUBLISH_KEY` | String aleatorio largo (tú lo defines) | ☐ |
| `FIREBASE_TOKEN` | `npx firebase login:ci` en tu PC | ☐ |

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
| `npm run setup:autonomous` | Pipeline completo local |

**Aún necesito decisión humana para:** reglas de puntos, premios, términos legales, transferencia de repo a org Más Café, activar facturación Firebase si superan cuotas gratis.

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

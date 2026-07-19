# AGENTS.md — Más Café / WEb-mas-cafe

## Cursor Cloud — variables de entorno

Configura en cursor.com las variables de la tabla (mismos nombres que GitHub Actions).

| Variable | Uso |
|----------|-----|
| `GODADDY_API_KEY` | DNS mascafé.com |
| `GODADDY_API_SECRET` | Par con la key de GoDaddy Production |
| `GH_PAGES_PAT` | PAT con `repo` + `administration` (custom domain + HTTPS) |

Opcional (wallet / admin):

| Variable | Uso |
|----------|-----|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` | Wallet |
| `ADMIN_PUBLISH_KEY` | Publicar desde `/admin/` |

Al arrancar, el entorno ejecuta `node scripts/bootstrap-cloud-env.mjs` y escribe `.env.local` (gitignored) desde esas variables.

## Comandos dominio / HTTPS

```bash
npm run env:bootstrap              # .env.local desde Cursor Secrets
npm run domain:enable-https:cloud  # HTTPS local o delega a CI
npm run domain:verify              # comprobar DNS/HTTP/HTTPS
npm run project:status             # diagnóstico — qué falta para terminar
npm run domain:windows-agent -- status  # agente Python (PC Windows)
```

**Cerrar proyecto:** `proyecto-mas-cafe/migracion/TERMINAR-PROYECTO.md`

**PC Windows (app automática):** ejecuta `.\tools\windows-https-agent\install.ps1` — crea acceso directo en Escritorio y tarea cada 3 h. Ver `tools/windows-https-agent/README.md`.

Si faltan credenciales locales, `domain:enable-https:cloud` abre PR o usa el workflow **Activar HTTPS mascafé.com** (Secrets ya configurados en GitHub).

## Verificación antes de cambios

```bash
npm run ci:validate
```

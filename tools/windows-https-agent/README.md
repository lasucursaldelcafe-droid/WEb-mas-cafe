# Agente Windows — HTTPS mascafé.com

Herramienta **Python + scripts** para tu PC con Windows. Comprueba DNS/SSL, ejecuta los scripts Node del repo y puede quedar en **segundo plano** con el Programador de tareas de Windows.

## Requisitos

| Software | Versión |
|----------|---------|
| Python | 3.11+ ([python.org](https://www.python.org/downloads/)) |
| Node.js | 22+ ([nodejs.org](https://nodejs.org/)) |
| Git | repo clonado en tu PC |

## Credenciales (`.env.local`)

En la **raíz del repo** (no dentro de `tools/`):

```env
GODADDY_API_KEY=tu_key
GODADDY_API_SECRET=tu_secret
GH_PAGES_PAT=ghp_...
```

Cópialas desde GitHub Secrets o créalas según `proyecto-mas-cafe/migracion/AUTOMATIZAR-DOMINIO.md`.

## Instalación en 1 comando

Abre **PowerShell** en la carpeta del repo:

```powershell
.\tools\windows-https-agent\install.ps1
```

Esto hace:

1. Entorno virtual Python en `tools/windows-https-agent/.venv`
2. `pip install -r requirements.txt`
3. `npm ci` en el repo
4. Tarea programada **MasCafe-HTTPS-Agent** (cada 3 horas)
5. **Acceso directo en el Escritorio** → abre la app gráfica
6. Abre la aplicación al terminar

Opciones:

```powershell
# Sin tarea programada (solo instalar Python/npm)
.\tools\windows-https-agent\install.ps1 -SkipSchedule

# Iniciar la app al encender Windows
.\tools\windows-https-agent\install.ps1 -Startup

# Con icono en bandeja del sistema
.\tools\windows-https-agent\install.ps1 -WithTray

# Generar .exe standalone (opcional)
.\tools\windows-https-agent\build-exe.ps1
```

## Aplicación Windows (interfaz gráfica)

Doble clic en **`run-app.bat`** o en el acceso directo **Mas Cafe HTTPS** del Escritorio.

La app muestra:

- Estado DNS, certificado SSL y HTTPS en tiempo real
- Botones: **Reparar ahora**, **Reparar vía CI**, enlaces a GitHub/GoDaddy
- **Auto-reparar cada 3 horas** mientras la ventana esté abierta
- Registro de actividad en la parte inferior

```powershell
npm run domain:windows-agent -- gui
```

## Uso rápido (doble clic)

| Archivo | Acción |
|---------|--------|
| **`run-app.bat`** | **Abrir aplicación Windows (recomendado)** |
| `run-status.bat` | Ver estado DNS / certificado / HTTPS |
| `run-fix.bat` | Reparar HTTPS ahora (npm local) |
| `run-monitor.bat` | Bucle cada 3 h hasta Ctrl+C |

## Línea de comandos

Desde la raíz del repo, con `PYTHONPATH=tools\windows-https-agent`:

```powershell
$env:PYTHONPATH = "tools\windows-https-agent"
.\tools\windows-https-agent\.venv\Scripts\python.exe -m mascafe_agent status
.\tools\windows-https-agent\.venv\Scripts\python.exe -m mascafe_agent fix
.\tools\windows-https-agent\.venv\Scripts\python.exe -m mascafe_agent fix --ci
.\tools\windows-https-agent\.venv\Scripts\python.exe -m mascafe_agent monitor --once
```

O vía npm (desde la raíz):

```bash
npm run domain:windows-agent -- status
npm run domain:windows-agent -- fix
npm run domain:windows-agent -- fix --ci
```

### Comandos

| Comando | Descripción |
|---------|-------------|
| `status` | DNS, certificado GitHub, HTTP/HTTPS |
| `fix` | Ejecuta `npm run domain:enable-https` con kickstart + www |
| `fix --ci` | Dispara workflow GitHub Actions (usa Secrets del repo) |
| `monitor` | Bucle: si HTTPS no está listo, repara y espera |
| `gui` | Aplicación Windows con ventana gráfica |
| `tray` | Icono en bandeja (requiere `-WithTray` en install) |

## Qué hace automáticamente

1. Lee `.env.local`
2. Comprueba DNS apex + www y estado del certificado en GitHub Pages
3. Si falta HTTPS → ejecuta la misma lógica que CI (`enable-https.mjs`):
   - kickstart SSL si el cert está atascado
   - fallback `www` si el apex no emite certificado
   - CAA Let's Encrypt en GoDaddy (si hay credenciales)
4. Registra todo en `tools/windows-https-agent/logs/agent.log`

## Sin credenciales GoDaddy en el PC

Si solo tienes `GH_PAGES_PAT`:

```powershell
python -m mascafe_agent fix --skip-godaddy
python -m mascafe_agent fix --ci
```

`--ci` usa los Secrets ya configurados en GitHub Actions (recomendado si el PAT local no tiene permisos Pages).

## Programador de tareas

Tras `install.ps1`, la tarea **MasCafe-HTTPS-Agent** corre cada **3 horas** y ejecuta un ciclo `monitor --once`.

- Ver/editar: `taskschd.msc` → Biblioteca → MasCafe-HTTPS-Agent
- Log: `tools/windows-https-agent/logs/scheduled.log`

## Enlaces útiles

- GitHub Pages: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
- Workflow CI: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/enable-https.yml
- DNS GoDaddy: https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com

## Solución de problemas

| Problema | Acción |
|----------|--------|
| `npm no está en PATH` | Reinstala Node.js y reinicia PowerShell |
| Certificado atascado en `new` | `fix --ci` o espera al cron de GitHub (cada 3 h) |
| PAT sin permisos Pages | Usa `fix --ci` o crea PAT con `repo` + `administration` |
| HTTPS sigue sin candado tras 48 h | Abrir ticket GitHub Support o considerar Cloudflare (ver `docs/DOMINIO-MASCAFE-COM.md`) |

# Automatización sin intervención manual

El agente (Cursor Cloud) y GitHub Actions pueden ejecutar **todo el pipeline** usando secrets del repositorio.

## Secrets necesarios

Configura en: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions

| Secret | Obligatorio | Cómo obtenerlo |
|--------|-------------|----------------|
| `GODADDY_API_KEY` | Para DNS | https://developer.godaddy.com/keys → **Production** |
| `GODADDY_API_SECRET` | Para DNS | Se muestra **una sola vez** al crear la key (debe ser pareja con la key) |
| `GH_PAGES_PAT` | Para custom domain | https://github.com/settings/tokens → `repo` + `administration` |

> **Importante:** al regenerar la API key en GoDaddy, debes actualizar **key y secret** a la vez.

## Escenarios automáticos

### 1. Tras cada deploy a `main`

El workflow **Setup autónomo** se ejecuta solo cuando termina **Publicar HTML en GitHub Pages**:

- Valida credenciales GoDaddy
- Si son válidas → actualiza DNS + verifica
- Si fallan → solo avisa (el sitio en github.io sigue funcionando)

### 2. Lanzar todo manualmente (un clic)

Actions → **Setup autónomo (build + dominio)** → Run workflow

| Opción | Uso |
|--------|-----|
| `dry_run: false` | Aplicar cambios reales |
| `skip_godaddy: true` | Solo custom domain en GitHub |
| `skip_build: true` | Solo dominio (sin rebuild) |

### 3. Desde terminal (agente local)

```bash
# Con .env.local (GODADDY_* + GITHUB_TOKEN)
npm run setup:autonomous

# Simular
npm run setup:autonomous:dry

# Solo validar que las credenciales funcionan
npm run validate:credentials
```

### 4. Disparar vía API (agente remoto)

```bash
gh api repos/lasucursaldelcafe-droid/WEb-mas-cafe/dispatches \
  -f event_type=autonomous-setup
```

## Comandos individuales

```bash
npm run build:github-pages   # Sitio + informe + wallet
npm run verify:links         # Enlaces internos OK
npm run domain:configure     # GoDaddy DNS + GitHub custom domain
npm run domain:verify        # Comprobar DNS/HTTP
```

## Si GoDaddy devuelve 401

1. Crea **nueva** API key en Production
2. Copia **Key** y **Secret** juntos
3. Actualiza ambos secrets en GitHub
4. Ejecuta de nuevo Setup autónomo

Panel DNS manual: https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com

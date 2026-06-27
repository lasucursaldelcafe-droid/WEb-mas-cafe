# Enlaces de acceso — Más Café

## Ver el sitio (sin instalar nada)

| Enlace | Uso |
|--------|-----|
| **jsDelivr (recomendado)** | https://cdn.jsdelivr.net/gh/lasucursaldelcafe-droid/WEb-mas-cafe@main/publico/index.html |
| **HTMLPreview** | https://htmlpreview.github.io/?https://raw.githubusercontent.com/lasucursaldelcafe-droid/WEb-mas-cafe/main/publico/index.html |
| **Archivo en GitHub** | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/blob/main/publico/index.html |

## GitHub Pages (cuando lo actives)

1. Settings → Pages → Deploy from branch → `gh-pages` → / (root)
2. URL: https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/

## Actualizar

Edita `content/site.json` y ejecuta:

```bash
npm run build:publico
git add publico/ content/site.json
git commit -m "Actualizar sitio público"
git push
```

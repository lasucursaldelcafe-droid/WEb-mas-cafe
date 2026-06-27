# Enlaces de acceso — Más Café

HTML autónomo en `publico/index.html`. **No necesitas instalar nada ni correr el proyecto en local.**

---

## Importante: el repositorio es privado

Mientras el repo sea **privado**, los enlaces públicos no funcionan (GitHub devuelve 404).

### Para que el sitio sea visible para todos (1 minuto)

1. Abre: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings
2. Baja hasta **Danger Zone**
3. **Change repository visibility** → **Make public**
4. Confirma

Después de eso, estos enlaces funcionan:

---

## Enlaces para abrir el sitio

| Enlace | Uso |
|--------|-----|
| **https://cdn.jsdelivr.net/gh/lasucursaldelcafe-droid/WEb-mas-cafe@main/publico/index.html** | Abrir el sitio (recomendado) |
| **https://htmlpreview.github.io/?https://raw.githubusercontent.com/lasucursaldelcafe-droid/WEb-mas-cafe/main/publico/index.html** | Vista previa alternativa |
| **https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/blob/main/publico/index.html** | Ver o descargar el archivo |

### GitHub Pages (opcional)

1. Settings → Pages → Deploy from branch → `gh-pages` → `/ (root)` → Save
2. URL: **https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/**

---

## Actualizar el contenido

1. Edita `content/site.json`
2. Ejecuta: `npm run build:publico`
3. Commit y push a `main`

O solo edita `content/site.json` y push — GitHub Actions regenera el HTML.

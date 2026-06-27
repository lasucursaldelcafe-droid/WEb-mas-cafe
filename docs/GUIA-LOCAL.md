# Guía local — clonar, ver y editar desde GitHub

Todo lo que necesitas para trabajar en tu computador con el código de GitHub.

---

## Requisito

Solo **Node.js** (versión 18 o superior).

- Descarga: https://nodejs.org/ (botón LTS)
- Verificar: `node --version`

No necesitas `npm install` para la vista previa del sitio HTML.

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
```

---

## 2. Ver el sitio en tu navegador

```bash
npm run preview
```

Se abre un servidor en:

**http://localhost:4173/**

Incluye HTML + todas las imágenes. Funciona sin internet después de clonar.

Para detener: `Ctrl+C` en la terminal.

### Alternativa sin servidor

```bash
npm run build:site
```

Luego abre en el explorador de archivos:

`gh-pages-site/index.html`

(Doble clic. Las imágenes cargan porque están en la misma carpeta.)

---

## 3. Editar contenido

Abre `content/site.json` con cualquier editor de texto.

Ahí cambias:
- Textos de la marca
- Productos y precios
- Menú del café
- Blog y experiencias

Guarda el archivo y vuelve a ejecutar:

```bash
npm run preview
```

Recarga el navegador para ver los cambios.

---

## 4. Subir cambios a GitHub (publicar en internet)

```bash
git add content/site.json
git commit -m "Actualizar contenido del sitio"
git push origin main
```

GitHub Actions publica automáticamente en ~1 minuto en:

https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/

---

## 5. Desarrollo avanzado (Next.js)

Si quieres editar diseño o componentes React:

```bash
npm install
npm run dev
```

Sitio de desarrollo: http://localhost:3000

---

## Comandos útiles

| Comando | Qué hace |
|---------|----------|
| `npm run preview` | Genera el sitio y lo abre en localhost:4173 |
| `npm run build:site` | Genera 7 páginas en `gh-pages-site/` |
| `npm run build:publico` | Genera `publico/` (mismo contenido) |
| `npm run dev` | Servidor Next.js (requiere `npm install`) |

### Rutas del sitio local

`/ · /cafe/ · /menu/ · /nosotros/ · /tienda/ · /blog/ · /contacto/`

---

## Problemas frecuentes

| Problema | Solución |
|----------|----------|
| `node: command not found` | Instala Node.js desde nodejs.org |
| Imágenes no cargan | Ejecuta `npm run build:site` antes de abrir el HTML |
| Puerto 4173 ocupado | `PORT=3000 npm run preview` |
| El sitio público da 404 | Activa GitHub Pages: [ACTIVAR-GITHUB-PAGES.md](./ACTIVAR-GITHUB-PAGES.md) |

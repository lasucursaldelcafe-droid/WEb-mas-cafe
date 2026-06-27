# Más Café — Web

Sitio web oficial de **Más Café**, café de especialidad y hospitalidad consciente en Cali, Colombia.

## Ver el sitio (GitHub Pages)

**URL:** https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/

HTML + imágenes incluidas. Funciona en celular, tablet y PC.

### Activar (una sola vez)

Settings → **Pages** → Branch **`gh-pages`** → **`/ (root)`** → Save

**Guía:** [docs/ACTIVAR-GITHUB-PAGES.md](docs/ACTIVAR-GITHUB-PAGES.md)

**Dominio mascafe.com:** [docs/DOMINIO-MASCAFE-COM.md](docs/DOMINIO-MASCAFE-COM.md)

### Actualizar

Edita `content/site.json` → push a `main` → publicación automática.

---

## Publicación alternativa (Firebase)

**URL:** https://mas-cafe-c8413.web.app

```bash
npx firebase login
npm run deploy:firebase
```

**Guía:** [docs/GUIA-PUBLICAR-SIN-INSTALAR.md](docs/GUIA-PUBLICAR-SIN-INSTALAR.md)

---

## Desarrollo local

```bash
npm install
npm run dev
```

Sitio: [http://localhost:3000](http://localhost:3000)

## Páginas

- `/` — Inicio
- `/cafe/` — Café de especialidad
- `/menu/` — Menú
- `/nosotros/` — Historia y valores
- `/tienda/` — Productos
- `/blog/` — Artículos
- `/contacto/` — Contacto y ubicación

## Estructura

```
content/site.json           # Contenido del sitio (editar aquí)
scripts/build-github-pages.mjs  # Genera HTML + imágenes para GitHub
public/images/              # Logos, gráficas e ilustraciones
.github/workflows/          # Deploy automático a GitHub Pages
```

## Marca

- **Tagline:** Pausa con intención
- **Colores:** Azul `#073954`, verde `#1BB175`, crema `#F6F5EF`
- **Ubicación:** Calle 5B #2-38-09, San Fernando Nuevo, Cali

## Repositorio

https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe

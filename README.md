# Más Café — Web

Sitio web oficial de **Más Café**, café de especialidad y hospitalidad consciente en Cali, Colombia.

Diseño editorial orgánico con identidad visual propia de Más Café.

## Publicación (Firebase)

**URL:** https://mas-cafe-c8413.web.app

Proyecto Firebase: `mas-cafe-c8413`. HTML estático en `mas-cafe/`.

### Sin instalar nada en tu PC (recomendado)

Guía paso a paso con **Google Cloud Shell** (terminal en el navegador):

**[docs/GUIA-PUBLICAR-SIN-INSTALAR.md](docs/GUIA-PUBLICAR-SIN-INSTALAR.md)**

### Desde Windows con Node instalado

**[docs/GUIA-INSTALAR-WINDOWS.md](docs/GUIA-INSTALAR-WINDOWS.md)**

```bash
npx firebase login    # primera vez
npm run deploy:firebase
```

**Guía Firebase:** [docs/URL-PUBLICA.md](docs/URL-PUBLICA.md)

---

## Publicación alternativa (GitHub Pages)

**URL:** https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/

| Qué | Dónde |
|-----|-------|
| Código fuente | Rama `main` en GitHub |
| HTML publicado | Rama `gh-pages` (automático) |
| Dominio | GoDaddy → DNS a GitHub (opcional) |

### Activar (una sola vez)

GitHub → **Settings** → **Pages** → Source: **Deploy from branch** → `gh-pages` → `/ (root)`

### Actualizar el sitio

Edita `content/site.json` → push a `main` → GitHub publica solo en ~2 min.

**Guía:** [docs/COMO-ACTUALIZAR.md](docs/COMO-ACTUALIZAR.md)

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
content/site.json     # Contenido del sitio (editar aquí)
src/app/(site)/       # Páginas públicas
public/images/        # Logos, gráficas e ilustraciones
.github/workflows/    # Deploy automático a GitHub Pages
```

## Marca

- **Tagline:** Pausa con intención
- **Colores:** Azul `#073954`, verde `#1BB175`, crema `#F6F5EF`
- **Ubicación:** Calle 5B #2-38-09, San Fernando Nuevo, Cali

## Repositorio

https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe

# Más Café — Web

Sitio web oficial de **Más Café**, café de especialidad y hospitalidad consciente en Cali, Colombia.

Diseño editorial orgánico con identidad visual propia de Más Café.

## Publicación (GitHub Pages + dominio GoDaddy)

**No necesitas hosting de GoDaddy** — solo el dominio `mascafecol.com`.

| Qué | Dónde |
|-----|-------|
| Código | Este repositorio en GitHub |
| Hosting | GitHub Pages (gratis) |
| Dominio | GoDaddy → DNS apuntando a GitHub |

**Guía paso a paso:** [docs/GITHUB-PAGES-Y-DOMINIO.md](docs/GITHUB-PAGES-Y-DOMINIO.md)

### Activar (una sola vez)

1. GitHub → **Settings** → **Pages** → Source: **GitHub Actions**
2. GoDaddy → DNS → 4 registros **A** a las IPs de GitHub Pages
3. GitHub → Pages → Custom domain: `mascafecol.com`

### Actualizar el sitio

Edita `content/site.json` y haz push a `main`. GitHub despliega automáticamente.

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

# Más Café — Web

Sitio web de **Más Café** — café de especialidad en Cali, Colombia.

## Enlaces del sitio

| Página | GitHub Pages |
|--------|----------------|
| Inicio | [/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/) |
| Café | [/cafe/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/cafe/) |
| Menú | [/menu/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/menu/) |
| Nosotros | [/nosotros/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/nosotros/) |
| Tienda | [/tienda/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/tienda/) |
| Blog | [/blog/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/blog/) |
| Contacto | [/contacto/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/contacto/) |

| | |
|-|-|
| **Repositorio** | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe |
| **Dominio** | https://mascafe.com/ (cuando DNS esté listo) |

---

## Ver en local (desde GitHub)

```bash
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
npm run preview
```

Abre **http://localhost:4173/** en el navegador. No necesitas `npm install` (solo Node.js).

**Guía completa:** [docs/GUIA-LOCAL.md](docs/GUIA-LOCAL.md)

---

## Publicar cambios en internet

1. Edita `content/site.json`
2. `git push origin main`
3. GitHub Actions publica en ~1 minuto

**Guía:** [docs/COMO-ACTUALIZAR.md](docs/COMO-ACTUALIZAR.md)

---

## Activar GitHub Pages (una vez)

Settings → **Pages** → Branch **`gh-pages`** → **`/ (root)`** → Save

**Guía:** [docs/ACTIVAR-GITHUB-PAGES.md](docs/ACTIVAR-GITHUB-PAGES.md)

---

## Documentación

| Guía | Para qué |
|------|----------|
| [GUIA-LOCAL.md](docs/GUIA-LOCAL.md) | Clonar, previsualizar y editar en tu PC |
| [COMO-ACTUALIZAR.md](docs/COMO-ACTUALIZAR.md) | Cambiar textos, precios y menú |
| [ACTIVAR-GITHUB-PAGES.md](docs/ACTIVAR-GITHUB-PAGES.md) | Activar el sitio público en GitHub |
| [DOMINIO-MASCAFE-COM.md](docs/DOMINIO-MASCAFE-COM.md) | Conectar mascafe.com (DNS GoDaddy) |
| [URL-PUBLICA.md](docs/URL-PUBLICA.md) | Firebase (alternativa) |

---

## Estructura

```
content/site.json              # Contenido editable
scripts/lib/site-html/         # Generador HTML (7 páginas)
scripts/build-github-pages.mjs # Build para GitHub Pages
gh-pages-site/                 # Salida local (generada, no commitear)
.github/workflows/             # Deploy automático → rama gh-pages
```

## Marca

- **Tagline:** Pausa con intención
- **Colores:** Azul `#073954`, verde `#1BB175`, crema `#F6F5EF`
- **Ubicación:** Calle 5B #2-38-09, San Fernando Nuevo, Cali

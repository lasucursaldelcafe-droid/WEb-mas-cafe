# Más Café — Web

Sitio web de **Más Café** — café de especialidad en Cali, Colombia.

## Enlaces

| | URL |
|-|-----|
| **Sitio público** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| **Informe marca (constitución web)** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/ |
| **Admin** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/admin/ |
| **Repositorio** | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe |
| **Dominio futuro** | https://www.mascafé.com/ |

### Páginas del sitio

| Página | URL |
|--------|-----|
| Inicio | [/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/) |
| Café | [/cafe/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/cafe/) |
| Menú | [/menu/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/menu/) |
| Nosotros | [/nosotros/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/nosotros/) |
| Tienda | [/tienda/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/tienda/) |
| Blog | [/blog/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/blog/) |
| Contacto | [/contacto/](https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/contacto/) |

---

## Ver en local

```bash
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
npm run preview
```

→ http://localhost:4173/ · Informe: http://localhost:4173/informe/

**Guía:** [docs/GUIA-LOCAL.md](docs/GUIA-LOCAL.md)

---

## Publicar cambios

1. Edita `content/site.json` o usa el [panel admin](docs/ADMIN.md)
2. `git push origin main`
3. GitHub Actions publica sitio + informe en ~1 minuto

---

## Documentación

Índice completo: [docs/README.md](docs/README.md)

| Guía | Para qué |
|------|----------|
| [ENLACES-ACCESO.md](docs/ENLACES-ACCESO.md) | URLs y credenciales |
| [HOSTING.md](docs/HOSTING.md) | GitHub Pages, dominio, Firebase |
| [COMO-ACTUALIZAR.md](docs/COMO-ACTUALIZAR.md) | Editar contenido |
| [informes/README.md](informes/README.md) | Constitución web para la marca |
| [proyecto-mas-cafe/README.md](proyecto-mas-cafe/README.md) | **Entrega, cuentas, migración mascafé.com** |

---

## Entrega y migración (dueños Más Café)

Carpeta única: **`proyecto-mas-cafe/`**

| Archivo | Uso |
|---------|-----|
| [cuentas/ENLACES-CONFIGURACION.md](proyecto-mas-cafe/cuentas/ENLACES-CONFIGURACION.md) | Links donde ingresar credenciales |
| [cuentas/REGISTRO-HECHO.md](proyecto-mas-cafe/cuentas/REGISTRO-HECHO.md) | Bloc de notas — pegar lo ya configurado |
| [cuentas/CREDENCIALES.template.md](proyecto-mas-cafe/cuentas/CREDENCIALES.template.md) | Plantilla → copiar a `CREDENCIALES.md` (local, no Git) |

---

## Estructura

```
content/site.json              # Contenido editable
scripts/lib/site-html/         # Generador HTML (7 páginas)
scripts/lib/generate-constitution-report.mjs  # Informe marca
scripts/build-github-pages.mjs # Build → gh-pages-site/
informes/                      # Constitución web (generada)
proyecto-mas-cafe/             # Entrega, cuentas, migración
public/images/                 # Activos desde Drive
.github/workflows/             # Deploy automático
```

## Marca

- **Tagline:** Pausa con intención (solo en inicio)
- **Colores:** Crema `#F6F5EF`, azul `#073954`, sage `#D8DAA8`
- **Drive:** [Carpeta de marca](https://drive.google.com/drive/folders/153OUmu9lChpCk2NiiirUwI_Z5EDQQNtC)

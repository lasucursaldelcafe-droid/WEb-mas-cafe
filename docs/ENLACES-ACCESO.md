# Enlaces de acceso — Más Café

## Sitio en línea (7 páginas)

Base: **https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/**

| Página | URL |
|--------|-----|
| Inicio | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| Café | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/cafe/ |
| Menú | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/menu/ |
| Nosotros | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/nosotros/ |
| Tienda | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/tienda/ |
| Blog | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/blog/ |
| Contacto | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/contacto/ |

## Constitución web (informe para la marca)

| | |
|--|--|
| **URL** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/ |
| **Qué es** | Documento HTML vivo: activos Drive, arquitectura, recomendaciones |
| **Repo** | `informes/constitucion-web.html` (se regenera en cada build) |

No aparece en el menú del sitio público.

## Panel de administración

| | |
|--|--|
| **URL** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/admin/ |
| **Usuario** | `admin` |
| **Contraseña** | `mascafe2025` |

Guía completa: [ADMIN.md](./ADMIN.md)

Dominio: **https://mascafé.com/** (mismas rutas cuando DNS esté configurado)

---

## Ver en local

```bash
git clone https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git
cd WEb-mas-cafe
npm run preview
```

→ http://localhost:4173/ (7 rutas + `/admin/` + `/informe/`)

Guía: [GUIA-LOCAL.md](./GUIA-LOCAL.md)

---

## Actualizar

**Opción A — Panel admin (recomendado):** [ADMIN.md](./ADMIN.md) → edita y publica desde el navegador.

**Opción B — Manual:** Edita `content/site.json` → push a `main` → deploy automático.

Guía manual: [COMO-ACTUALIZAR.md](./COMO-ACTUALIZAR.md)

# Activar GitHub Pages

## URL del sitio

**https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/**

7 páginas: `/` · `/cafe/` · `/menu/` · `/nosotros/` · `/tienda/` · `/blog/` · `/contacto/`

---

## Configuración correcta (importante)

1. https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. **Build and deployment** → **Source**: **GitHub Actions** (no "Deploy from branch")
3. **Quita** cualquier dominio personalizado si el sitio da 404 o redirige mal
4. Guarda y espera 1–2 minutos tras el próximo push a `main`

El workflow **Publicar HTML en GitHub Pages** publica el sitio automáticamente.

---

## Ver en local

```bash
npm run preview
```

→ http://localhost:4173/

---

## Dominio personalizado (solo cuando DNS esté listo)

No configures `mascafé.com` en GitHub hasta que el DNS apunte a GitHub.

Guía DNS: [DOMINIO-MASCAFE-COM.md](./DOMINIO-MASCAFE-COM.md)

---

## Actualizar contenido

Edita `content/site.json` → push a `main`.

Guía: [COMO-ACTUALIZAR.md](./COMO-ACTUALIZAR.md)

# Panel de administración — Más Café

Edita todo el contenido del sitio (marca, coffee shop, menú, tienda, blog, nosotros, contacto) y publícalo en línea sin tocar código.

## Acceso

| Campo | Valor |
|-------|--------|
| **URL** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/admin/ |
| **Usuario** | `admin` |
| **Contraseña** | `mascafe2025` |

> Cambia la contraseña editando `content/users.json` en el repositorio y haciendo push (el build regenera los hashes).

## Qué puedes editar

| Sección | Contenido |
|---------|-----------|
| **Marca** | Nombre, tagline, descripción, redes sociales |
| **Experiencias** | Coffee shop, tienda, blog (títulos, textos, CTAs) |
| **Productos / Tienda** | Catálogo con precio, categoría, imagen |
| **Menú** | Categorías y platos del café |
| **Blog** | Artículos (título, extracto, fecha, imagen) |
| **Nosotros** | Historia, valores, equipo |
| **Contacto** | Dirección, horarios, teléfono, email, mapa |
| **Marquee** | Texto animado del pie de página |

## Publicar cambios

1. Edita en el panel y usa **Guardar borrador** (se guarda en el navegador).
2. En **Publicar**, pega un **token de GitHub** con permiso `Contents: Read and write` en el repositorio.
3. Pulsa **Publicar en el sitio**. El archivo `content/site.json` se sube a `main` y GitHub Actions despliega el sitio en ~1 minuto.

### Crear token de GitHub

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Repositorio: `lasucursaldelcafe-droid/WEb-mas-cafe`
3. Permisos: **Contents** → Read and write
4. Copia el token y pégalo solo en el panel (se guarda en `sessionStorage` de tu sesión).

### Sin token

Puedes **Descargar site.json**, subirlo manualmente al repo en GitHub (editar `content/site.json`) y hacer commit. El deploy se dispara igual.

## Desarrollo local

```bash
npm run preview
# Admin: http://localhost:4173/admin/
```

## Seguridad

- El panel no está indexado (`noindex`).
- Las contraseñas se validan con hash en el cliente; no es autenticación de nivel empresarial — cámbiala y no compartas la URL públicamente si te preocupa el acceso.
- El token de GitHub solo vive en tu sesión del navegador hasta que cierres la pestaña.

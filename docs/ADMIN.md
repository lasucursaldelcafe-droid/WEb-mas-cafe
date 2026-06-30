# Panel de administración — Más Café

Edita todo el contenido del sitio desde el navegador: textos, colores, imágenes, menú, blog, secciones y más.

## Acceso

| | |
|--|--|
| **URL** | http://mascafé.com/admin/ |
| **Desde el sitio** | Pie de página → **Administración** |
| **Usuario** | `admin` |
| **Contraseña** | `mascafe2025` |

## Publicación no funciona

Si al pulsar **Guardar y publicar** aparece un error sobre `ADMIN_PUBLISH_KEY`:

1. En GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Crea o actualiza **`ADMIN_PUBLISH_KEY`** con un [Personal Access Token](https://github.com/settings/tokens) que tenga permiso **`contents: write`** en este repositorio
3. Alternativa: si ya tienes **`GH_PAGES_PAT`** con esos permisos, el build lo usará como respaldo
4. Haz un push a `main` (o vuelve a ejecutar el workflow **Publicar HTML en GitHub Pages**) para regenerar `/admin/`

El login funciona también por **HTTP** (sin HTTPS). Cuando el certificado esté activo, usa `https://mascafé.com/admin/`.

## Cómo publicar

1. Edita el contenido en las secciones del panel.
2. Pulsa **Guardar y publicar** (arriba a la derecha o en la sección Publicar).
3. El sitio se actualiza automáticamente en ~1 minuto.

No necesitas configurar nada manualmente. La publicación es automática desde el panel en línea.

## Qué puedes editar

| Sección | Contenido |
|---------|-----------|
| **Secciones** | Activar/desactivar subcarpetas, crear páginas nuevas |
| **Marca e inicio** | Nombre, tagline, titulares |
| **Colores** | Paleta completa del sitio (vista previa en vivo) |
| **Textos de páginas** | Títulos y subtítulos de cada página |
| **Experiencias** | Coffee shop: Pausa, Carta, Horno, Visita |
| **Café / Tienda** | Productos, precios, imágenes |
| **Menú** | Categorías y platos |
| **Blog** | Artículos con imagen |
| **Nosotros** | Historia, valores, imagen principal |
| **Contacto** | Dirección, horarios, redes sociales |
| **Marquee** | Texto animado del sitio |
| **Informe** | Informe constitucional (documento de avance, no público en el menú) |

## Informe constitucional

En el menú lateral → **Informe**, o el botón **Informe** arriba a la derecha:

- Vista integrada del documento en `/informe/`
- Enlace al mockup Wallet en `/informe/wallet/`
- El informe no aparece en el menú del sitio público

Para editar el contenido del informe, modifica `content/informe-requisitos.json` en el repositorio y publica con push a `main`.

## Secciones y subcarpetas

En **Secciones** puedes:

- **Activar o desactivar** cada página del sitio (Café, Menú, Blog, etc.)
- **Mostrar u ocultar** en el menú de navegación
- **Crear nuevas secciones** con su propia subcarpeta (ej. `/eventos/`)

Las secciones desactivadas no se publican ni aparecen en el menú.

## Imágenes — especificaciones

Cada campo de imagen muestra la **vista previa actual** y las medidas recomendadas:

| Uso | Medidas |
|-----|---------|
| Experiencias / Nosotros | 800 × 1000 px (4:5 vertical). PNG o WebP. Máx. 500 KB |
| Productos | 600 × 600 px (cuadrada). PNG fondo transparente. Máx. 400 KB |
| Blog | 1200 × 750 px (16:10 horizontal). JPG o WebP. Máx. 600 KB |

Pulsa **Subir imagen** y se publicará automáticamente al guardar.

## Desarrollo local

```bash
npm run preview
# Admin: http://localhost:4173/admin/
```

En local puedes editar y usar **Descargar copia de seguridad** para guardar el JSON.

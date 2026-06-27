# Panel de administración — Más Café

Edita todo el contenido del sitio desde el navegador: textos, colores, imágenes, menú, blog y más.

## Acceso

| | |
|--|--|
| **URL** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/admin/ |
| **Desde el sitio** | Pie de página → **Administración** |
| **Usuario** | `admin` |
| **Contraseña** | `mascafe2025` |

## Cómo publicar (sin tokens manuales)

1. Edita el contenido en las secciones del panel.
2. Pulsa **Guardar y publicar** (arriba a la derecha o en la sección Publicar).
3. El sitio se actualiza automáticamente en ~1 minuto.

No necesitas pegar tokens de GitHub. La publicación automática está configurada en el servidor.

## Qué puedes editar

| Sección | Contenido |
|---------|-----------|
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

## Imágenes — especificaciones

Cada campo de imagen muestra la **vista previa actual** y las medidas recomendadas:

| Uso | Medidas |
|-----|---------|
| Experiencias / Nosotros | 800 × 1000 px (4:5 vertical). PNG o WebP. Máx. 500 KB |
| Productos | 600 × 600 px (cuadrada). PNG fondo transparente. Máx. 400 KB |
| Blog | 1200 × 750 px (16:10 horizontal). JPG o WebP. Máx. 600 KB |

Pulsa **Subir imagen** y se publicará automáticamente al guardar.

## Colores

En **Colores** puedes modificar la paleta completa. Los cambios se ven en la vista previa del panel y se aplican al sitio al publicar.

## Desarrollo local

```bash
npm run preview
# Admin: http://localhost:4173/admin/
```

En local, usa **Descargar JSON** y súbelo al repositorio manualmente.

## Configuración técnica (una sola vez)

Para que la publicación automática funcione en producción, el repositorio debe tener el secret `ADMIN_PUBLISH_KEY` en GitHub → Settings → Secrets → Actions (token con permiso Contents: Read and write).

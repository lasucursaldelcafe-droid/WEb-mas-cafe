# Informes para la marca

## Constitución Web

Documento HTML completo sobre el estado del sitio, activos Drive, arquitectura, migración a **www.mascafe.com**, wallet de fidelización y checklist editable para dueños de Más Café.

| | |
|-|-|
| **En línea** | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/ |
| **Fuente generada** | `informes/constitucion-web.html` (auto al hacer build) |
| **Generador** | `scripts/lib/generate-constitution-report.mjs` |
| **Checklist editable** | `content/informe-requisitos.json` |

No está enlazado desde el menú del sitio público. Se entrega a la marca como reporte de avance.

### Dónde completar lo que necesitamos

Edita **`content/informe-requisitos.json`** en el repositorio:

| Sección JSON | Para qué |
|--------------|----------|
| `meta` | Titular, contacto, repo futuro, fecha migración |
| `independencia.items` | Cuentas y propiedad a nombre de Más Café |
| `migracion` | Fases del plan y DNS GoDaddy |
| `wallet.reglasNegocio` | Puntos por peso, caducidad, premios |
| `necesitamosDeUstedes` | Checklist con responsable, fecha y notas |
| `camposLibres` | Notas libres de reuniones y decisiones |

Estados válidos: `pendiente`, `en_proceso`, `listo`.

Tras editar: push a `main` → GitHub Actions regenera el informe en `/informe/`.

### Carpeta de entrega del proyecto

Todo organizado para migración, cuentas y entrega a dueños:

| Ruta | Uso |
|------|-----|
| `proyecto-mas-cafe/README.md` | Índice principal |
| `proyecto-mas-cafe/cuentas/ENLACES-CONFIGURACION.md` | Links donde ingresar credenciales |
| `proyecto-mas-cafe/cuentas/REGISTRO-HECHO.md` | Bloc de notas — lo ya configurado |
| `proyecto-mas-cafe/cuentas/CREDENCIALES.template.md` | Plantilla de credenciales |

### Regenerar localmente

```bash
npm run build:github-pages
```

Esto actualiza el informe con `content/site.json`, `content/informe-requisitos.json` y el inventario de imágenes.

# Más Café — Web

Sitio web oficial de **Más Café**, marca de café de especialidad y hospitalidad consciente en Cali, Colombia.

Diseño editorial orgánico inspirado en Tropicalia Coffee y Pergamino, con identidad visual propia de Más Café.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Contenido editable vía JSON + panel admin

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # opcional: cambiar ADMIN_PASSWORD
npm run dev
```

- Sitio: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (contraseña por defecto: `mascafe2025`)

## Estructura

```
content/site.json     # Datos del sitio (productos, menú, blog, marca)
src/app/(site)/       # Páginas públicas
src/app/admin/        # Panel de administración
public/images/        # Logos, gráficas, ilustraciones y aplicaciones
```

## Panel admin

Gestiona desde `/admin`:

- Productos y precios
- Menú del café
- Artículos del blog
- Experiencias de la home
- Configuración de marca y contacto

## Marca

- **Tagline:** Pausa con intención
- **Colores:** Azul `#073954`, verde `#1BB175`, crema `#F6F5EF`
- **Tipografías:** Satoshi, Playfair Display, Marydale
- **Ubicación:** Calle 5B #2-38-09, San Fernando Nuevo, Cali

## Repositorio

https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe

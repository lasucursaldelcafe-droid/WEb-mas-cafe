# SEO y reconocimiento de marca — Más Café

Checklist para aparecer en Google con logo, título «Más Café» en pestañas y resultados de búsqueda.

**Sitio objetivo:** https://www.mascafé.com

---

## Ya implementado en el código

| Elemento | Dónde |
|----------|--------|
| Título en pestaña «Más Café · …» | Generador HTML (`scripts/lib/site-html/shared.mjs`) |
| Favicon + apple-touch-icon | `public/favicon.ico`, `npm run generate:favicons` |
| Meta description por página | `content/site.json` + `pages.mjs` |
| Open Graph (Facebook, WhatsApp) | `og:title`, `og:image`, `og:description` |
| Twitter Card | `twitter:card`, `twitter:image` |
| JSON-LD LocalBusiness | Schema.org `CafeOrCoffeeShop` (logo + dirección) |
| sitemap.xml | Generado en cada build |
| robots.txt | Bloquea `/admin/` e `/informe/` |
| Canonical URLs | `https://www.mascafé.com/...` |

Verificar tras cada build:

```bash
npm run build:github-pages
npm run verify:seo
```

---

## Paso a paso — Google Search Console (gratis)

| Paso | Acción | Enlace |
|------|--------|--------|
| 1 | Entrar con cuenta de Más Café | https://search.google.com/search-console |
| 2 | Añadir propiedad **URL prefix** | `https://www.mascafé.com` |
| 3 | Verificar dominio → método **Etiqueta HTML** | Copiar código `content="..."` |
| 4 | Pegar en `content/settings.json` → `seo.googleSiteVerification` | Ejemplo: `"googleSiteVerification": "abc123..."` |
| 5 | Push a `main` → deploy automático | |
| 6 | En Search Console → **Verificar** | |
| 7 | **Sitemaps** → Añadir | `http://mascafé.com/sitemap.xml` (o `http://xn--mascaf-gva.com/sitemap.xml`) |
| 8 | **Inspección de URLs** → Probar inicio | Solicitar indexación |

---

## Paso a paso — Google Business Profile (mapa + logo)

| Paso | Acción |
|------|--------|
| 1 | https://business.google.com — crear perfil «Más Café» |
| 2 | Misma dirección que el sitio: Calle 5B #2-38-09, San Fernando Nuevo, Cali |
| 3 | Mismo teléfono y horarios que `content/site.json` |
| 4 | Subir logo (`public/images/brand/favs.png` o horizontal) |
| 5 | Enlace web: `https://www.mascafé.com` |
| 6 | Categoría: Café / Coffee shop |

---

## Paso a paso — Bing Webmaster (gratis)

| Paso | Acción |
|------|--------|
| 1 | https://www.bing.com/webmasters |
| 2 | Añadir sitio `https://www.mascafé.com` |
| 3 | Código en `content/settings.json` → `seo.bingSiteVerification` |
| 4 | Enviar sitemap: `http://mascafé.com/sitemap.xml` — **no** usar HTTPS hasta que el certificado esté activo |

---

## Logo en resultados de Google

Google muestra el favicon del sitio si:

1. El sitio está indexado (Search Console verde)
2. `favicon.ico` es accesible en la raíz (ya está)
3. El sitio usa HTTPS (pendiente certificado GitHub — ver `npm run domain:enable-https`)
4. JSON-LD incluye `logo` (ya está en cada página pública)

Tamaño recomendado favicon: múltiplo de 48px (tenemos 16, 32, 192, 512).

---

## Palabras clave objetivo (contenido futuro)

| Intención | Ejemplo de búsqueda |
|-----------|---------------------|
| Local | café especialidad Cali |
| Marca | Más Café Cali |
| Producto | comprar café especialidad Colombia |
| Visita | cafetería San Fernando Cali |

Mejorar posiciones: blog mensual, Google Business activo, reseñas, NAP consistente (nombre-dirección-teléfono iguales en web, Maps e Instagram).

---

## Archivos a editar

| Archivo | Para qué |
|---------|----------|
| `content/settings.json` → `seo` | URL del sitio, códigos de verificación Google/Bing |
| `content/site.json` → `brand` | Textos, horarios, redes (afectan JSON-LD) |
| `public/images/brand/favs.png` | Fuente del favicon — cambiar logo aquí y `npm run generate:favicons` |

---

## Después de configurar

Anota en [REGISTRO-HECHO.md](../cuentas/REGISTRO-HECHO.md):

```
- [x] Google Search Console verificado | https://search.google.com/search-console | fecha
- [x] Sitemap enviado | sitemap.xml | fecha
- [x] Google Business Profile | enlace perfil | fecha
```

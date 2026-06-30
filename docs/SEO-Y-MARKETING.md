# Plan SEO y marketing — Más Café

Plan de acción para cuando el sitio esté publicado en GitHub Pages y, posteriormente, en **mascafé.com**.

## URLs oficiales

| Canal | URL |
|-------|-----|
| Sitio (GitHub Pages) | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| Admin | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/admin/ |
| Dominio futuro | https://mascafé.com/ |
| Instagram | https://www.instagram.com/mascafecol315 |
| Facebook | https://www.facebook.com/mascafecol |

---

## 1. SEO técnico (semana 1)

### On-page
- [ ] Título único por página: `{Página} | Más Café`
- [ ] Meta description en cada sección (ya generada desde `site.json`)
- [ ] Un solo `<h1>` por página
- [ ] Textos alternativos en imágenes de producto y blog
- [ ] Enlaces internos entre Café → Tienda → Menú → Nosotros

### Indexación
- [ ] Verificar en [Google Search Console](https://search.google.com/search-console) con dominio mascafé.com
- [ ] Enviar sitemap (crear `sitemap.xml` en build si se añade dominio propio)
- [ ] Archivo `robots.txt` permitiendo indexación del sitio público y bloqueando `/admin/`

### Local SEO (Cali)
- [ ] Crear/optimizar perfil **Google Business Profile**: nombre, dirección, horarios, fotos, menú
- [ ] NAP consistente: mismo nombre, dirección y teléfono que en el sitio
- [ ] Palabras clave locales: *café de especialidad Cali*, *coffee shop San Fernando*, *brunch Cali*

### Rendimiento
- [ ] Comprobar Core Web Vitals en PageSpeed Insights
- [ ] Imágenes WebP comprimidas (especificaciones en panel admin)
- [ ] Fuentes locales (ya implementadas en build)

---

## 2. Contenido SEO (semanas 2–4)

### Páginas prioritarias
| Página | Intención de búsqueda | Acción |
|--------|----------------------|--------|
| Inicio | marca + propuesta | Tagline «Pausa con intención», CTA tienda |
| Café | café especialidad Cali | Trazabilidad, origen, guía de preparación |
| Menú | menú coffee shop Cali | Categorías claras, precios referenciales |
| Nosotros | historia + valores | Historia de marca, foto ambiente |
| Blog | long-tail | 1 artículo/mes: origen, barismo, hospitalidad |
| Tienda | comprar café online Colombia | Productos con precio, WhatsApp |

### Blog — calendario sugerido
1. **Mes 1:** «Café de especialidad en Cali: qué nos hace diferentes»
2. **Mes 2:** «Cómo preparar pour over en casa» (ampliar guía de Café)
3. **Mes 3:** «Origen Nariño: conocé al productor»
4. **Mes 4:** «Pausa con intención: por qué importa el espacio»

---

## 3. SEM / publicidad pagada (mes 2+)

### Google Ads (búsqueda local)
- **Campaña:** «Café Cali» + «Coffee shop San Fernando»
- **Presupuesto inicial:** $300.000–$500.000 COP/mes
- **Landing:** `/menu/` o `/` según objetivo (visitas vs pedidos)
- **Extensiones:** ubicación, llamada, enlace a WhatsApp

### Meta Ads (Instagram + Facebook)
- **Objetivo:** tráfico al sitio + mensajes WhatsApp
- **Audiencia:** Cali, 25–45 años, intereses café, gastronomía, trabajo remoto
- **Creativos:** fotos de ambiente (mood, pausa), producto (caja café), reel del menú
- **CTA:** «Enviar mensaje» o «Ver menú»

### Métricas a seguir (panel Análisis del admin)
- Clics WhatsApp, tienda, contacto, redes
- Tendencia de ingresos mensuales (registro manual)
- Comparar antes/después de cada campaña

---

## 4. Email y redes (SEND / social)

### Instagram (@mascafecol315)
- 3–4 publicaciones/semana: producto, ambiente, equipo, behind the scenes
- Stories diarias: horario, promoción del día, encuestas
- Enlace en bio → sitio web (GitHub Pages o mascafé.com)

### Facebook (@mascafecol)
- Republicar contenido de Instagram
- Eventos locales y horarios de festivos

### Email (opcional, mes 3+)
- Recoger emails en contacto o formulario futuro
- Newsletter mensual: nuevo origen, artículo del blog, promoción tienda
- Herramientas: Mailchimp, Brevo o Google Workspace

### WhatsApp Business
- Catálogo con productos de la tienda
- Respuestas rápidas: horario, ubicación, menú PDF
- Enlace desde botón flotante del sitio (ya activo)

---

## 5. Lanzamiento — checklist día D

1. [ ] Publicar última versión desde `/admin/` → Guardar y publicar
2. [ ] Verificar las 7 páginas + admin responden HTTP 200
3. [ ] Probar login admin (usuario `admin`)
4. [ ] Probar enlaces Instagram y Facebook
5. [ ] Probar botón WhatsApp en móvil
6. [ ] Anunciar en redes con link al sitio
7. [ ] Registrar primer mes en **Análisis → Ingresos**
8. [ ] Configurar Google Business Profile con URL del sitio

---

## 6. KPIs mensuales

| Métrica | Meta mes 1 | Meta mes 3 |
|---------|------------|------------|
| Clics WhatsApp (sitio) | 50+ | 150+ |
| Visitas Google Business | 500+ | 1.500+ |
| Seguidores Instagram | +100 | +400 |
| Artículos blog publicados | 1 | 3 acumulados |
| Pedidos tienda (referencia) | registrar en admin | tendencia al alza |

---

## Notas

- El panel **Análisis** registra clics del sitio público y permite cargar ingresos mensuales para ver tendencia.
- La **vista previa en vivo** del admin permite validar cambios antes de publicar.
- Cuando **mascafé.com** apunte a GitHub Pages, actualizar enlaces en redes y Google Business.

# Checklist migración — www.mascafe.com

## Estado actual

| Item | Estado |
|------|--------|
| Sitio en GitHub Pages | ✅ En línea |
| Dominio mascafe.com en GoDaddy | ⏳ Pendiente confirmar acceso |
| DNS → GitHub Pages | ⏳ |
| Custom domain GitHub verde | ⏳ |
| URLs en site.json → mascafe.com | ⏳ |
| Wallet + backend | 🔜 Fase siguiente |

---

## Paso a paso — dominio (fase estática)

### 1. GoDaddy
- [ ] Iniciar sesión: https://sso.godaddy.com/
- [ ] Abrir DNS: https://dcc.godaddy.com/control/dnsmanagement?domainName=mascafe.com
- [ ] Desactivar parking / «Coming soon» / forwarding que tape el sitio
- [ ] Eliminar registros A incorrectos (IPs GoDaddy tipo `76.223.x.x`)
- [ ] Agregar 4 registros **A** en `@`:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- [ ] Agregar **CNAME** `www` → `lasucursaldelcafe-droid.github.io`

### 2. GitHub Pages
- [ ] Abrir: https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
- [ ] Custom domain: `mascafe.com` (o `www.mascafe.com` según prefieran)
- [ ] Esperar check DNS verde (puede tardar 10 min – 48 h)
- [ ] Activar **Enforce HTTPS**

### 3. Verificación (yo puedo ayudar en terminal)
```bash
dig mascafe.com A +short
dig www.mascafe.com CNAME +short
curl -sI https://www.mascafe.com | head -5
```

### 4. Actualizar proyecto (Cursor)
- [ ] `content/site.json` → `brand.website` = `https://www.mascafe.com`
- [ ] `content/settings.json` → `customDomain`
- [ ] Regenerar informe
- [ ] Push a main → deploy

---

## Paso a paso — wallet (fase backend)

Cuando el dominio esté estable para el sitio estático, **para wallet** habrá que:

1. Elegir hosting con Node.js (Vercel recomendado)
2. Conectar repo y variables de entorno
3. Cambiar DNS `www` del CNAME de GitHub al de Vercel/Render
4. Mantener o redirigir rutas actuales

Detalle en [../entregables/wallet-pendiente.md](../entregables/wallet-pendiente.md)

---

## Registrar avance

Cada checkbox completado → anotar en [../cuentas/REGISTRO-HECHO.md](../cuentas/REGISTRO-HECHO.md)

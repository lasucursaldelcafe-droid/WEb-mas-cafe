# Checklist migración — www.mascafé.com

> **Guía para terminar:** [TERMINAR-PROYECTO.md](./TERMINAR-PROYECTO.md)  
> **Automático:** `npm run domain:configure` — [AUTOMATIZAR-DOMINIO.md](./AUTOMATIZAR-DOMINIO.md)  
> **Diagnóstico:** `npm run project:status`

## Estado actual (2026-07-19)

| Item | Estado |
|------|--------|
| Sitio en GitHub Pages | ✅ En línea |
| DNS → GitHub Pages (A + CNAME www) | ✅ |
| HTTP http://www.mascafé.com | ✅ 200 |
| HTTPS / candado verde | ❌ Certificado GitHub atascado |
| `site.json` → https://www.mascafé.com | ✅ |
| `settings.json` httpsReady | ❌ Se activa solo al emitir HTTPS |
| App Windows automática | ✅ `tools/windows-https-agent/` |
| Wallet + backend | ⏳ Fase 2 (Supabase listo, falta SA Google) |

---

## Paso a paso — dominio (fase estática)

### 1. GoDaddy
- [x] Iniciar sesión: https://sso.godaddy.com/
- [x] DNS: https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com
- [x] Desactivar parking / forwarding
- [x] 4 registros **A** en `@` → IPs GitHub (185.199.108–111.153)
- [x] **CNAME** `www` → `lasucursaldelcafe-droid.github.io`
- [ ] Verificar que no hay reenvío activo en pestaña **Reenvío**

### 2. GitHub Pages
- [x] Custom domain configurado (`www.xn--mascaf-gva.com` o apex)
- [x] DNS check verde / https_eligible
- [ ] Certificado SSL emitido (no atascado en `new`)
- [ ] **Enforce HTTPS** activado

### 3. Desbloquear HTTPS (acción requerida)
- [ ] Instalar app Windows: `.\tools\windows-https-agent\install.ps1`
- [ ] Ejecutar reparación: app → **Reparar vía CI**
- [ ] Esperar 24–48 h (workflow cada 3 h)
- [ ] Si >48 h: ticket GitHub Support o Cloudflare (ver TERMINAR-PROYECTO.md §3)

### 4. Verificación final
```bash
npm run project:status
npm run domain:verify
curl -sI https://www.mascafé.com | head -5
```

### 5. Actualizar proyecto tras HTTPS
- [ ] `content/settings.json` → `httpsReady: true` (automático con enable-https)
- [ ] Push a main → deploy
- [ ] Anotar en [../cuentas/REGISTRO-HECHO.md](../cuentas/REGISTRO-HECHO.md)

---

## Paso a paso — wallet (fase backend)

Cuando HTTPS esté activo:

1. Pegar `secrets/google-wallet-sa.json`
2. `npm run wallet:google-auto`
3. Probar `/wallet/` en móvil con HTTPS

Detalle en [../entregables/wallet-pendiente.md](../entregables/wallet-pendiente.md)

---

## Registrar avance

Cada checkbox completado → anotar en [../cuentas/REGISTRO-HECHO.md](../cuentas/REGISTRO-HECHO.md)

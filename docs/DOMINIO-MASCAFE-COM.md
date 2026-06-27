# Corregir mascafe.com → GitHub Pages

Error típico: **NotServedByPagesError** — el dominio no apunta a GitHub.

---

## Diagnóstico

Si `mascafe.com` muestra una página de GoDaddy (“Próximo lanzamiento”, `/lander`), el DNS **no** apunta a GitHub.

Comprueba en terminal:

```bash
dig mascafe.com A +short
```

Debe mostrar `185.199.108.153` (y las otras 3 IPs de GitHub).  
**No** debe mostrar `76.223.54.146` ni `13.248.169.48`.

---

## DNS en GoDaddy

1. GoDaddy → **mascafe.com** → **DNS**
2. Desactiva reenvío / parking / “Coming soon”
3. **Elimina** registros A incorrectos (IPs de GoDaddy)
4. **Agrega** 4 registros A en `@`:

| Valor |
|-------|
| `185.199.108.153` |
| `185.199.109.153` |
| `185.199.110.153` |
| `185.199.111.153` |

5. **CNAME** para www:

| Tipo | Nombre | Valor |
|------|--------|-------|
| CNAME | www | `lasucursaldelcafe-droid.github.io` |

---

## Verificar en GitHub

1. https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. Custom domain: `mascafe.com` → Save
3. Espera check verde → activa **Enforce HTTPS**

---

## Mientras tanto: usar GitHub Pages o local

| Opción | URL |
|--------|-----|
| GitHub Pages | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| Local | `npm run preview` → http://localhost:4173/ |

---

## mascafé.com (con tilde)

Si configuraste **mascafé.com** en GitHub, el DNS es el mismo proceso pero para ese dominio. GitHub lo guarda como `xn--mascaf-gva.com` (formato técnico).

Verifica en Pages → Custom domain cuál dominio tienes activo.

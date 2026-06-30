# Conectar mascafé.com → GitHub Pages

**Dominio oficial de la marca:** **mascafé.com** (con tilde en la é).

En paneles técnicos (GitHub, DNS) puede aparecer como **`xn--mascaf-gva.com`** — es el mismo dominio en formato punycode.

---

## Diagnóstico

Si **mascafé.com** muestra una página de GoDaddy (“Próximo lanzamiento”, `/lander`), el DNS **no** apunta a GitHub.

```bash
dig mascafé.com A +short
# o
dig xn--mascaf-gva.com A +short
```

Debe mostrar las IPs de GitHub Pages:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**No** debe mostrar IPs de GoDaddy parking (`76.223.x.x`, `13.248.x.x`).

---

## DNS en GoDaddy

Panel: https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com

1. GoDaddy → **mascafé.com** → **DNS**
2. Desactiva reenvío / parking / “Coming soon”
3. **Elimina** registros A incorrectos (IPs de GoDaddy)
4. **Agrega** 4 registros **A** en `@`:

| Valor |
|-------|
| `185.199.108.153` |
| `185.199.109.153` |
| `185.199.110.153` |
| `185.199.111.153` |

5. **CNAME** para `www`:

| Tipo | Nombre | Valor |
|------|--------|-------|
| CNAME | www | `lasucursaldelcafe-droid.github.io` |

---

## Verificar en GitHub Pages

1. https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. Custom domain: **`mascafé.com`** (GitHub puede guardarlo como `xn--mascaf-gva.com`)
3. Espera el check DNS verde (10 min – 48 h)
4. Activa **Enforce HTTPS**

---

## URLs objetivo

| | URL |
|-|-----|
| Con www | https://www.mascafé.com/ |
| Sin www | https://mascafé.com/ |
| Técnico (punycode) | https://xn--mascaf-gva.com/ |

---

## Mientras tanto

| Opción | URL |
|--------|-----|
| GitHub Pages | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| Local | `npm run preview` → http://localhost:4173/ |

---

## Nota sobre correo

El sitio web usa **mascafé.com**. El correo corporativo puede ser `hola@mascafé.com` o un alias sin tilde según lo que permita GoDaddy — configurar en el panel de email del dominio.

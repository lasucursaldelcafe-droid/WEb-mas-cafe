# Corregir mascafe.com → GitHub Pages

Error en GitHub: **NotServedByPagesError** — el dominio no apunta a los servidores de GitHub Pages.

## Qué pasa ahora

| Qué | Estado actual |
|-----|----------------|
| DNS de `mascafe.com` | Apunta a GoDaddy (`76.223.54.146`, `13.248.169.48`) — página de parking |
| GitHub Pages | Configurado con dominio `mascafe.com` pero en estado **errored** |
| Sitio en GitHub | Listo en rama `gh-pages` (HTML + imágenes) |

Debes cambiar el DNS en el registrador del dominio (GoDaddy u otro).

---

## Paso 1 — DNS en GoDaddy (o tu registrador)

1. Entra a **GoDaddy** → **Mis productos** → dominio **`mascafe.com`**
2. **DNS** / **Administrar DNS**
3. **Desactiva** reenvío de dominio / parking / “Coming soon” si está activo
4. **Elimina** estos registros si existen:

| Tipo | Nombre | Valor incorrecto |
|------|--------|------------------|
| A | @ | `76.223.54.146` |
| A | @ | `13.248.169.48` |
| A | www | cualquier IP que no sea de GitHub |

5. **Agrega** estos registros para el dominio raíz:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | @ | `185.199.108.153` | 600 |
| A | @ | `185.199.109.153` | 600 |
| A | @ | `185.199.110.153` | 600 |
| A | @ | `185.199.111.153` | 600 |

6. **Subdominio www** (nombre alternativo):

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| CNAME | www | `lasucursaldelcafe-droid.github.io` | 600 |

> Si `www` ya tiene registros tipo A, bórralos y deja solo el CNAME.

---

## Paso 2 — Verificar en GitHub

1. https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages
2. **Custom domain:** `mascafe.com` → **Save**
3. Marca **Enforce HTTPS** cuando GitHub lo permita (tras propagar DNS, 15 min – 24 h)
4. Si ofrece nombre alternativo, añade **`www.mascafe.com`**

El check de DNS debería pasar de rojo a verde.

---

## Paso 3 — Comprobar propagación

En https://dnschecker.org busca `mascafe.com` tipo **A**. Debe mostrar las 4 IPs `185.199.108–111.153`.

O en terminal:

```bash
dig mascafe.com A +short
```

Debe listar las IPs de GitHub, **no** `76.223.54.146` ni `13.248.169.48`.

---

## URLs finales

| URL |
|-----|
| https://mascafe.com/ |
| https://www.mascafe.com/ |
| https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |

---

## Si usas otro registrador (no GoDaddy)

Los registros son los mismos: **4× A** en la raíz + **CNAME www** → `lasucursaldelcafe-droid.github.io`.

---

## Nota sobre mascafecol.com

Ese es otro dominio (el del contenido del sitio: email, Instagram). **`mascafe.com`** es el que configuraste en GitHub Pages ahora.

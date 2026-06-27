# Dominio GoDaddy + hosting GitHub Pages

> **No necesitas hosting de GoDaddy.** Solo el dominio.

La web se aloja gratis en **GitHub Pages**. El dominio `mascafecol.com` en GoDaddy apunta a GitHub mediante DNS.

**Guía completa:** [GITHUB-PAGES-Y-DOMINIO.md](./GITHUB-PAGES-Y-DOMINIO.md)

## Resumen rápido

1. **GitHub** → Settings → Pages → Source: **GitHub Actions**
2. Push a `main` → el sitio se publica solo
3. **GoDaddy DNS** → 4 registros A a las IPs de GitHub Pages
4. **GitHub** → Pages → Custom domain: `mascafecol.com`

## IPs de GitHub Pages (registros A)

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

## Si algún día compras hosting GoDaddy

Puedes generar un ZIP estático local:

```bash
npm run godaddy:prep
```

Sube `deploy/mascafe-web-godaddy.zip` a `public_html`. Pero con GitHub Pages **no hace falta**.

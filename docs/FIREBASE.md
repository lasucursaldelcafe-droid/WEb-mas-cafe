# Firebase (referencia)

Firebase Hosting es una **alternativa** a GitHub Pages.

Para el flujo principal del proyecto, usa:

- [GUIA-LOCAL.md](./GUIA-LOCAL.md) — ver en local
- [ACTIVAR-GITHUB-PAGES.md](./ACTIVAR-GITHUB-PAGES.md) — publicar en GitHub

---

## Deploy a Firebase

Proyecto: `mas-cafe-c8413`

```bash
npx firebase login
npm run deploy:firebase
```

Si tu organización bloquea claves JSON: usa `firebase login` o `firebase login:ci`.

Guía: [GUIA-PUBLICAR-SIN-INSTALAR.md](./GUIA-PUBLICAR-SIN-INSTALAR.md)

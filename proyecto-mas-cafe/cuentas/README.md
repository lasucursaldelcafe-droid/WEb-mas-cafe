# Cuentas — bloc de notas y credenciales

| Archivo | Uso |
|---------|-----|
| [ENLACES-CONFIGURACION.md](./ENLACES-CONFIGURACION.md) | **Enlaces** donde debes iniciar sesión y configurar |
| [SEGURIDAD.md](./SEGURIDAD.md) | **Credenciales y ejecución autónoma** (Secrets, .env.local, sin chat) |
| [REGISTRO-HECHO.md](./REGISTRO-HECHO.md) | **Bloc público** — pega links de lo ya hecho (sí va a Git) |
| [CREDENCIALES.template.md](./CREDENCIALES.template.md) | Plantilla para copiar |
| `CREDENCIALES.md` | **Bloc privado** — contraseñas y tokens (NO va a Git) |

## Crear el bloc de credenciales local

```bash
cp proyecto-mas-cafe/cuentas/CREDENCIALES.template.md proyecto-mas-cafe/cuentas/CREDENCIALES.md
```

Edita `CREDENCIALES.md` en tu computador. Nunca hagas `git add` de ese archivo.

## Regla de oro

- **En el chat con Cursor:** pega links y di «configurado» — no pegues contraseñas.
- **En CREDENCIALES.md:** usuarios, tokens, notas de 2FA para entrega al dueño.
- **En GitHub Secrets:** solo lo que necesita el deploy automático.

# Proyecto Más Café — carpeta única de entrega

Punto central para **todo lo hecho**, **migración a www.mascafé.com**, **cuentas** y **entrega final** a los dueños de la marca.

> Trabajo mutuo: tú entras credenciales y pegas enlaces de lo ya configurado → yo conecto código, DNS, deploy y documentación.

---

## Empieza aquí

| Archivo | Para qué |
|---------|----------|
| [AUTO-VS-MANUAL.md](./AUTO-VS-MANUAL.md) | Qué hace Cursor automáticamente vs qué debes hacer tú |
| [cuentas/ENLACES-CONFIGURACION.md](./cuentas/ENLACES-CONFIGURACION.md) | **Enlaces directos** a cada panel donde iniciar sesión y configurar |
| [cuentas/REGISTRO-HECHO.md](./cuentas/REGISTRO-HECHO.md) | **Bloc de notas** — pega aquí los links de lo que ya hiciste |
| [cuentas/CREDENCIALES.template.md](./cuentas/CREDENCIALES.template.md) | Plantilla para anotar usuarios, tokens y claves (copiar a `CREDENCIALES.md`) |
| [TRABAJO-MUTUO.md](./TRABAJO-MUTUO.md) | Cómo seguimos paso a paso la migración |
| [migracion/AUTOMATIZAR-DOMINIO.md](./migracion/AUTOMATIZAR-DOMINIO.md) | **Automático:** `npm run domain:configure` |
| [migracion/AUTOMATIZACION-AUTONOMA.md](./migracion/AUTOMATIZACION-AUTONOMA.md) | **Sin intervención:** workflows + `npm run setup:autonomous` |
| [migracion/CHECKLIST.md](./migracion/CHECKLIST.md) | Checklist manual si la API falla |
| [entregables/README.md](./entregables/README.md) | Resumen de todo lo construido en los repositorios |

---

## Configurar dominio en un comando

```bash
cp .env.example .env.local   # GODADDY_API_KEY + GITHUB_TOKEN
npm run domain:configure:dry # simular
npm run domain:configure     # aplicar
npm run domain:verify        # comprobar
```

Guía completa: [migracion/AUTOMATIZAR-DOMINIO.md](./migracion/AUTOMATIZAR-DOMINIO.md)

---

| Qué | URL |
|-----|-----|
| Sitio público | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ |
| Admin | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/admin/ |
| Informe constitución | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/ |
| Repositorio | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe |
| Dominio objetivo | https://www.mascafé.com (GoDaddy — pendiente DNS final) |
| Firebase (respaldo) | https://mas-cafe-c8413.web.app/ |

---

## Archivos editables del proyecto (en el repo)

| Archivo | Uso |
|---------|-----|
| `content/site.json` | Textos, menú, productos, blog |
| `content/informe-requisitos.json` | Checklist del informe (wallet, migración, requisitos) |
| `proyecto-mas-cafe/cuentas/REGISTRO-HECHO.md` | Lo que ya configuraste (links + estado) |
| `proyecto-mas-cafe/cuentas/CREDENCIALES.md` | **Solo local** — no se sube a GitHub |

---

## Seguridad de credenciales

- `CREDENCIALES.md` está en `.gitignore` — **nunca** hagas commit de contraseñas reales.
- En GitHub usa **Secrets** para CI/CD (Firebase, admin publish, etc.).
- Para entregar al dueño: exportar `CREDENCIALES.md` por canal seguro (USB, gestor de contraseñas, 1Password).

---

## Próximo paso contigo

1. Abre [cuentas/ENLACES-CONFIGURACION.md](./cuentas/ENLACES-CONFIGURACION.md)
2. Configura o verifica cada servicio
3. Pega en [cuentas/REGISTRO-HECHO.md](./cuentas/REGISTRO-HECHO.md) el enlace o captura de lo hecho
4. Escríbeme: «ya tengo X» con el link → yo actualizo el resto del proyecto

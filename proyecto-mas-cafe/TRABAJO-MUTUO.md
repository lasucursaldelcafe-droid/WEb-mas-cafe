# Trabajo mutuo — migración y puesta en línea

Cómo avanzamos juntos hasta tener **www.mascafe.com** en línea, proyecto entregado a **Más Café** y listo para **wallet**.

---

## Roles

| Rol | Quién | Hace |
|-----|-------|------|
| **Marca / dueños** | Más Café | Cuentas GoDaddy, Firebase, pagos, decisiones de negocio (puntos, premios) |
| **Cursor (agente)** | Este chat | Código, deploy, docs, conectar DNS cuando den acceso/links |
| **Registro compartido** | Archivos en `proyecto-mas-cafe/` | Estado vivo del proyecto |

---

## Ciclo en cada sesión

1. **Tú** abres [cuentas/ENLACES-CONFIGURACION.md](./cuentas/ENLACES-CONFIGURACION.md) y configuras el siguiente ítem pendiente.
2. **Tú** pegas el resultado en [cuentas/REGISTRO-HECHO.md](./cuentas/REGISTRO-HECHO.md) o me lo escribes en el chat.
3. **Yo** actualizo código, checklist, informe y te digo el siguiente paso.
4. **Tú** verificas la URL en el navegador.
5. Repetir hasta completar la fase.

---

## Orden recomendado (no saltar pasos)

### Fase 1 — Ya en línea (hecho)
- [x] Sitio en GitHub Pages
- [x] Admin + informe
- [x] CI/CD verde

### Fase 2 — Dominio mascafe.com (sitio estático)
1. Acceso GoDaddy → [REGISTRO](./cuentas/REGISTRO-HECHO.md)
2. DNS A + CNAME → [CHECKLIST migración](./migracion/CHECKLIST.md)
3. Custom domain en GitHub Pages
4. Verificar https://www.mascafe.com y https://mascafe.com
5. Actualizar `content/site.json` URLs a mascafe.com

### Fase 3 — Independencia Más Café
1. Org GitHub Más Café
2. Transferir repo
3. Cuentas Firebase/hosting a nombre de la marca
4. Completar [CREDENCIALES.md](./cuentas/CREDENCIALES.md) (local)

### Fase 4 — Wallet (requiere backend)
1. Activar Firebase Auth + Firestore
2. Reglas de puntos en `content/informe-requisitos.json`
3. Código wallet (Cursor)
4. Hosting Vercel/Render + DNS www → backend
5. Modo caja en el café

---

## Qué pegarme en el chat (ejemplos)

```
Ya tengo GoDaddy: https://dcc.godaddy.com/control/dnsmanagement?domainName=mascafe.com
```

```
GitHub Pages custom domain en verde: mascafe.com
```

```
Firebase: tengo acceso a mas-cafe-c8413, usuario dueño es hola@mascafe.com
```

```
Creé org GitHub: https://github.com/mascafe-colombia
```

Con eso yo conecto: DNS docs, `informe-requisitos.json`, `site.json`, workflows, siguiente tarea.

---

## Archivos que yo actualizo cuando me pasas links

| Archivo | Qué actualizo |
|---------|---------------|
| `proyecto-mas-cafe/cuentas/REGISTRO-HECHO.md` | [x] y fechas |
| `content/informe-requisitos.json` | estados pendiente → listo |
| `content/site.json` | website, email si cambian |
| `docs/DOMINIO-MASCAFE-COM.md` | notas DNS reales |
| Informe `/informe/` | regenerado en deploy |

---

## Entrega final al dueño

Carpeta completa `proyecto-mas-cafe/` + USB o ZIP con:

- `CREDENCIALES.md` (local, no Git)
- `REGISTRO-HECHO.md` (historial)
- Enlace al informe: `/informe/`
- Accesos transferidos a cuentas Más Café

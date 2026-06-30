# Qué puedo hacer automáticamente (Cursor) vs qué debes hacer tú

## Yo (Cursor / agente) — automático en el código

| Tarea | Estado |
|-------|--------|
| Editar sitio web (textos, diseño, páginas) | ✅ |
| Generar y publicar HTML en GitHub Pages (push a `main`) | ✅ |
| Regenerar informe constitución + wallet en `/informe/` | ✅ |
| Corregir workflows de GitHub Actions | ✅ |
| Preparar scripts de build, favicons, admin | ✅ |
| Documentar DNS, migración, checklist | ✅ |
| Conectar puntos cuando pegues links en `REGISTRO-HECHO.md` | ✅ |
| Actualizar `content/informe-requisitos.json` con estados | ✅ |
| Crear código wallet (login, puntos, admin) cuando backend esté listo | 🔜 |
| Configurar Vercel/Render desde código (`vercel.json`, etc.) | ✅ (falta cuenta tuya) |
| Cambiar DNS en GoDaddy | ❌ necesito acceso a tu cuenta |
| Crear cuenta Firebase / GitHub org nueva | ❌ requiere email y verificación humana |
| Pagar dominio o hosting | ❌ |
| Aprobar SMS/OTP para wallet (Twilio, Firebase Phone) | ❌ requiere facturación en tu cuenta |

---

## Tú (dueños / equipo Más Café) — manual con enlaces

| Tarea | Dónde | Enlace |
|-------|-------|--------|
| Iniciar sesión GoDaddy y editar DNS | GoDaddy | [Ver ENLACES-CONFIGURACION.md](./cuentas/ENLACES-CONFIGURACION.md#godaddy) |
| Activar dominio en GitHub Pages | GitHub | [Pages settings](https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/pages) |
| Crear secret `FIREBASE_TOKEN` (si quieren deploy Firebase) | GitHub Secrets | [Actions secrets](https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions) |
| Acceso admin Firebase (proyecto mas-cafe-c8413) | Firebase Console | [Proyecto](https://console.firebase.google.com/project/mas-cafe-c8413) |
| Transferir repo a org de Más Café (futuro) | GitHub | Crear org → Settings → Transfer |
| Cuenta Vercel/Render para www.mascafé.com con backend | Vercel o Render | Cuando activemos wallet |
| Email corporativo hola@mascafé.com | GoDaddy Email o Google Workspace | Panel GoDaddy |
| Pegar lo ya hecho | Este repo | [REGISTRO-HECHO.md](./cuentas/REGISTRO-HECHO.md) |

---

## Flujo de trabajo mutuo

```
TÚ                          CURSOR (yo)
 │                              │
 ├─ Entras a GoDaddy/Firebase   │
 ├─ Copias link o «listo»       │
 ├─ Pegas en REGISTRO-HECHO.md ─┼─ Leo el registro
 │                              ├─ Actualizo informe + checklist
 │                              ├─ Ajusto DNS docs / site.json
 │                              ├─ Configuro workflow / hosting
 │                              └─ Te digo el siguiente paso
 └─ Verificas URL en vivo ◄─────┘
```

---

## Fases y quién hace qué

| Fase | Tú | Yo |
|------|----|----|
| **A** Organización (cuentas a nombre Más Café) | Crear/transferir cuentas | Documentar y enlazar |
| **B** Sitio en línea (hoy) | Verificar URLs públicas | Mantener deploy GitHub Pages |
| **C** Dominio mascafé.com | DNS GoDaddy + custom domain GitHub | Guía + verificación `dig` |
| **D** Backend wallet | Firebase Auth billing / OTP si aplica | Código wallet + Firestore |
| **E** www.mascafé.com definitivo | DNS a Vercel/Render cuando haya backend | Deploy + SSL |
| **F** Entrega final | Revisar CREDENCIALES.md local | Paquete en `proyecto-mas-cafe/` |

# Plantilla de credenciales — Más Café

> **Copia este archivo a `CREDENCIALES.md`** (misma carpeta).  
> `CREDENCIALES.md` **no se sube a GitHub** (está en `.gitignore`).  
> Usa esto para la **entrega final** al dueño de la marca.

**Última actualización:** _______________  
**Responsable del registro:** _______________

---

## 1. GitHub

| Campo | Valor |
|-------|-------|
| Organización / usuario | |
| Repositorio | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe |
| Repo futuro (Más Café) | |
| Usuario admin GitHub | |
| Contraseña / 2FA | *(no escribir contraseña aquí si se entrega por gestor de contraseñas)* |
| Personal Access Token (si aplica) | |

### Secrets en GitHub Actions

| Secret | Configurado | Notas |
|--------|-------------|-------|
| `FIREBASE_TOKEN` | ☐ | `npx firebase login:ci` |
| `ADMIN_PUBLISH_KEY` | ☐ | Para publicar desde admin |

---

## 2. GoDaddy (mascafe.com)

| Campo | Valor |
|-------|-------|
| URL panel | https://dcc.godaddy.com/control/portfolio |
| Usuario / email cuenta | |
| Contraseña | *(gestor de contraseñas)* |
| Customer ID | |
| Dominio | mascafe.com |
| DNS management link | |

---

## 3. Firebase (mas-cafe-c8413)

| Campo | Valor |
|-------|-------|
| Consola | https://console.firebase.google.com/project/mas-cafe-c8413 |
| Google account dueño | |
| Project ID | mas-cafe-c8413 |
| Web App ID | 1:431985221060:web:ca46cb9027955bac091891 |
| API Key (pública, cliente) | AIzaSyA0oWtlIDDgbYT_VUpRmIQ_g1KNXtOa0JU |

### Service account (solo servidor — NO compartir públicamente)

| Campo | Valor |
|-------|-------|
| JSON guardado en | *(ruta local segura)* |
| En GitHub Secret `FIREBASE_SERVICE_ACCOUNT` | ☐ |

---

## 4. Panel admin del sitio

| Campo | Valor |
|-------|-------|
| URL admin | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/admin/ |
| URL futura | https://www.mascafe.com/admin/ |
| Usuario | admin |
| Contraseña | *(cambiar en producción — ver `content/users.json`)* |

---

## 5. Hosting backend (Vercel / Render — cuando exista)

| Campo | Valor |
|-------|-------|
| Plataforma | |
| Dashboard URL | |
| Cuenta email | |
| Proyecto / servicio | |
| Dominio custom | www.mascafe.com |
| Variables de entorno | ver `.env.example` |

---

## 6. Correo corporativo

| Email | Proveedor | Usuario | Notas |
|-------|-----------|---------|-------|
| hola@mascafe.com | | | |
| admin@mascafe.com | | | |

---

## 7. Redes y WhatsApp

| Servicio | URL / usuario |
|----------|---------------|
| Instagram | https://www.instagram.com/mascafecol315 |
| Facebook | https://www.facebook.com/mascafecol |
| WhatsApp | +57 315 657 3897 |

---

## 8. Google Drive (marca)

| Campo | Valor |
|-------|-------|
| Carpeta | https://drive.google.com/drive/folders/153OUmu9lChpCk2NiiirUwI_Z5EDQQNtC |
| Cuenta Google dueña | |

---

## 9. Wallet / OTP (fase 2)

| Campo | Valor |
|-------|-------|
| Proveedor SMS | Firebase Phone / Twilio |
| Cuenta Twilio (si aplica) | |
| Account SID | |
| Auth Token | *(secreto)* |

---

## 10. Cursor (desarrollo continuo)

| Campo | Valor |
|-------|-------|
| Cuenta Cursor | |
| Repo conectado | |
| Quién puede pedir cambios | |

---

## Entrega al dueño — checklist

- [ ] `CREDENCIALES.md` completo en USB o gestor de contraseñas
- [ ] Accesos transferidos a cuenta de Más Café (no personal)
- [ ] 2FA documentado o reseteado con email corporativo
- [ ] Este repositorio (o el futuro) con acceso de admin para el dueño
- [ ] Informe actualizado: `/informe/`
- [ ] Carpeta `proyecto-mas-cafe/` revisada

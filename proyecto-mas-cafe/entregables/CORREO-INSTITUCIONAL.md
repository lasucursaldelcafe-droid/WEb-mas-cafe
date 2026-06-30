# Correo institucional — administracion@mascafé.com

Guía para activar correo profesional con el dominio **mascafé.com**.

**Recomendación:** [Zoho Mail](https://www.zoho.com/mail/) plan **gratuito** (hasta 5 usuarios, 5 GB cada uno). Permite enviar y recibir como `@mascafé.com` sin pagar GoDaddy Email ni Google Workspace.

| Buzón | Uso |
|-------|-----|
| `administracion@mascafé.com` | Gestión interna, facturas, proveedores |
| `hola@mascafé.com` | Contacto público del sitio web |

---

## Lo que ya automatizamos (Cursor + GoDaddy API)

| Comando | Qué hace |
|---------|----------|
| `npm run email:status` | Muestra MX/SPF actuales y siguientes pasos |
| `npm run email:verify-domain -- --txt "zoho-verification=..."` | Añade TXT de verificación en GoDaddy |
| `npm run email:configure -- --provider zoho` | Configura MX + SPF para Zoho |
| `npm run email:dkim -- --selector zmail --value "v=DKIM1; ..."` | Añade DKIM (menos spam) |
| `npm run email:verify` | Comprueba que MX y SPF estén activos |

Requisito: `GODADDY_API_KEY` y `GODADDY_API_SECRET` en `.env.local` o GitHub Secrets.

---

## Paso a paso (una sola vez, ~15 min)

### 1. Crear cuenta Zoho Mail (gratis)

1. Entra en https://www.zoho.com/mail/zohomail-pricing.html  
2. Elige **Forever Free** (hasta 5 usuarios)  
3. Regístrate con un correo personal (Gmail) que usarás solo para administrar Zoho  
4. País: Colombia · Idioma: español  

### 2. Añadir el dominio mascafé.com

1. En [Zoho Mail Admin](https://mailadmin.zoho.com/) → **Dominios** → **Añadir dominio**  
2. Escribe: `mascafé.com` (con tilde; Zoho acepta IDN)  
3. Elige verificación por **TXT**  
4. Copia el valor, por ejemplo: `zoho-verification=zb12345678`  

### 3. Verificar dominio (automático desde el repo)

En tu máquina o desde Cursor (con credenciales GoDaddy):

```bash
npm run email:verify-domain -- --txt "zoho-verification=PEGA_AQUI_EL_CODIGO"
```

Vuelve a Zoho Admin → **Verificar dominio** (debe poner verde en 5–30 min).

### 4. Crear el buzón administracion@

1. Zoho Admin → **Usuarios** → **Añadir usuario**  
2. Nombre: Administración Más Café  
3. Correo: `administracion@mascafé.com`  
4. Contraseña segura → guardar en `CREDENCIALES.md` (local, no en Git)  
5. (Opcional) Repetir para `hola@mascafé.com`  

### 5. Activar recepción de correo (MX en GoDaddy)

**Solo después** de crear el buzón en Zoho:

```bash
npm run email:configure -- --provider zoho
```

Esto configura:

| Tipo | Valor |
|------|-------|
| MX 10 | mx.zoho.com |
| MX 20 | mx2.zoho.com |
| MX 50 | mx3.zoho.com |
| TXT @ | `v=spf1 include:zoho.com ~all` |

### 6. DKIM (recomendado — mejor entrega)

1. Zoho Admin → Dominio → **Email Configuration** → DKIM  
2. Copia selector (`zmail`) y valor TXT  
3. Ejecuta:

```bash
npm run email:dkim -- --selector zmail --value "v=DKIM1; k=rsa; p=MII..."
```

### 7. Probar

```bash
npm run email:verify
```

- Envía un correo **desde tu Gmail personal** a `administracion@mascafé.com`  
- Responde desde Zoho webmail: https://mail.zoho.com/  
- Comprueba que no caiga en spam  

---

## Acceso diario

| Qué | Dónde |
|-----|-------|
| Webmail | https://mail.zoho.com/ |
| App móvil | Zoho Mail (iOS / Android) |
| IMAP (Outlook, Apple Mail) | Zoho Admin → configuración del usuario |

---

## Alternativas (si no quieren Zoho)

| Opción | Costo | Envío como @mascafé.com | Notas |
|--------|-------|-------------------------|-------|
| **Zoho Mail Free** | Gratis | ✅ Sí | Recomendado |
| **Google Workspace** | ~USD 7/mes/usuario | ✅ Sí | Si ya usan Google |
| **GoDaddy Email** | ~USD 2–6/mes | ✅ Sí | Panel https://email.godaddy.com/ |
| **ImprovMX** | Gratis | ❌ Solo reenvío | `npm run email:configure -- --provider improvmx` |

---

## Importante

- **No cambies MX** hasta tener el buzón creado en Zoho; si no, el correo rebotará.  
- El sitio web (`www.mascafé.com`) **no se afecta** — solo cambian registros de correo (MX/TXT).  
- Si ya compraron GoDaddy Email, usen el panel de GoDaddy en lugar de Zoho.  

---

## Después de activar

Anota en [REGISTRO-HECHO.md](../cuentas/REGISTRO-HECHO.md):

```
- [x] administracion@mascafé.com | Zoho Mail | fecha
- [x] hola@mascafé.com | Zoho Mail | fecha
```

Contraseñas solo en [CREDENCIALES.md](../cuentas/CREDENCIALES.md) (archivo local).

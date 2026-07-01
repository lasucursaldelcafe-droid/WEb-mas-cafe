# Registro de lo ya hecho — bloc de notas

Pega aquí los enlaces, capturas o notas de cada cosa que configures. **Yo leo este archivo y conecto el resto del proyecto.**

Formato sugerido por línea:

```
- [ ] o [x] SERVICIO | URL o nota | Fecha | Quién
```

---

## Plantilla — copia y rellena debajo

```markdown
### GitHub
- [ ] Repo accesible | https://github.com/... | | 

### GoDaddy
- [x] DNS automático | npm run domain:configure | 2026-06-30 | Cursor script
- [ ] Dominio mascafé.com activo | https://dcc.godaddy.com/... | |
- [ ] DNS apuntando a GitHub Pages | (pegar resultado dig o screenshot) | |
- [ ] Custom domain en GitHub Pages verde | https://github.com/.../settings/pages | |

### Firebase
- [ ] Proyecto mas-cafe-c8413 accesible | https://console.firebase.google.com/project/mas-cafe-c8413 | |
- [ ] FIREBASE_TOKEN en GitHub Secrets | (no pegar el token aquí — solo «configurado») | |

### Hosting futuro (wallet)
- [ ] Cuenta Vercel / Render creada | https://... | |

### Correo
- [ ] hola@mascafé.com activo | Zoho Mail | |
- [ ] administracion@mascafé.com activo | Zoho Mail | |
- [ ] DNS MX configurado | `npm run email:configure` | |

### Otros
- [ ] Google Drive marca | https://drive.google.com/... | |
```

---

## Registro vivo (editar aquí)

### GitHub
- [x] Repositorio activo | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe | 2026-06 | La Sucursal del Café
- [x] GitHub Pages en línea | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/ | 2026-06 |
- [x] Workflows CI corregidos (Pages verde) | https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions | 2026-06-27 |
- [x] Informe constitución + wallet | https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/informe/ | 2026-06-27 |
- [ ] Organización GitHub a nombre Más Café | | |
- [ ] Repo transferido a org Más Café | | |

### GoDaddy
- [x] API GoDaddy Production (key + secret en GitHub Secrets) | https://developer.godaddy.com/keys | 2026-06-30 | configurado
- [x] DNS A @ + CNAME www vía API | npm run domain:configure | 2026-06-30 | aplicado — propagado
- [x] DNS público (8.8.8.8) apunta a GitHub Pages | dig A @ → 185.199.x.x | 2026-06-30 |
- [x] Custom domain activado en GitHub Pages | xn--mascaf-gva.com | 2026-06-30 |
- [x] DNS automático GitHub Pages | npm run godaddy:optimize | 2026-06-30 | Cursor
- [x] A records + CNAME www correctos en GoDaddy API | 4 IPs GitHub | 2026-06-30 |
- [x] Parking GoDaddy resuelto | nameservers sirven GitHub | 2026-06-30 |
- [ ] HTTPS certificado + Enforce HTTPS | `npm run domain:enable-https` | cert en estado «new» |

### Supabase (wallet — backend gratuito)
- [x] Proyecto creado | https://oogzhvdsjkvmwscqrfyu.supabase.co | 2026-07-01 |
- [x] Secrets en GitHub (7 claves) | npm run wallet:connect | 2026-07-01 |
- [x] Migraciones SQL + Edge Function wallet | supabase db push + deploy | 2026-07-01 |
- [x] Programa fidelización sembrado (PIN 123456) | Postgres | 2026-07-01 |
- [x] Auth Email + redirects (autoconfirm) | Management API | 2026-07-01 |
- [ ] Auth Google | Requiere Client ID en Google Cloud + Supabase | |
- [x] Wallet HTTP en mascafé.com | http://xn--mascaf-gva.com/wallet/ | 2026-07-01 |
- [ ] HTTPS mascafé.com | npm run domain:enable-https | cert pendiente |
- [ ] Prueba registro cliente en móvil | /wallet/ | |

### Google Wallet (tarjeta nativa Android — Google Cloud, no Firebase)
- [x] Merchant ID + Issuer ID en GitHub Secrets | workflow | 2026-07-01 |
- [x] LoyaltyClass mas_cafe_loyalty creada | Pay Console | 2026-07-01 |
- [x] Issuer/Merchant ID en Supabase secrets | npm run wallet:google-auto:ids | 2026-07-01 |
- [x] Edge Function wallet desplegada | supabase functions deploy | 2026-07-01 |
- [ ] FIREBASE_SERVICE_ACCOUNT válido (JSON GCP) | GitHub Secrets — actualmente texto «Wallet aut…», no JSON | |
- [ ] Secrets GOOGLE_WALLET_SERVICE_ACCOUNT en Supabase | npm run wallet:google-import-sa -- ./sa.json | |
- [ ] Botón «Añadir a Google Wallet» activo | /wallet/ pestaña QR | requiere JSON GCP |
- [ ] Emisor aprobado por Google (publicación) | UNDER_REVIEW → LIVE | 24–48 h |

### Firebase
- [ ] Acceso consola mas-cafe-c8413 | https://console.firebase.google.com/project/mas-cafe-c8413 | |
- [ ] FIREBASE_TOKEN renovado en GitHub Secrets | | |
- [ ] Firestore activado (wallet) | | |
- [ ] Authentication activado (wallet) | | |

### Hosting backend (fase wallet)
- [ ] Vercel o Render conectado al repo | | |
- [ ] www.mascafé.com apuntando al hosting con API | | |

### Contenido y marca
- [x] Carpeta Drive marca | https://drive.google.com/drive/folders/153OUmu9lChpCk2NiiirUwI_Z5EDQQNtC | |
- [x] Manifiesto Drive (fuentes + imágenes) | content/drive-assets.json | 2026-06-30 |
- [x] Admin: tipografías e imágenes desde Drive | /admin/ → Colores y fuentes | 2026-06-30 |
- [x] Admin: navegación desplegable | /admin/ | 2026-06-30 |
- [x] Admin: informe embebido + analytics | /admin/ → Informe, Análisis | 2026-06-30 |
- [x] Informe constitucional v1.5 | /informe/ | 2026-06-30 |
- [ ] Fotos reales del local subidas | | |
- [ ] Reglas de puntos acordadas | ver `content/informe-requisitos.json` → wallet.reglasNegocio | |

### Cursor
- [x] Proyecto editable con Cursor Cloud Agent | este repositorio | 2026-06 |
- [ ] Repo futuro conectado en Cursor (org Más Café) | | |

### Seguridad y documentación
- [x] Guía SEGURIDAD.md (secrets + ejecución autónoma) | proyecto-mas-cafe/cuentas/SEGURIDAD.md | 2026-06-30 |
- [x] Checklist wallet gratis paso a paso | proyecto-mas-cafe/entregables/WALLET-CHECKLIST-GRATIS.md | 2026-06-30 |
- [x] SEO + favicon + sitemap + JSON-LD | proyecto-mas-cafe/entregables/SEO-CHECKLIST.md | 2026-06-30 |
- [x] Google Search Console verificado | DNS TXT + meta tag | 2026-06-30 |
- [x] Sitemap enviado en Search Console | http://mascafé.com/sitemap.xml | 2026-06-30 | Más Café
- [x] Sitemap ping automático | npm run post:publish | 2026-06-30 |
- [x] Mantenimiento HTTPS programado | .github/workflows/maintain-domain.yml | 2026-06-30 |
- [ ] Google Business Profile (Maps) | https://business.google.com | |

---

## Lo que me pegues en el chat

Cuando escribas algo como:

> «Ya configuré GoDaddy: https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com»

Yo actualizaré:

1. Este archivo (marcar [x])
2. `content/informe-requisitos.json` (estados)
3. Documentación DNS / migración si hace falta
4. Te diré el siguiente paso concreto

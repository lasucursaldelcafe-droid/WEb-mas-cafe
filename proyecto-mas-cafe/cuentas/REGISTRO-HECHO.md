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
- [ ] hola@mascafé.com activo | | |

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
- [ ] **Quitar reenvío/parking GoDaddy** (requerido para HTTPS) | DNS → Reenvío → Eliminar | **PENDIENTE — bloquea SSL** |
- [ ] HTTPS certificado + Enforce HTTPS | `npm run domain:enable-https` | tras quitar parking |

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
- [ ] Fotos reales del local subidas | | |
- [ ] Reglas de puntos acordadas | ver `content/informe-requisitos.json` → wallet.reglasNegocio | |

### Cursor
- [x] Proyecto editable con Cursor Cloud Agent | este repositorio | 2026-06 |
- [ ] Repo futuro conectado en Cursor (org Más Café) | | |

### Seguridad y documentación
- [x] Guía SEGURIDAD.md (secrets + ejecución autónoma) | proyecto-mas-cafe/cuentas/SEGURIDAD.md | 2026-06-30 |
- [x] Checklist wallet gratis paso a paso | proyecto-mas-cafe/entregables/WALLET-CHECKLIST-GRATIS.md | 2026-06-30 |
- [x] SEO + favicon + sitemap + JSON-LD | proyecto-mas-cafe/entregables/SEO-CHECKLIST.md | 2026-06-30 |
- [ ] Google Search Console verificado | https://search.google.com/search-console | |
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

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
- [ ] Acceso a cuenta GoDaddy de mascafé.com | | |
- [ ] DNS configurado (A + CNAME) | | |
- [ ] Dominio verificado en GitHub Pages (check verde) | | |
- [ ] HTTPS forzado en GitHub Pages | | |

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

---

## Lo que me pegues en el chat

Cuando escribas algo como:

> «Ya configuré GoDaddy: https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com»

Yo actualizaré:

1. Este archivo (marcar [x])
2. `content/informe-requisitos.json` (estados)
3. Documentación DNS / migración si hace falta
4. Te diré el siguiente paso concreto

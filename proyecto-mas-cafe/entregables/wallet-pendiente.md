# Wallet de fidelización — pendiente de desarrollo

Documentado en el informe `/informe/#wallet`. Requisitos en `content/informe-requisitos.json`.

## Por qué aún no está en línea

La wallet necesita:
- Login de **clientes** (no solo admin)
- Base de datos (Firestore o Convex)
- API server-side para sumar/restar puntos
- Hosting con Node.js (no solo GitHub Pages estático)

## Antes de programar (decisiones de Más Café)

Completar en `content/informe-requisitos.json` → `wallet.reglasNegocio`:
- Puntos por peso gastado
- Caducidad
- Premios canjeables
- Quién opera la caja

## Cuando estén listos

1. Activar Firebase Auth + Firestore
2. Pedir a Cursor: «implementar wallet MVP»
3. Deploy en Vercel + DNS www.mascafé.com al nuevo hosting

Enlaces: [../cuentas/ENLACES-CONFIGURACION.md](../cuentas/ENLACES-CONFIGURACION.md)

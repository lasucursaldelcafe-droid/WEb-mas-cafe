#!/usr/bin/env bash
# Ejecutar en Google Cloud Shell (terminal del navegador en console.cloud.google.com)
set -euo pipefail

echo ""
echo "══════════════════════════════════════════════"
echo "  Más Café — Publicar en Firebase Hosting"
echo "  Proyecto: mas-cafe-c8413"
echo "══════════════════════════════════════════════"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js no encontrado. Usa Google Cloud Shell (ya incluye Node)."
  exit 1
fi

echo "▸ Node $(node --version) | npm $(npm --version)"
echo ""

if [ ! -f package.json ]; then
  echo "❌ Ejecuta este script desde la raíz del repo WEb-mas-cafe."
  echo "   Ejemplo:"
  echo "   git clone https://<TOKEN>@github.com/lasucursaldelcafe-droid/WEb-mas-cafe.git"
  echo "   cd WEb-mas-cafe && bash scripts/publicar-cloud-shell.sh"
  exit 1
fi

echo "▸ Instalando dependencias..."
npm install

echo ""
echo "▸ Inicio de sesión Firebase (si aún no estás logueado)..."
if ! npx firebase projects:list --project mas-cafe-c8413 >/dev/null 2>&1; then
  npx firebase login --no-localhost
fi

echo ""
echo "▸ Generando sitio y desplegando..."
npm run deploy:firebase

echo ""
echo "✅ Listo. Abre:"
echo "   https://mas-cafe-c8413.web.app/"
echo "   https://mas-cafe-c8413.firebaseapp.com/"
echo ""

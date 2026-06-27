# Más Café — Ayuda para instalar Node y publicar en Windows
# Ejecutar PowerShell COMO ADMINISTRADOR desde la carpeta del proyecto:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\scripts\publicar-windows.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mas Cafe - Instalacion y publicacion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Command($name) {
    return $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

# Node.js
if (-not (Test-Command "node")) {
    Write-Host "Node.js no encontrado. Intentando instalar con winget..." -ForegroundColor Yellow
    if (Test-Command "winget") {
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        Write-Host ""
        Write-Host "Node instalado. CIERRA esta ventana, abre PowerShell nueva y vuelve a ejecutar este script." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "Instala Node manualmente: https://nodejs.org/ (version LTS)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Node: $(node --version)" -ForegroundColor Green
Write-Host "npm:  $(npm --version)" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "package.json")) {
    Write-Host "Ejecuta este script desde la carpeta WEb-mas-cafe (donde esta package.json)." -ForegroundColor Red
    exit 1
}

Write-Host "Instalando dependencias del proyecto..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Iniciando sesion en Firebase (se abrira el navegador)..." -ForegroundColor Cyan
npx firebase login

Write-Host ""
Write-Host "Publicando sitio en mas-cafe-c8413..." -ForegroundColor Cyan
npm run deploy:firebase

Write-Host ""
Write-Host "Listo. Abre: https://mas-cafe-c8413.web.app/" -ForegroundColor Green
Write-Host ""

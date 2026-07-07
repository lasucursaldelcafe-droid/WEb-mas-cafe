#Requires -Version 5.1
<#
.SYNOPSIS
  Genera ejecutable Windows (.exe) del agente HTTPS con PyInstaller.

.USAGE
  .\tools\windows-https-agent\build-exe.ps1

  El .exe abre la interfaz gráfica. Sigue necesitando:
  - Repo clonado con .env.local
  - Node.js/npm para reparaciones locales
#>
$ErrorActionPreference = "Stop"
$AgentDir = $PSScriptRoot
$RepoRoot = Resolve-Path (Join-Path $AgentDir "..\..")
$VenvDir = Join-Path $AgentDir ".venv"
$Python = Join-Path $VenvDir "Scripts\python.exe"
$DistDir = Join-Path $AgentDir "dist"

if (-not (Test-Path $Python)) {
    Write-Host "Ejecuta primero: .\install.ps1"
    exit 1
}

Write-Host "▸ Instalando PyInstaller…"
& $Python -m pip install -q pyinstaller

Write-Host "▸ Compilando MasCafe-HTTPS-Agent.exe…"
$env:PYTHONPATH = $AgentDir
Push-Location $AgentDir

& $Python -m PyInstaller `
    --noconfirm `
    --onefile `
    --windowed `
    --name "MasCafe-HTTPS-Agent" `
    --paths $AgentDir `
    --hidden-import mascafe_agent.gui `
    --hidden-import mascafe_agent.status `
    --hidden-import mascafe_agent.github_pages `
    --hidden-import mascafe_agent.runner `
    --hidden-import mascafe_agent.env_loader `
    --hidden-import mascafe_agent.config `
    (Join-Path $AgentDir "launcher_gui.py")

Pop-Location

$Exe = Join-Path $DistDir "MasCafe-HTTPS-Agent.exe"
if (Test-Path $Exe) {
    Write-Host ""
    Write-Host "✅ Ejecutable: $Exe"
    Write-Host ""
    Write-Host "Copia el .exe a la raíz del repo o crea un acceso directo."
    Write-Host "Debe ejecutarse con el repo y .env.local en la misma máquina."
} else {
    Write-Host "❌ No se generó el ejecutable"
    exit 1
}

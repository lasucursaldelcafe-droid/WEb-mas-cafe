#Requires -Version 5.1
<#
.SYNOPSIS
  Instala el agente HTTPS mascafé.com en Windows (Python + tarea programada).

.USAGE
  Abre PowerShell como usuario normal en la carpeta del repo y ejecuta:
    .\tools\windows-https-agent\install.ps1

  Opciones:
    -SkipSchedule     No registra tarea en el Programador de tareas
    -WithTray         Instala pystray + Pillow para icono en bandeja
#>
param(
    [switch]$SkipSchedule,
    [switch]$WithTray
)

$ErrorActionPreference = "Stop"
$AgentDir = $PSScriptRoot
$RepoRoot = Resolve-Path (Join-Path $AgentDir "..\..")
$VenvDir = Join-Path $AgentDir ".venv"
$Python = Join-Path $VenvDir "Scripts\python.exe"
$LogDir = Join-Path $AgentDir "logs"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════"
Write-Host "  Instalador — Agente HTTPS mascafé.com"
Write-Host "═══════════════════════════════════════════════════"
Write-Host "Repo: $RepoRoot"
Write-Host ""

function Test-Command($Name) {
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

if (-not (Test-Command py)) {
    Write-Host "❌ Python no encontrado. Instala Python 3.11+ desde https://www.python.org/downloads/"
    Write-Host "   Marca «Add python.exe to PATH» durante la instalación."
    exit 1
}

if (-not (Test-Command npm)) {
    Write-Host "❌ Node.js/npm no encontrado. Instala Node.js 22+ desde https://nodejs.org/"
    exit 1
}

if (-not (Test-Path (Join-Path $RepoRoot ".env.local"))) {
    Write-Host "⚠️  No existe .env.local — copia .env.example y añade credenciales:"
    Write-Host "   GODADDY_API_KEY, GODADDY_API_SECRET, GH_PAGES_PAT"
    Write-Host ""
}

Write-Host "▸ Creando entorno virtual Python…"
if (-not (Test-Path $VenvDir)) {
    py -3 -m venv $VenvDir
}

Write-Host "▸ Instalando dependencias Python…"
& $Python -m pip install --upgrade pip | Out-Null
& $Python -m pip install -r (Join-Path $AgentDir "requirements.txt")

if ($WithTray) {
    Write-Host "▸ Instalando bandeja del sistema (pystray, Pillow)…"
    & $Python -m pip install "pystray>=0.19.5" "Pillow>=10.0.0"
}

Write-Host "▸ Instalando dependencias Node (npm ci)…"
Push-Location $RepoRoot
npm ci
Pop-Location

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$MonitorScript = Join-Path $AgentDir "run-scheduled.ps1"
@'
# Ejecutado por el Programador de tareas de Windows
$ErrorActionPreference = "Continue"
$AgentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $AgentDir "..\..")
$Python = Join-Path $AgentDir ".venv\Scripts\python.exe"
$env:PYTHONPATH = $AgentDir
Set-Location $RepoRoot
& $Python -m mascafe_agent monitor --once --wait 15 2>&1 | Out-File -Append (Join-Path $AgentDir "logs\scheduled.log")
'@ | Set-Content -Path $MonitorScript -Encoding UTF8

if (-not $SkipSchedule) {
    $TaskName = "MasCafe-HTTPS-Agent"
    Write-Host "▸ Registrando tarea programada: $TaskName (cada 3 horas)…"

    $Action = New-ScheduledTaskAction -Execute "powershell.exe" `
        -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$MonitorScript`"" `
        -WorkingDirectory $RepoRoot

    $Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) `
        -RepetitionInterval (New-TimeSpan -Hours 3) `
        -RepetitionDuration ([TimeSpan]::MaxValue)

    $Settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -ExecutionTimeLimit (New-TimeSpan -Hours 2)

    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger `
        -Settings $Settings -Description "Monitorea y repara HTTPS en mascafé.com" `
        -Force | Out-Null

    Write-Host "  ✓ Tarea registrada. Ver: taskschd.msc → $TaskName"
}

Write-Host ""
Write-Host "✅ Instalación completa"
Write-Host ""
Write-Host "Comandos:"
Write-Host "  Estado:   .\tools\windows-https-agent\run-status.bat"
Write-Host "  Reparar:  .\tools\windows-https-agent\run-fix.bat"
Write-Host "  Monitor:  .\tools\windows-https-agent\run-monitor.bat"
Write-Host "  CI remoto: $Python -m mascafe_agent fix --ci"
if ($WithTray) {
    Write-Host "  Bandeja:  $Python -m mascafe_agent tray"
}
Write-Host ""

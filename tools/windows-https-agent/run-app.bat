@echo off
REM Aplicación Windows — Agente HTTPS mascafé.com (interfaz gráfica)
cd /d "%~dp0..\.."
set PYTHONPATH=%~dp0
if exist "%~dp0.venv\Scripts\pythonw.exe" (
  start "" "%~dp0.venv\Scripts\pythonw.exe" -m mascafe_agent gui
) else if exist "%~dp0.venv\Scripts\python.exe" (
  start "" "%~dp0.venv\Scripts\python.exe" -m mascafe_agent gui
) else (
  pythonw -m mascafe_agent gui 2>nul || python -m mascafe_agent gui
)

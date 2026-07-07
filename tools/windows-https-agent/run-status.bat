@echo off
REM Estado actual del dominio mascafé.com
cd /d "%~dp0..\.."
set PYTHONPATH=%~dp0
if exist "%~dp0.venv\Scripts\python.exe" (
  "%~dp0.venv\Scripts\python.exe" -m mascafe_agent status
) else (
  python -m mascafe_agent status
)
pause

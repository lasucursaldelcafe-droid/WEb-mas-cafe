@echo off
REM Monitor HTTPS — bucle cada 3 horas (Ctrl+C para detener)
cd /d "%~dp0..\.."
set PYTHONPATH=%~dp0
if exist "%~dp0.venv\Scripts\python.exe" (
  "%~dp0.venv\Scripts\python.exe" -m mascafe_agent monitor --interval 10800
) else (
  python -m mascafe_agent monitor --interval 10800
)
pause

@echo off
REM Agente HTTPS mascafé.com — una ejecución
cd /d "%~dp0..\.."
set PYTHONPATH=%~dp0
if exist "%~dp0.venv\Scripts\python.exe" (
  "%~dp0.venv\Scripts\python.exe" -m mascafe_agent fix %*
) else (
  python -m mascafe_agent fix %*
)
if errorlevel 1 exit /b 1
exit /b 0

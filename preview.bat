@echo off
REM Starts the local dev server at http://localhost:5173/ and opens a browser.
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found on PATH.
  echo Install it from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies, this only happens the first time...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting dev server on http://localhost:5180/
echo Vite prints the URL below and opens it in your browser.
echo If that port is busy it picks the next free one, so use the URL it prints.
echo Press Ctrl+C in this window to stop it.
echo.
REM --open lets Vite launch the browser on the port it actually bound to.
call npm run dev -- --open

pause

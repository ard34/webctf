@echo off
echo ========================================
echo   CTF Platform - Backend Server
echo ========================================
echo.

echo [1/3] Checking port 3000...
call npm run kill-port
timeout /t 2 /nobreak >nul

echo [2/3] Starting backend server...
echo.
call npm run dev

pause


@echo off
chcp 65001 >nul
title Stop B-Zone (Table + TV + NFC)
echo   Stopping B-Zone services (Table 5273 + TV 5274 + NFC 8788) ...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5273 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5274 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8788 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo   Stopped. (Close any fullscreen Chrome windows with Alt+F4.)
timeout /t 2 /nobreak >nul

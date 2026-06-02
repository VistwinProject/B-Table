@echo off
chcp 65001 >nul
title 停止 B 區 桌面投影
echo   停止 B 區 服務(NFC server 8788 + 網頁 5273）...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5273 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8788 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo   已停止。(若仍有殘留的黑視窗,手動關閉即可）
timeout /t 2 /nobreak >nul

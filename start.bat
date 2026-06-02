@echo off
chcp 65001 >nul
title B 區 感應光寓 - 桌面投影
cd /d "%~dp0"

echo.
echo   B 區 感應光寓 - 桌面投影 啟動中
echo   ============================================================
echo.

REM ── 1. 確認 Node.js / npm ────────────────────────────────────
where npm >nul 2>&1
if errorlevel 1 set "PATH=C:\nvm4w\nodejs;%PATH%"
where npm >nul 2>&1
if errorlevel 1 (
    echo   [錯誤] 找不到 Node.js / npm。請先安裝 Node 18+：https://nodejs.org
    pause
    exit /b 1
)

REM ── 2. 確認 Python ───────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo   [錯誤] 找不到 Python。請先安裝 Python 3.11+：https://python.org
    pause
    exit /b 1
)

REM ── 3. Python 套件(NFC server 需要)─────────────────────────
python -c "import smartcard, websockets" >nul 2>&1
if errorlevel 1 (
    echo   [安裝] pyscard + websockets ...
    python -m pip install pyscard websockets
)

REM ── 4. 前端套件 ──────────────────────────────────────────────
if not exist "node_modules" (
    echo   [安裝] npm 套件(第一次較久）...
    call npm install
)

REM ── 5. 建置(每次都重建,確保跑到最新程式;此 app 很小,約 1 秒）──
echo   [建置] npm run build ...
call npm run build

REM ── 6. 啟動 B 區 NFC server(埠口 8788）─────────────────────
echo   [1/2] 啟動 NFC server (8788) ...
start "B NFC Server (8788)" cmd /k python server\server.py

REM ── 7. 啟動網頁(埠口 5273）─────────────────────────────────
echo   [2/2] 啟動網頁 (5273) ...
start "B Web (5273)" cmd /k npm run preview

REM ── 8. 等伺服器起來,開瀏覽器(Chrome 全螢幕）───────────────
echo   等待伺服器啟動 ...
timeout /t 6 /nobreak >nul

echo   開啟瀏覽器 ...
start chrome --app=http://localhost:5273 --start-fullscreen
if errorlevel 1 start "" "http://localhost:5273"

echo.
echo   完成!會開兩個黑視窗(NFC Server / Web)— 請保持開啟。
echo   要停止:關掉那兩個視窗,或執行 stop.bat。
echo   投影全螢幕後,按 F11 可切換、Alt+F4 關閉瀏覽器。
echo.
pause

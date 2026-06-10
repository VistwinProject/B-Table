@echo off
chcp 65001 >nul
title B-Zone Sensing Home - Launch All (Table + TV)
setlocal enableextensions

REM ============================================================================
REM  B-Zone one-click launcher: Table projection + TV + shared NFC server.
REM  Table  = this folder (b-livingroom), web 5273
REM  TV     = sibling b-tv,             web 5274 (connects to same NFC 8788)
REM  One shared NFC server (8788) - started once to avoid a port clash.
REM  ASCII only on purpose: Chinese in a .bat breaks under the Big5 cmd codepage.
REM ============================================================================

set "DESK=%~dp0"

REM --- Resolve absolute path of sibling b-tv ---
pushd "%~dp0..\b-tv" 2>nul
if errorlevel 1 (
  echo [ERROR] TV project b-tv not found next to b-livingroom ^(expected %~dp0..\b-tv^)
  echo         Put b-livingroom and b-tv in the same parent folder.
  pause & exit /b 1
)
set "TV=%CD%"
popd

REM --- Dual display: both kiosks open on the primary screen by default ^(overlap^).
REM     To send the TV to a second monitor, set TV_POS to its top-left, e.g.
REM     set "TV_POS=--window-position=1920,0"
set "DESK_POS="
set "TV_POS="

echo.
echo   B-Zone Sensing Home - Launch All
echo   ============================================================
echo   Table : %DESK%  (web 5273)
echo   TV    : %TV%  (web 5274)
echo   NFC   : 8788 (shared)
echo   ============================================================
echo.

REM --- 1. Node.js / npm ---
where npm >nul 2>&1
if errorlevel 1 set "PATH=C:\nvm4w\nodejs;%PATH%"
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js / npm not found. Install Node 18+: https://nodejs.org
  pause & exit /b 1
)

REM --- 2. Python (needed by the NFC server) ---
python --version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python not found. Install Python 3.11+: https://python.org
  pause & exit /b 1
)
python -c "import smartcard, websockets" >nul 2>&1
if errorlevel 1 (
  echo [SETUP] Installing pyscard + websockets ...
  python -m pip install pyscard websockets
)

REM --- 3. Dependencies (first run only) ---
if not exist "%DESK%node_modules" ( echo [SETUP] Table deps ... & pushd "%DESK%" & call npm install & popd )
if not exist "%TV%\node_modules"  ( echo [SETUP] TV deps ...    & pushd "%TV%"  & call npm install & popd )

REM --- 4. Build both (always, to ship the latest code) ---
echo [BUILD] Table ...
pushd "%DESK%" & call npm run build & popd
echo [BUILD] TV ...
pushd "%TV%"  & call npm run build & popd

REM --- 5. NFC server (8788) - start once ---
netstat -ano | findstr ":8788 " | findstr "LISTENING" >nul
if errorlevel 1 (
  echo [START] NFC server 8788 ...
  start "B NFC Server (8788)" cmd /k python "%DESK%server\server.py"
) else (
  echo [SKIP]  NFC server 8788 already running.
)

REM --- 6. Table web (5273) ---
netstat -ano | findstr ":5273 " | findstr "LISTENING" >nul
if errorlevel 1 (
  echo [START] Table web 5273 ...
  start "B Table Web (5273)" /min /d "%DESK%" cmd /c "npm run preview"
) else (
  echo [SKIP]  Table web 5273 already running.
)

REM --- 7. TV web (5274) ---
netstat -ano | findstr ":5274 " | findstr "LISTENING" >nul
if errorlevel 1 (
  echo [START] TV web 5274 ...
  start "B TV Web (5274)" /min /d "%TV%" cmd /c "npm run preview"
) else (
  echo [SKIP]  TV web 5274 already running.
)

echo   Waiting for servers ...
timeout /t 6 /nobreak >nul

REM --- 8. Two Chrome kiosks ---
set "CHROME="
for %%P in (
  "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  "%LocalAppData%\Google\Chrome\Application\chrome.exe"
) do if exist %%~P set "CHROME=%%~P"

if defined CHROME (
  echo   Opening Table projection on 5273 ...
  start "" "%CHROME%" %DESK_POS% --kiosk --user-data-dir="%DESK%.chrome-profile" --no-first-run --no-default-browser-check --autoplay-policy=no-user-gesture-required --disable-features=Translate "http://localhost:5273"
  echo   Opening TV main screen on 5274 - reuses saved camera profile ...
  start "" "%CHROME%" %TV_POS% --kiosk --user-data-dir="%TV%\.chrome-profile" --no-first-run --no-default-browser-check --autoplay-policy=no-user-gesture-required --disable-features=Translate "http://localhost:5274"
) else (
  echo   Chrome not found, opening default browser - not fullscreen.
  start "" "http://localhost:5273"
  start "" "http://localhost:5274"
)

echo.
echo   Done. Table (5273) + TV (5274) + NFC server (8788) are up.
echo   Dual display: both kiosks open on the primary screen by default. Drag one
echo   to the other monitor, or set TV_POS at the top of this file.
echo   Fullscreen: press Alt+F4 to close. To stop everything, run stop.bat.
echo.
pause
endlocal

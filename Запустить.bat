@echo off
cd /d "%~dp0"
chcp 65001 >nul
title NTE — подборщик команд

where node >nul 2>&1
if errorlevel 1 (
  echo Не найден Node.js.
  echo Скачайте его с https://nodejs.org и запустите этот файл снова.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Первый запуск, ставятся зависимости. Это займёт минуту.
  call npm install
  if errorlevel 1 (
    echo Зависимости не установились.
    pause
    exit /b 1
  )
)

echo.
echo Подборщик открывается в браузере.
echo Это окно не закрывайте: пока оно открыто, приложение работает.
echo Чтобы выключить, закройте окно или нажмите Ctrl+C.
echo.

call npm run dev
if errorlevel 1 pause
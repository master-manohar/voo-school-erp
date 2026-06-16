@echo off
echo ==============================================
echo       Starting VOO School ERP Local Server
echo ==============================================
echo.
echo Installing any missing packages just in case...
call npm install
echo.
echo Starting the app...
echo Open your browser and go to: http://localhost:3000
echo.
call npm run dev
pause

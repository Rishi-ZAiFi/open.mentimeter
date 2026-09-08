@echo off
title Digi Warriors Assessment Platform
cd /d "%~dp0"
echo ===================================================
echo     DIGI WARRIORS - COURSE 1 ASSESSMENT PLATFORM
echo ===================================================
echo.
echo Starting local examination server...
start http://localhost:3000
node server/index.js
pause

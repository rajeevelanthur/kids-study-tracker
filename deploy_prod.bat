@echo off
setlocal
set PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%
cd /d "D:\Rajeev\AIProjects\kids-study-tracker"

echo ========================================================
echo   Kids Study Tracker - PRODUCTION (LIVE) Deployer
echo ========================================================
echo.
echo WARNING: You are deploying to the LIVE PRODUCTION site!
echo Real families and students will immediately receive these updates.
echo.
echo Target Site:  https://kids-study-tracker.web.app
echo Target Cloud: kids-study-tracker
echo.
set /p confirm="Are you sure you want to deploy to PRODUCTION? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo.
    echo [INFO] Production deployment cancelled. No changes made.
    pause
    exit /b 0
)

echo.
echo Deploying changes strictly to PRODUCTION environment...
echo.

call firebase use production
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Production deployment failed. Please check connection.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo   🎉 PRODUCTION SITE DEPLOYED SUCCESSFULLY!
echo.
echo   🟢 Live URL: https://kids-study-tracker.web.app
echo ========================================================
echo.
pause

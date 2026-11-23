@echo off
setlocal
set PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%
cd /d "D:\Rajeev\AIProjects\kids-study-tracker"

echo ========================================================
echo   Kids Study Tracker - DEMO / STAGING Deployer
echo ========================================================
echo.
echo Target Site:  https://kids-study-tracker-demo.web.app
echo Target Cloud: kids-study-tracker-demo
echo.
echo Deploying changes strictly to DEMO environment...
echo.

call firebase use demo
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Demo site deployment failed. Please check connection.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo   🎉 DEMO SITE DEPLOYED SUCCESSFULLY!
echo.
echo   🧪 Demo URL: https://kids-study-tracker-demo.web.app
echo ========================================================
echo.
pause

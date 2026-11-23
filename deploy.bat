@echo off
setlocal
set PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%
cd /d "D:\Rajeev\AIProjects\kids-study-tracker"

echo ========================================================
echo   Kids Study Tracker - Dual Environment Live Deployer
echo ========================================================
echo.
echo [Step 1 of 3] Verifying Firebase Login...
echo (If prompted, please log in with your Firebase Google account in the browser)
call firebase login
if %errorlevel% neq 0 (
    echo [ERROR] Firebase login failed. Please try again.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo [Step 2 of 3] Deploying DEMO / STAGING Site...
echo Target: https://kids-study-tracker-demo.web.app
echo ========================================================
call firebase use demo
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo [ERROR] Demo site deployment failed.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo [Step 3 of 3] Deploying PRODUCTION (LIVE) Site...
echo Target: https://kids-study-tracker.web.app
echo ========================================================
call firebase use production
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo [ERROR] Production site deployment failed.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo   🎉 CONGRATULATIONS! BOTH SITES ARE NOW LIVE!
echo.
echo   🧪 Demo Site:       https://kids-study-tracker-demo.web.app
echo   🟢 Production Site: https://kids-study-tracker.web.app
echo ========================================================
echo.
echo You can run this deploy.bat anytime in the future to push updates!
echo.
pause

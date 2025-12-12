@echo off
echo ========================================
echo Clearing All Caches and Restarting Server
echo ========================================
echo.

echo Step 1: Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Deleting .next cache...
if exist .next rmdir /s /q .next
timeout /t 1 /nobreak >nul

echo Step 3: Deleting node_modules cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
timeout /t 1 /nobreak >nul

echo Step 4: Starting dev server...
start cmd /k "npm run dev"

echo.
echo ========================================
echo DONE! Server is starting...
echo ========================================
echo.
echo IMPORTANT: Now do this in your browser:
echo 1. Press Ctrl + Shift + Delete
echo 2. Select "All time"
echo 3. Check ALL boxes
echo 4. Click "Clear data"
echo 5. Close browser completely
echo 6. Open in Incognito mode (Ctrl + Shift + N)
echo 7. Go to http://localhost:3000
echo.
echo The "Saved" button should be GONE!
echo ========================================
pause

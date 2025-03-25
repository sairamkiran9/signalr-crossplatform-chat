@echo off
echo Starting SignalR demo...

echo.
echo === Installing NPM packages ===
cd /d "%~dp0"
call npm install
call npm install dotenv --save
if %ERRORLEVEL% neq 0 (
    echo Error installing NPM packages
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo === Setting environment variables from .env file ===
for /f "tokens=*" %%a in ('type .env ^| findstr /v "^#" ^| findstr /v "^$"') do (
    set "%%a"
)

echo.
echo === Starting SignalR Server (in new window) ===
start cmd /k "cd /d "%~dp0SignalRServer" && set ASPNETCORE_URLS=http://localhost:%SERVER_PORT% && dotnet run"

echo.
echo === Waiting for server to start (5 seconds) ===
timeout /t 5 > nul

echo.
echo === Starting browser examples (in default browser) ===
start "" http://localhost:%CLIENT_PORT%
start "" http://localhost:%CLIENT_PORT%/custom-id-example.html

echo.
echo === Starting browser server ===
call npx live-server --port=%CLIENT_PORT% --open=browser-example.html

echo.
echo Demo stopped
pause
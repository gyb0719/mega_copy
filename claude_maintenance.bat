@echo off
echo Claude Desktop 유지보수 스크립트
echo ==================================
echo.

REM 캐시 정리
rd /s /q "%APPDATA%\Claude\Cache" 2>nul
rd /s /q "%APPDATA%\Claude\GPUCache" 2>nul
del /f /q "%APPDATA%\Claude\lockfile" 2>nul

REM 시작 프로그램 확인
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" | findstr /i claude >nul
if %errorlevel%==0 (
    echo 경고: 시작 프로그램에 Claude가 등록되어 있습니다.
    echo 제거하려면 Y를 누르세요...
    choice /C YN /T 5 /D N
    if errorlevel 2 goto skip
    reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v Claude /f 2>nul
    echo 시작 프로그램에서 제거됨
)
:skip

echo 완료!
pause
@echo off
echo ========================================
echo   빌리지 (Billage) 앱 실행 스크립트
echo ========================================
echo.

echo [1/3] Flutter 패키지 설치 중...
flutter pub get
if errorlevel 1 (
    echo 패키지 설치 실패!
    pause
    exit /b 1
)

echo.
echo [2/3] 코드 생성 중...
flutter pub run build_runner build --delete-conflicting-outputs
if errorlevel 1 (
    echo 코드 생성 건너뛰기...
)

echo.
echo [3/3] 앱 실행 중...
flutter run

pause
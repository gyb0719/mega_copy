@echo off
echo === Flutter 패키지 문제 해결 스크립트 ===
echo.

REM 환경 변수 설정
set PUB_CACHE=C:\Users\gyb07\.pub-cache
set FLUTTER_STORAGE_BASE_URL=https://storage.flutter.io
set PUB_HOSTED_URL=https://pub.dev

echo [1/5] 프로세스 정리 중...
taskkill /F /IM dart.exe 2>nul
taskkill /F /IM flutter_tools.snapshot 2>nul
ping -n 2 127.0.0.1 >nul

echo [2/5] 기존 캐시 삭제 중...
rmdir /s /q "%PUB_CACHE%" 2>nul
rmdir /s /q ".dart_tool" 2>nul
del /f /q "pubspec.lock" 2>nul
ping -n 2 127.0.0.1 >nul

echo [3/5] 새 캐시 디렉토리 생성...
mkdir "%PUB_CACHE%" 2>nul

echo [4/5] 패키지 다운로드 중 (재시도 포함)...
cd /d "%~dp0"

REM 첫 번째 시도
flutter pub get --no-offline
if %errorlevel% neq 0 (
    echo 첫 번째 시도 실패, 재시도 중...
    ping -n 3 127.0.0.1 >nul
    
    REM 두 번째 시도
    dart pub get
    if %errorlevel% neq 0 (
        echo 두 번째 시도 실패, 강제 캐시 정리 후 재시도...
        flutter pub cache clean --force
        ping -n 2 127.0.0.1 >nul
        
        REM 세 번째 시도
        flutter pub get
    )
)

echo.
echo [5/5] 완료 확인 중...
if exist ".dart_tool\package_config.json" (
    echo === 성공! 패키지 설치 완료 ===
    echo.
    echo 이제 앱을 실행할 수 있습니다:
    echo flutter run -d emulator-5554
) else (
    echo === 실패: 패키지 설치 실패 ===
    echo.
    echo 다음을 시도해보세요:
    echo 1. Windows Defender 실시간 보호 일시 중지
    echo 2. 관리자 권한으로 실행
    echo 3. 안티바이러스 소프트웨어 일시 중지
)

pause
@echo off
echo === 최종 Flutter 문제 해결 스크립트 ===
echo.

REM 1. 임시 디렉토리로 프로젝트 복사
echo [1/4] 프로젝트를 임시 디렉토리로 복사 중...
set TEMP_PROJECT=C:\temp_billage
if exist "%TEMP_PROJECT%" rmdir /s /q "%TEMP_PROJECT%"
xcopy /E /I /H /Y "." "%TEMP_PROJECT%" >nul 2>&1

REM 2. 임시 디렉토리로 이동
cd /d "%TEMP_PROJECT%"

REM 3. 새로운 pub 캐시 위치 설정
echo [2/4] 새 캐시 디렉토리 설정 중...
set PUB_CACHE=C:\temp_pub_cache
if exist "%PUB_CACHE%" rmdir /s /q "%PUB_CACHE%" 2>nul
mkdir "%PUB_CACHE%"

REM 4. 오프라인 모드 해제
flutter config --no-offline 2>nul

REM 5. 패키지 설치
echo [3/4] 패키지 설치 시도 중...
flutter pub get --no-offline

if %errorlevel% equ 0 (
    echo.
    echo === 성공! ===
    echo 패키지가 성공적으로 설치되었습니다!
    echo.
    echo [4/4] 앱 실행 중...
    flutter run -d emulator-5554
) else (
    echo.
    echo === 실패 ===
    echo 여전히 문제가 발생합니다.
    echo.
    echo 대안:
    echo 1. Windows를 안전 모드로 재부팅
    echo 2. Windows Defender를 일시적으로 비활성화
    echo 3. WSL2에서 Flutter 실행
)

pause
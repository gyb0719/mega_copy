# PowerShell 스크립트 - 강제 pub 문제 해결
# 관리자 권한으로 실행 권장

param(
    [switch]$Force
)

Write-Host "=== Flutter Pub 강제 해결 스크립트 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 모든 관련 프로세스 강제 종료
Write-Host "[1/6] 프로세스 종료 중..." -ForegroundColor Yellow
Get-Process dart*, flutter*, java* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. 파일 잠금 해제 시도
Write-Host "[2/6] 파일 잠금 해제 시도..." -ForegroundColor Yellow
$pubCache = "$env:LOCALAPPDATA\Pub\Cache"
$dartTool = "$PWD\.dart_tool"

# Handle.exe 사용 (있는 경우)
if (Get-Command handle.exe -ErrorAction SilentlyContinue) {
    handle.exe -accepteula "$pubCache" -nobanner 2>$null | ForEach-Object {
        if ($_ -match "pid: (\d+)") {
            Stop-Process -Id $matches[1] -Force -ErrorAction SilentlyContinue
        }
    }
}

# 3. 캐시 디렉토리 삭제
Write-Host "[3/6] 캐시 정리 중..." -ForegroundColor Yellow
Remove-Item -Path $pubCache -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path $dartTool -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "pubspec.lock" -Force -ErrorAction SilentlyContinue

# 4. 임시 캐시 디렉토리 생성
Write-Host "[4/6] 임시 캐시 설정..." -ForegroundColor Yellow
$tempCache = "C:\flutter_temp_cache"
New-Item -ItemType Directory -Path $tempCache -Force | Out-Null
$env:PUB_CACHE = $tempCache

# 5. Offline 모드 비활성화
Write-Host "[5/6] Flutter 설정 조정..." -ForegroundColor Yellow
flutter config --no-offline 2>$null

# 6. 패키지 설치 시도
Write-Host "[6/6] 패키지 설치 중..." -ForegroundColor Yellow
Write-Host ""

# 첫 번째 시도
$result = Start-Process dart -ArgumentList "pub", "get" -NoNewWindow -Wait -PassThru
if ($result.ExitCode -ne 0) {
    Write-Host "첫 번째 시도 실패, 대체 방법 시도 중..." -ForegroundColor Yellow
    
    # pub 글로벌 활성화
    dart pub global activate pub 2>$null
    
    # 재시도
    $result = Start-Process flutter -ArgumentList "pub", "get", "--verbose" -NoNewWindow -Wait -PassThru
}

# 결과 확인
if (Test-Path ".dart_tool\package_config.json") {
    Write-Host ""
    Write-Host "✓ 패키지 설치 성공!" -ForegroundColor Green
    Write-Host ""
    Write-Host "다음 명령으로 앱을 실행하세요:" -ForegroundColor Cyan
    Write-Host "flutter run -d emulator-5554" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ 패키지 설치 실패" -ForegroundColor Red
    Write-Host ""
    Write-Host "해결 방법:" -ForegroundColor Yellow
    Write-Host "1. Windows Defender 실시간 보호를 일시적으로 비활성화" -ForegroundColor White
    Write-Host "2. 이 스크립트를 관리자 권한으로 실행" -ForegroundColor White
    Write-Host "3. 안전 모드에서 실행" -ForegroundColor White
}

# 원래 캐시 경로로 복원
$env:PUB_CACHE = $pubCache
# MiKTeX 설치 스크립트
Write-Host "MiKTeX (LaTeX 엔진) 설치를 시작합니다..." -ForegroundColor Green
Write-Host "이 작업은 약 5-10분 정도 소요됩니다." -ForegroundColor Yellow

# MiKTeX 다운로드 URL (최신 버전)
$miktexUrl = "https://miktex.org/download/ctan/systems/win32/miktex/setup/windows-x64/basic-miktex-24.1-x64.exe"
$installerPath = "$env:TEMP\miktex-setup.exe"

# 다운로드
Write-Host "`n1. MiKTeX 다운로드 중... (약 250MB)" -ForegroundColor Cyan
try {
    $ProgressPreference = 'SilentlyContinue'  # 다운로드 진행률 표시 비활성화 (속도 향상)
    Invoke-WebRequest -Uri $miktexUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "   다운로드 완료!" -ForegroundColor Green
} catch {
    Write-Host "   다운로드 실패. 대체 URL 시도..." -ForegroundColor Yellow
    # 대체 다운로드 URL
    $miktexUrl = "https://mirror.ctan.org/systems/win32/miktex/setup/windows-x64/basic-miktex-24.1-x64.exe"
    Invoke-WebRequest -Uri $miktexUrl -OutFile $installerPath -UseBasicParsing
}

# 설치
Write-Host "`n2. MiKTeX 설치 중..." -ForegroundColor Cyan
Write-Host "   (자동 설치 모드로 진행됩니다)" -ForegroundColor Gray

$arguments = @(
    "--unattended",
    "--shared=yes",
    "--auto-install=yes"
)

Start-Process -FilePath $installerPath -ArgumentList $arguments -Wait -NoNewWindow

# 환경 변수 업데이트
Write-Host "`n3. 환경 변수 설정 중..." -ForegroundColor Cyan
$miktexBin = "C:\Program Files\MiKTeX\miktex\bin\x64"
if (Test-Path $miktexBin) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$miktexBin*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$miktexBin", "User")
        Write-Host "   PATH에 MiKTeX 추가 완료!" -ForegroundColor Green
    }
}

# 설치 확인
Write-Host "`n4. 설치 확인 중..." -ForegroundColor Cyan
$pdflatexPath = "$miktexBin\pdflatex.exe"
$xelatexPath = "$miktexBin\xelatex.exe"

if (Test-Path $pdflatexPath) {
    Write-Host "   ✓ pdflatex 설치 확인" -ForegroundColor Green
} else {
    Write-Host "   × pdflatex를 찾을 수 없습니다" -ForegroundColor Red
}

if (Test-Path $xelatexPath) {
    Write-Host "   ✓ xelatex 설치 확인" -ForegroundColor Green
} else {
    Write-Host "   × xelatex를 찾을 수 없습니다" -ForegroundColor Red
}

# 정리
Write-Host "`n5. 설치 파일 정리 중..." -ForegroundColor Cyan
Remove-Item $installerPath -Force -ErrorAction SilentlyContinue

Write-Host "`n" -NoNewline
Write-Host "============================================" -ForegroundColor Green
Write-Host "MiKTeX 설치가 완료되었습니다!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "`n사용 가능한 LaTeX 엔진:" -ForegroundColor Yellow
Write-Host "  - pdflatex (영문 문서용)" -ForegroundColor White
Write-Host "  - xelatex (한글 문서용)" -ForegroundColor White
Write-Host "  - lualatex (고급 기능용)" -ForegroundColor White

Write-Host "`nPowerShell을 재시작하면 명령어를 사용할 수 있습니다." -ForegroundColor Yellow
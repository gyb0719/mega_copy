# TinyTeX 설치 스크립트 (경량 LaTeX 배포판)
Write-Host "TinyTeX (경량 LaTeX 엔진) 설치를 시작합니다..." -ForegroundColor Green
Write-Host "MiKTeX보다 가볍고 빠르게 설치됩니다." -ForegroundColor Yellow

# Chocolatey로 설치 시도
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "`nChocolatey를 사용하여 TinyTeX를 설치합니다..." -ForegroundColor Cyan
    choco install tinytex -y
} else {
    Write-Host "`n수동으로 TinyTeX를 설치합니다..." -ForegroundColor Cyan
    
    # TinyTeX 설치 스크립트 다운로드
    $tinyTexUrl = "https://yihui.org/tinytex/install-bin-windows.bat"
    $installerPath = "$env:TEMP\install-tinytex.bat"
    
    Write-Host "1. 설치 스크립트 다운로드 중..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $tinyTexUrl -OutFile $installerPath -UseBasicParsing
    
    Write-Host "2. TinyTeX 설치 중... (몇 분 소요)" -ForegroundColor Yellow
    Start-Process cmd.exe -ArgumentList "/c $installerPath" -Wait -NoNewWindow
    
    # 정리
    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
}

# PATH 업데이트
$tinyTexPath = "$env:APPDATA\TinyTeX\bin\win32"
if (Test-Path $tinyTexPath) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$tinyTexPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$tinyTexPath", "User")
        Write-Host "`nPATH에 TinyTeX 추가 완료!" -ForegroundColor Green
    }
}

Write-Host "`n설치 확인 중..." -ForegroundColor Cyan
if (Test-Path "$tinyTexPath\pdflatex.exe") {
    Write-Host "✓ TinyTeX 설치 성공!" -ForegroundColor Green
    Write-Host "사용 가능한 명령어: pdflatex, xelatex, lualatex" -ForegroundColor Yellow
} else {
    Write-Host "설치를 확인할 수 없습니다. 수동 설치가 필요할 수 있습니다." -ForegroundColor Red
}

Write-Host "`nPowerShell을 재시작한 후 사용하세요." -ForegroundColor Yellow
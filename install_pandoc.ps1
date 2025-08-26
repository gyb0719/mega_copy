# Pandoc 최신 버전 설치 스크립트

Write-Host "Pandoc 최신 버전 설치를 시작합니다..." -ForegroundColor Green

# Chocolatey가 설치되어 있는지 확인
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "Chocolatey를 사용하여 Pandoc을 설치합니다..." -ForegroundColor Yellow
    choco upgrade pandoc -y
} else {
    Write-Host "Chocolatey가 없으므로 직접 다운로드합니다..." -ForegroundColor Yellow
    
    # 최신 버전 다운로드
    $pandocUrl = "https://github.com/jgm/pandoc/releases/download/3.1.11/pandoc-3.1.11-windows-x86_64.msi"
    $outputPath = "$env:TEMP\pandoc-installer.msi"
    
    Write-Host "Pandoc 다운로드 중..."
    Invoke-WebRequest -Uri $pandocUrl -OutFile $outputPath
    
    Write-Host "Pandoc 설치 중..."
    Start-Process msiexec.exe -ArgumentList "/i", $outputPath, "/quiet" -Wait
    
    Remove-Item $outputPath
}

Write-Host "Pandoc 설치 완료!" -ForegroundColor Green

# MiKTeX (LaTeX) 설치
Write-Host "`nPDF 변환을 위한 MiKTeX (LaTeX) 설치를 시작합니다..." -ForegroundColor Green

$miktexUrl = "https://miktex.org/download/ctan/systems/win32/miktex/setup/windows-x64/basic-miktex-24.1-x64.exe"
$miktexPath = "$env:TEMP\miktex-installer.exe"

Write-Host "MiKTeX 다운로드 중... (약 250MB)"
Invoke-WebRequest -Uri $miktexUrl -OutFile $miktexPath

Write-Host "MiKTeX 설치 중..."
Start-Process $miktexPath -ArgumentList "--unattended", "--shared=yes" -Wait

Remove-Item $miktexPath

Write-Host "`n설치 완료!" -ForegroundColor Green
Write-Host "Pandoc 버전 확인:" -ForegroundColor Yellow
pandoc --version
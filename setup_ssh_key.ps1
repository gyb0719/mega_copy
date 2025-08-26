# SSH 키 인증 설정
Write-Host "SSH 키 인증 설정 시작..." -ForegroundColor Green

# .ssh 폴더 생성
$sshDir = "$env:USERPROFILE\.ssh"
if (!(Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force
    Write-Host ".ssh 폴더 생성 완료" -ForegroundColor Yellow
}

# authorized_keys 파일 생성
$authKeysFile = "$sshDir\authorized_keys"
if (!(Test-Path $authKeysFile)) {
    New-Item -ItemType File -Path $authKeysFile -Force
    Write-Host "authorized_keys 파일 생성 완료" -ForegroundColor Yellow
}

# 권한 설정
Write-Host "파일 권한 설정 중..." -ForegroundColor Yellow
icacls $sshDir /inheritance:r
icacls $sshDir /grant:r "$env:USERNAME:(F)"
icacls $sshDir /grant:r "SYSTEM:(F)"
icacls $authKeysFile /inheritance:r
icacls $authKeysFile /grant:r "$env:USERNAME:(F)"
icacls $authKeysFile /grant:r "SYSTEM:(F)"

Write-Host "\n=== SSH 키 설정 완료 ===" -ForegroundColor Green
Write-Host "이제 모바일에서 SSH 키를 생성하고 공개키를 다음 파일에 추가하세요:" -ForegroundColor Cyan
Write-Host "$authKeysFile" -ForegroundColor White

Write-Host "\n모바일에서 키 생성 명령:" -ForegroundColor Cyan
Write-Host "ssh-keygen -t rsa -b 4096" -ForegroundColor Yellow
Write-Host "cat ~/.ssh/id_rsa.pub" -ForegroundColor Yellow

Write-Host "\n아무 키나 눌러서 종료..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
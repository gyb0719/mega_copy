# OpenSSH 서버 설치 스크립트
Write-Host "OpenSSH 서버 설치 시작..." -ForegroundColor Green

try {
    # OpenSSH 서버 설치
    Write-Host "단계 1: OpenSSH 서버 설치 중..." -ForegroundColor Yellow
    $capability = Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
    
    if ($capability.RestartNeeded) {
        Write-Host "재시작이 필요할 수 있습니다." -ForegroundColor Yellow
    }
    
    # SSH 서비스 시작
    Write-Host "단계 2: SSH 서비스 시작 중..." -ForegroundColor Yellow
    Start-Service sshd
    
    # 자동 시작 설정
    Write-Host "단계 3: 자동 시작 설정 중..." -ForegroundColor Yellow
    Set-Service -Name sshd -StartupType 'Automatic'
    
    # 방화벽 규칙 추가
    Write-Host "단계 4: 방화벽 설정 중..." -ForegroundColor Yellow
    New-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -DisplayName "OpenSSH Server (sshd)" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 -ErrorAction SilentlyContinue
    
    Write-Host "
=== SSH 서버 설치 완료! ===" -ForegroundColor Green
    
    # IP 주소 표시
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.InterfaceAlias -notlike "*VirtualBox*" -and $_.InterfaceAlias -notlike "*VMware*"} | Select-Object -First 1).IPAddress
    
    Write-Host "모바일에서 접속 정보:" -ForegroundColor Cyan
    Write-Host "IP 주소: $ip" -ForegroundColor White
    Write-Host "포트: 22" -ForegroundColor White
    Write-Host "사용자: $env:USERNAME" -ForegroundColor White
    Write-Host "비밀번호: Windows 로그인 비밀번호" -ForegroundColor White
    
    Write-Host "
예시 접속 명령:" -ForegroundColor Cyan
    Write-Host "ssh $env:USERNAME@$ip" -ForegroundColor Yellow
    
    # 서비스 상태 확인
    $service = Get-Service sshd
    Write-Host "
SSH 서비스 상태: $($service.Status)" -ForegroundColor $(if($service.Status -eq "Running") {"Green"} else {"Red"})
    
} catch {
    Write-Host "오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "관리자 권한으로 실행했는지 확인하세요." -ForegroundColor Yellow
}

Write-Host "
아무 키나 눌러서 종료..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
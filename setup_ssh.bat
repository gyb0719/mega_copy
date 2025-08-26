@echo off
echo === Windows SSH 서버 설치 ===
echo.
echo 관리자 권한이 필요합니다. 이 파일을 관리자로 실행하세요.
echo.
pause

REM OpenSSH 서버 설치
powershell -ExecutionPolicy Bypass -Command "Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"

REM SSH 서비스 시작
powershell -ExecutionPolicy Bypass -Command "Start-Service sshd"

REM 자동 시작 설정
powershell -ExecutionPolicy Bypass -Command "Set-Service -Name sshd -StartupType 'Automatic'"

REM 방화벽 규칙 추가
powershell -ExecutionPolicy Bypass -Command "New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22"

echo.
echo === SSH 서버 설치 완료 ===
echo.
echo IP 주소 확인 중...
ipconfig | findstr /i "ipv4"
echo.
echo 위 IP 주소로 접속하세요.
echo 예: ssh %USERNAME%@[IP주소]
echo.
pause
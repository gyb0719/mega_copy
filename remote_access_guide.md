# 폰에서 PC 터미널 원격 접속 가이드

## 방법 1: SSH 접속 (추천)

### PC 설정 (Windows)

1. **SSH 서버 설치**
   - `setup_ssh.bat` 파일을 **관리자 권한**으로 실행
   - 또는 PowerShell (관리자)에서:
   ```powershell
   # OpenSSH 서버 설치
   Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
   
   # SSH 서비스 시작
   Start-Service sshd
   
   # 자동 시작 설정
   Set-Service -Name sshd -StartupType 'Automatic'
   
   # 방화벽 포트 열기
   New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
   ```

2. **IP 주소 확인**
   ```cmd
   ipconfig
   ```
   IPv4 주소 기억 (예: 192.168.1.100)

### 모바일 앱 설치

#### Android
1. **Termux** (무료, 추천)
   - Play Store에서 "Termux" 설치
   - 설치 후:
   ```bash
   pkg install openssh
   ssh gyb07@192.168.1.100
   ```

2. **JuiceSSH** (사용하기 쉽음)
   - Play Store에서 "JuiceSSH" 설치
   - 연결 추가:
     - Nickname: Home PC
     - Address: 192.168.1.100
     - Username: gyb07

#### iOS
1. **Termius** (무료)
2. **Prompt 3** (유료, 고급)

### 접속 방법

1. **같은 WiFi 네트워크에서**
   ```bash
   ssh gyb07@192.168.1.100
   ```

2. **외부에서 접속** (공유기 설정 필요)
   - 공유기에서 포트포워딩 설정
   - 외부 포트 22 → 내부 192.168.1.100:22
   - DDNS 설정 권장

### Claude 실행

```bash
# SSH 접속 후
cd C:\Users\gyb07\projects
claude

# 또는 특정 프로젝트
cd village
claude "Flutter 앱 빌드해줘"
```

## 방법 2: 원격 데스크톱 (GUI 필요 시)

### Windows 설정
1. 설정 → 시스템 → 원격 데스크톱
2. "원격 데스크톱 활성화" 켜기

### 모바일 앱
- **Microsoft Remote Desktop** (Android/iOS)
- **Chrome Remote Desktop** (크로스 플랫폼)

## 방법 3: 웹 기반 터미널 (Code Server)

```bash
# VS Code Server 설치
npm install -g code-server

# 실행
code-server --bind-addr 0.0.0.0:8080

# 브라우저에서 http://192.168.1.100:8080 접속
```

## 보안 팁

1. **비밀번호 대신 SSH 키 사용**
   ```bash
   # 모바일에서 키 생성
   ssh-keygen -t rsa
   
   # 공개키 PC로 복사
   ssh-copy-id gyb07@192.168.1.100
   ```

2. **포트 변경** (기본 22 대신)
   ```
   C:\ProgramData\ssh\sshd_config
   Port 2222
   ```

3. **IP 화이트리스트**
   - 특정 IP만 허용

## 테스트 명령어

```bash
# 접속 테스트
ssh gyb07@localhost

# Claude 실행 테스트  
claude "echo Hello from mobile!"

# 작업 후 Telegram 알림
claude "npm run build" && python telegram_notify.py "Build complete from mobile!"
```

## 문제 해결

### SSH 연결 안 될 때
1. 서비스 확인
   ```powershell
   Get-Service sshd
   ```

2. 방화벽 확인
   ```powershell
   Get-NetFirewallRule -Name sshd
   ```

3. 포트 확인
   ```cmd
   netstat -an | findstr :22
   ```

### 외부 접속
- 공유기 포트포워딩
- DDNS 서비스 (no-ip.com, duckdns.org)
- VPN 사용 (WireGuard, Tailscale)
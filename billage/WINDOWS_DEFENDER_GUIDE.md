# Windows Defender 실시간 보호 비활성화 가이드

## 문제 원인
Flutter pub get 실행 시 "Pub failed to delete entry because it was in use by another process" 오류가 발생하는 원인은 Windows Defender가 파일을 실시간으로 스캔하면서 잠그고 있기 때문입니다.

## 해결 방법

### 방법 1: Windows Defender 일시적 비활성화 (권장)

1. **Windows 보안 센터 열기**
   - Windows 키 + I → "업데이트 및 보안" → "Windows 보안"
   - 또는 시작 메뉴에서 "Windows 보안" 검색

2. **바이러스 및 위협 방지 설정**
   - "바이러스 및 위협 방지" 클릭
   - "바이러스 및 위협 방지 설정" → "설정 관리" 클릭

3. **실시간 보호 비활성화**
   - "실시간 보호" 토글을 OFF로 변경
   - 관리자 권한 확인 창이 뜨면 "예" 클릭

4. **Flutter 패키지 설치**
   ```cmd
   cd C:\Users\gyb07\projects\billage
   flutter pub get
   flutter run -d emulator-5554
   ```

5. **작업 완료 후 실시간 보호 다시 활성화**
   - 보안을 위해 작업 완료 후 실시간 보호를 다시 ON으로 변경

### 방법 2: 폴더 제외 설정 (영구적)

1. **Windows 보안 → 바이러스 및 위협 방지**
2. **제외 추가 또는 제거**
3. **다음 폴더들 제외 추가:**
   - `C:\Users\gyb07\dev\flutter`
   - `C:\Users\gyb07\AppData\Local\Pub\Cache`
   - `C:\Users\gyb07\projects\billage`
   - `C:\flutter_temp_cache` (있는 경우)

### 방법 3: PowerShell 명령으로 제외 추가 (관리자 권한 필요)

PowerShell을 관리자 권한으로 실행 후:

```powershell
# Flutter 관련 디렉토리 제외 추가
Add-MpPreference -ExclusionPath "C:\Users\gyb07\dev\flutter"
Add-MpPreference -ExclusionPath "C:\Users\gyb07\AppData\Local\Pub"
Add-MpPreference -ExclusionPath "C:\Users\gyb07\projects\billage"

# Dart 프로세스 제외 추가
Add-MpPreference -ExclusionProcess "dart.exe"
Add-MpPreference -ExclusionProcess "flutter_tools.snapshot"
```

## 대안: WSL2 사용

Windows Defender 설정을 변경하고 싶지 않다면 WSL2에서 Flutter를 실행하는 것도 좋은 대안입니다:

1. **WSL2 설치** (이미 설치되어 있다면 건너뛰기)
   ```powershell
   wsl --install
   ```

2. **WSL2에서 Flutter 설치**
   ```bash
   # WSL2 터미널에서
   cd ~
   git clone https://github.com/flutter/flutter.git
   export PATH="$PATH:`pwd`/flutter/bin"
   ```

3. **프로젝트 실행**
   ```bash
   cd /mnt/c/Users/gyb07/projects/billage
   flutter pub get
   flutter run
   ```

## 즉시 시도할 수 있는 방법

지금 바로 시도하려면:

```cmd
# 1. 모든 프로세스 종료
taskkill /F /IM dart.exe
taskkill /F /IM flutter_tools.snapshot

# 2. 캐시 정리
flutter pub cache clean -f

# 3. 다시 시도
flutter pub get
```

여전히 문제가 발생하면 Windows Defender 실시간 보호를 일시적으로 비활성화해주세요.
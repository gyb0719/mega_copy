# Discord 알림 설정 가이드

## 1. Discord Webhook 만들기

### 서버 준비
1. Discord 앱 열기
2. 서버가 없다면 **+** 버튼으로 새 서버 생성
3. "내가 만들기" 선택
4. 서버 이름: `개인 알림` (원하는 이름)

### Webhook 생성
1. 알림을 받을 채널 선택 (ex: #general)
2. 채널 이름 옆 ⚙️ 설정 클릭
3. **연동** 탭 클릭
4. **웹후크** 클릭
5. **새 웹후크** 버튼 클릭
6. 웹후크 이름: `작업 알림` (원하는 이름)
7. **웹후크 URL 복사** 클릭

## 2. Python 스크립트 설정

### Webhook URL 설정
1. `discord_notify.py` 파일 열기
2. `YOUR_DISCORD_WEBHOOK_URL` 부분을 복사한 URL로 교체

### 테스트
```bash
python discord_notify.py "테스트 메시지"
```

## 3. 사용 방법

### 기본 사용
```bash
# 기본 메시지
python discord_notify.py

# 커스텀 메시지
python discord_notify.py "빌드 완료!"
python discord_notify.py "테스트 성공!"
python discord_notify.py "배포 실패!"
```

### npm과 함께 사용
```json
// package.json
{
  "scripts": {
    "build:notify": "npm run build && python discord_notify.py '빌드 성공!' || python discord_notify.py '빌드 실패!'"
  }
}
```

### Windows 배치 파일
```batch
@echo off
npm run build
if %errorlevel% == 0 (
    python discord_notify.py "빌드 성공!"
) else (
    python discord_notify.py "빌드 실패!"
)
```

### Python 스크립트와 함께
```python
import subprocess
import discord_notify

# 작업 실행
result = subprocess.run(["npm", "run", "build"], capture_output=True)

# 결과에 따라 알림
if result.returncode == 0:
    discord_notify.send_discord_notification("빌드 성공!", "✅ 성공", 3066993)
else:
    discord_notify.send_discord_notification("빌드 실패!", "❌ 실패", 15158332)
```

## 4. 알림 커스터마이징

### 색상 코드
- 파란색: 3447003
- 초록색: 3066993
- 빨간색: 15158332
- 노란색: 16776960
- 보라색: 10181046

### 이모지 사용
메시지에 이모지를 포함하면 자동으로 제목과 색상이 바뀝니다:
- "성공", "완료" → 초록색 ✅
- "실패", "오류" → 빨간색 ❌
- 기타 → 파란색 🔔

## 5. 모바일 알림 설정

### Discord 모바일 앱
1. 설정 > 알림
2. 해당 서버 알림 **켜기**
3. 모든 메시지 알림 활성화
4. 소리도 켜기

### 테스트
```bash
python discord_notify.py "테스트 알림 - 폰에서 확인해보세요!"
```

## 주의사항

- Webhook URL은 노출하지 마세요 (누구나 메시지 보낼 수 있음)
- 너무 많은 메시지를 짧은 시간에 보내면 Rate Limit에 걸릴 수 있음
- Discord 서버가 비공개라면 본인만 알림 받음
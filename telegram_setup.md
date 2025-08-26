# Telegram Bot 알림 설정 가이드

## 1. Bot 생성하기

### BotFather로 Bot 만들기
1. Telegram 앱에서 **@BotFather** 검색
2. 대화 시작 후 `/start` 입력
3. `/newbot` 명령 입력
4. 봇 이름 입력 (예: `Work Alert Bot`)
5. 봇 username 입력 (예: `your_work_alert_bot`)
   - 반드시 `bot`으로 끝나야 함
   - 중복 불가, 고유해야 함

### 토큰 저장
```
Done! Congratulations on your new bot. You will find it at t.me/your_work_alert_bot.
You can now add a description, about section and profile picture for your bot.

Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
```
위와 같은 메시지에서 **토큰** 복사

## 2. Chat ID 얻기

### 방법 1: getUpdates API 사용
1. 만든 봇을 Telegram에서 검색
2. 대화 시작 버튼 클릭
3. `/start` 메시지 전송
4. 브라우저에서 열기:
   ```
   https://api.telegram.org/bot토큰/getUpdates
   ```
5. JSON 응답에서 `"chat":{"id":123456789}` 찾기
6. 이 숫자가 Chat ID

### 방법 2: IDBot 사용
1. Telegram에서 **@myidbot** 검색
2. `/getid` 명령 입력
3. 표시되는 ID 복사

## 3. Python 설정

### 필요한 패키지
```bash
pip install python-telegram-bot
# 또는 간단한 방법
pip install requests
```

### 테스트 코드
```python
import requests

BOT_TOKEN = "YOUR_BOT_TOKEN"
CHAT_ID = "YOUR_CHAT_ID"

def send_telegram_message(message):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"  # 마크다운 지원
    }
    response = requests.post(url, data=data)
    return response.json()

# 테스트
send_telegram_message("🎉 Telegram Bot 설정 완료!")
```

## 4. 사용 예시

### 기본 메시지
```python
send_telegram_message("작업이 완료되었습니다!")
```

### 마크다운 형식
```python
message = """
*🎉 작업 완료!*

✅ 성공: 5개
❌ 실패: 1개

_시간: 2024-01-25 15:30_
"""
send_telegram_message(message)
```

### 이모지 사용
```python
send_telegram_message("🔔 알림\n🚀 빌드 시작\n✅ 빌드 성공\n🎆 배포 완료")
```

## 5. 고급 기능

### 버튼 추가
```python
def send_with_buttons(message):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    keyboard = {
        "inline_keyboard": [[
            {"text": "🔗 프로젝트 열기", "url": "https://github.com/your-repo"},
            {"text": "✅ 확인", "callback_data": "confirmed"}
        ]]
    }
    data = {
        "chat_id": CHAT_ID,
        "text": message,
        "reply_markup": json.dumps(keyboard)
    }
    requests.post(url, data=data)
```

### 파일 전송
```python
def send_file(file_path, caption=""):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
    with open(file_path, 'rb') as f:
        files = {'document': f}
        data = {'chat_id': CHAT_ID, 'caption': caption}
        requests.post(url, files=files, data=data)
```

## 주의사항

- Bot Token은 비밀로 유지 (노출 금지)
- Chat ID는 개인 ID 또는 그룹 ID 사용 가능
- 메시지 길이 제한: 4096자
- API 요청 제한: 초당 30개
import requests
import time

WEBHOOK_URL = "https://discord.com/api/webhooks/1409603199630840070/TOZyMqkOTXK5tmA3K-JoN2UuRI6pcCnH7EJr4zTO942DOArqyicw3HVmVEqs42y5idXZ"

# 여러 방식으로 알림 테스트
print("모바일 알림 테스트 시작...")

# 1. @everyone 멘션
data1 = {
    "content": "@everyone 🚨 **긴급 알림 테스트!** 모바일에서 이 메시지가 보이나요?",
    "username": "긴급 알림",
    "tts": True  # Text-to-Speech 활성화
}

response1 = requests.post(WEBHOOK_URL, json=data1)
print(f"1. @everyone 알림 전송: {response1.status_code == 204}")

time.sleep(2)

# 2. 강조된 메시지
data2 = {
    "content": ">>> **📱 모바일 알림 확인**\n지금 폰에서 Discord 알림이 왔나요?\n알림이 오지 않는다면 Discord 앱 설정을 확인해주세요!",
    "username": "알림 테스트"
}

response2 = requests.post(WEBHOOK_URL, json=data2)
print(f"2. 강조 메시지 전송: {response2.status_code == 204}")

time.sleep(2)

# 3. Embed 형식 (색상 강조)
data3 = {
    "embeds": [{
        "title": "🔔 모바일 알림 최종 테스트",
        "description": "**이 메시지가 모바일 알림으로 왔다면 성공입니다!**\n\n확인되면 Discord에서 반응 이모지를 남겨주세요.",
        "color": 15158332,  # 빨간색
        "fields": [
            {
                "name": "📱 알림 설정 확인",
                "value": "• 서버 알림: 모든 메시지\n• 채널 알림: 켜짐\n• 모바일 푸시: 활성화",
                "inline": False
            }
        ]
    }],
    "username": "Claude 알림 시스템"
}

response3 = requests.post(WEBHOOK_URL, json=data3)
print(f"3. Embed 알림 전송: {response3.status_code == 204}")

print("\n✅ 모든 테스트 알림이 전송되었습니다!")
print("Discord 모바일 앱을 확인해주세요.")
import requests
import json

# 카카오 앱 설정
CLIENT_ID = "d1d943e28a7fe857bb7714ea04ca8df8"
REDIRECT_URI = "http://localhost:5000"
AUTH_CODE = "XnyGgPyQvxOcO270dusRr_slPIwk0Y3JSy4Gqy_5XSoUWPZT7t4sDwAAAAQKFxafAAABmOJtnv5APV-WDrAHcw"

# 액세스 토큰 받기
url = "https://kauth.kakao.com/oauth/token"
data = {
    "grant_type": "authorization_code",
    "client_id": CLIENT_ID,
    "redirect_uri": REDIRECT_URI,
    "code": AUTH_CODE
}

print("토큰 발급 중...")
response = requests.post(url, data=data)
tokens = response.json()

if "access_token" in tokens:
    access_token = tokens["access_token"]
    print("Access token received successfully!")
    
    # 토큰 저장
    with open("kakao_token.txt", "w") as f:
        f.write(access_token)
    print("토큰이 kakao_token.txt에 저장되었습니다")
    
    # 테스트 메시지 전송
    msg_url = "https://kapi.kakao.com/v2/api/talk/memo/default/send"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    template = {
        "object_type": "text",
        "text": "🎉 카카오톡 알림 설정 완료!\n\n이제 작업이 완료되면 카톡으로 알림을 받을 수 있습니다.",
        "link": {
            "web_url": "https://developers.kakao.com",
            "mobile_web_url": "https://developers.kakao.com"
        },
        "button_title": "확인"
    }
    
    msg_data = {"template_object": json.dumps(template)}
    msg_response = requests.post(msg_url, headers=headers, data=msg_data)
    
    if msg_response.status_code == 200:
        print("\nTest message sent successfully!")
        print("Check your KakaoTalk!")
        print("\n이제 다음 명령으로 알림을 보낼 수 있습니다:")
        print('python send_notification.py "작업 완료!"')
    else:
        print(f"Message send failed: {msg_response.json()}")
else:
    print(f"Token issue failed: {tokens}")
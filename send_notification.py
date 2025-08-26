import sys
import requests
import json

def send_kakao_message(message):
    """저장된 토큰으로 카카오톡 메시지 전송"""
    try:
        # 저장된 토큰 읽기
        with open("kakao_token.txt", "r") as f:
            access_token = f.read().strip()
    except FileNotFoundError:
        print("Token file not found. Please run kakao_notify.py first.")
        return False
    
    url = "https://kapi.kakao.com/v2/api/talk/memo/default/send"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    # 텍스트 메시지 템플릿
    template = {
        "object_type": "text",
        "text": message,
        "link": {
            "web_url": "https://developers.kakao.com",
            "mobile_web_url": "https://developers.kakao.com"
        },
        "button_title": "확인"
    }
    
    data = {
        "template_object": json.dumps(template)
    }
    
    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        print("KakaoTalk message sent successfully!")
        return True
    else:
        print(f"Message send failed: {response.json()}")
        if response.status_code == 401:
            print("Token expired. Please run kakao_notify.py again.")
        return False

if __name__ == "__main__":
    # 명령줄 인자로 메시지 받기
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
    else:
        message = "🔔 작업이 완료되었습니다!"
    
    send_kakao_message(message)
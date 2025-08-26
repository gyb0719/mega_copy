import requests
import json
import webbrowser
from urllib.parse import urlencode
import time

# 카카오 앱 설정
CLIENT_ID = "d1d943e28a7fe857bb7714ea04ca8df8"  # 카카오 개발자 앱의 REST API 키
REDIRECT_URI = "http://localhost:5000"  # 카카오 앱에 등록한 Redirect URI

def get_auth_code():
    """카카오 인증 코드 받기"""
    base_url = "https://kauth.kakao.com/oauth/authorize"
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "talk_message"  # 나에게 메시지 보내기 권한
    }
    auth_url = f"{base_url}?{urlencode(params)}"
    
    print("\n1. 아래 URL을 브라우저에서 열어주세요:")
    print(auth_url)
    print("\n2. 카카오 로그인 후 동의하고 진행하세요")
    print("3. 리다이렉트된 URL에서 code= 뒤의 값을 복사해주세요")
    print("   예: http://localhost:5000?code=XXXXX")
    
    # 브라우저 자동 열기
    webbrowser.open(auth_url)
    
    auth_code = input("\n인증 코드를 입력하세요: ")
    return auth_code

def get_access_token(auth_code):
    """액세스 토큰 받기"""
    url = "https://kauth.kakao.com/oauth/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "code": auth_code
    }
    
    response = requests.post(url, data=data)
    tokens = response.json()
    
    if "access_token" in tokens:
        print("\n✅ 액세스 토큰 발급 성공!")
        return tokens["access_token"]
    else:
        print(f"❌ 토큰 발급 실패: {tokens}")
        return None

def send_kakao_message(access_token, message):
    """카카오톡 나에게 메시지 보내기"""
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
        print(f"\n✅ 메시지 전송 성공: {message}")
        return True
    else:
        print(f"❌ 메시지 전송 실패: {response.json()}")
        return False

def save_token(token):
    """토큰을 파일에 저장"""
    with open("kakao_token.txt", "w") as f:
        f.write(token)
    print("토큰이 kakao_token.txt에 저장되었습니다")

def load_token():
    """저장된 토큰 불러오기"""
    try:
        with open("kakao_token.txt", "r") as f:
            return f.read().strip()
    except FileNotFoundError:
        return None

if __name__ == "__main__":
    print("=== 카카오톡 나에게 메시지 보내기 설정 ===")
    print("\n설정을 시작합니다...")
    
    # 저장된 토큰 확인
    access_token = load_token()
    
    if access_token:
        print("\n저장된 토큰을 찾았습니다. 테스트 메시지를 보내봅니다...")
        success = send_kakao_message(access_token, "🔔 카카오톡 알림 테스트")
        
        if not success:
            print("토큰이 만료되었을 수 있습니다. 다시 인증합니다...")
            access_token = None
    
    if not access_token:
        # 새로 인증
        auth_code = get_auth_code()
        access_token = get_access_token(auth_code)
        
        if access_token:
            save_token(access_token)
            
            # 테스트 메시지 전송
            send_kakao_message(access_token, "🎉 카카오톡 알림 설정 완료!")
            
            print("\n=== 설정 완료 ===")
            print("이제 다음 명령으로 메시지를 보낼 수 있습니다:")
            print('python send_notification.py "작업이 완료되었습니다!"')
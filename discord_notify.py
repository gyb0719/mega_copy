import requests
import json
import sys
from datetime import datetime

# Discord Webhook URL (여기에 실제 URL 입력)
WEBHOOK_URL = "https://discord.com/api/webhooks/1409603199630840070/TOZyMqkOTXK5tmA3K-JoN2UuRI6pcCnH7EJr4zTO942DOArqyicw3HVmVEqs42y5idXZ"

def send_discord_notification(message, title="🔔 작업 알림", color=3447003):
    """
    Discord로 알림 메시지 전송
    
    Args:
        message: 전송할 메시지
        title: 제목 (기본값: 작업 알림)
        color: Embed 색상 (기본값: 파란색)
    """
    
    # Embed 형식으로 보기 좋게 만들기
    embed = {
        "title": title,
        "description": message,
        "color": color,
        "timestamp": datetime.utcnow().isoformat(),
        "footer": {
            "text": "Python 작업 알림"
        }
    }
    
    # 메시지 데이터
    data = {
        "embeds": [embed],
        "username": "작업 알림 봇",
        "avatar_url": "https://i.imgur.com/4M34hi2.png"  # 기본 아바타
    }
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 204:
            print("Discord notification sent successfully!")
            return True
        else:
            print(f"Failed to send Discord notification: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error sending Discord notification: {e}")
        return False

def send_simple_message(message):
    """
    간단한 텍스트 메시지 전송
    """
    # @everyone 멘션 추가로 강제 알림
    if "긴급" in message or "중요" in message:
        message = f"@everyone {message}"
    
    data = {
        "content": message,
        "username": "작업 알림"
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=data)
        return response.status_code == 204
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    # 명령줄 인자 처리
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
    else:
        message = "작업이 완료되었습니다!"
    
    # 이모지로 상태 표시
    if "성공" in message or "완료" in message:
        title = "✅ 작업 성공"
        color = 3066993  # 초록색
    elif "실패" in message or "오류" in message:
        title = "❌ 작업 실패"
        color = 15158332  # 빨간색
    else:
        title = "🔔 작업 알림"
        color = 3447003  # 파란색
    
    # Discord로 전송
    send_discord_notification(message, title, color)
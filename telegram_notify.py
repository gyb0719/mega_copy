import requests
import json
import sys
from datetime import datetime

# Telegram Bot 설정 (여기에 실제 값 입력)
BOT_TOKEN = "8343712075:AAH0O2An2iSreYq-xHI4OY0EDVykX-qWRiI"  # BotFather에서 받은 토큰
CHAT_ID = "6982947491"      # 개인 채팅 ID

def send_telegram_message(message, parse_mode="Markdown", disable_notification=False):
    """
    Telegram으로 메시지 전송
    
    Args:
        message: 전송할 메시지
        parse_mode: Markdown 또는 HTML
        disable_notification: True이면 무음 알림
    """
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    
    data = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": parse_mode,
        "disable_notification": disable_notification
    }
    
    try:
        response = requests.post(url, data=data)
        result = response.json()
        
        if result.get("ok"):
            print("Telegram message sent successfully!")
            return True
        else:
            print(f"Failed to send message: {result.get('description')}")
            return False
    except Exception as e:
        print(f"Error sending Telegram message: {e}")
        return False

def send_detailed_notification(title, tasks_completed=None, tasks_failed=None, notes=""):
    """
    상세한 작업 알림 전송
    """
    # 이모지로 상태 표시
    if tasks_failed:
        status_emoji = "⚠️"
        status_text = "일부 실패"
    else:
        status_emoji = "✅"
        status_text = "모두 성공"
    
    # 메시지 구성 (Markdown 형식)
    message = f"*{status_emoji} {title}*\n"
    message += f"_상태: {status_text}_\n\n"
    
    if tasks_completed:
        message += "*✅ 완료된 작업:*\n"
        for task in tasks_completed:
            message += f"  • {task}\n"
        message += "\n"
    
    if tasks_failed:
        message += "*❌ 실패한 작업:*\n"
        for task in tasks_failed:
            message += f"  • {task}\n"
        message += "\n"
    
    if notes:
        message += f"*📌 참고:*\n{notes}\n\n"
    
    # 통계
    total = (len(tasks_completed) if tasks_completed else 0) + \
            (len(tasks_failed) if tasks_failed else 0)
    success = len(tasks_completed) if tasks_completed else 0
    
    message += f"*📊 통계:*\n"
    message += f"  • 전체: {total}개\n"
    message += f"  • 성공: {success}개\n"
    message += f"  • 실패: {total - success}개\n"
    
    if total > 0:
        success_rate = (success / total) * 100
        message += f"  • 성공률: {success_rate:.0f}%\n"
    
    # 시간 추가
    message += f"\n⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    return send_telegram_message(message)

def send_simple_alert(message, urgent=False):
    """
    간단한 알림 전송
    """
    if urgent:
        message = f"🚨 *[긴급]* {message}"
    else:
        message = f"🔔 {message}"
    
    return send_telegram_message(message, disable_notification=not urgent)

def test_connection():
    """
    Telegram Bot 연결 테스트
    """
    test_message = """
🎉 *Telegram Bot 연결 성공!*

이제 작업 알림을 받을 수 있습니다.

테스트 기능:
✅ 메시지 전송
✅ 마크다운 형식
✅ 이모지 지원
✅ 알림음 설정
"""
    return send_telegram_message(test_message)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # 명령줄 인자로 메시지 전송
        message = " ".join(sys.argv[1:])
        send_simple_alert(message, "urgent" in message.lower())
    else:
        # 테스트 메시지
        print("테스트 메시지를 전송합니다...")
        test_connection()
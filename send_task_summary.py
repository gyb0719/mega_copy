import requests
import json
from datetime import datetime

# Discord Webhook URL
WEBHOOK_URL = "https://discord.com/api/webhooks/1409603199630840070/TOZyMqkOTXK5tmA3K-JoN2UuRI6pcCnH7EJr4zTO942DOArqyicw3HVmVEqs42y5idXZ"

def send_task_summary(completed_tasks, failed_tasks=None, notes=""):
    """
    작업 완료 요약을 Discord로 전송
    
    Args:
        completed_tasks: 완료된 작업 리스트
        failed_tasks: 실패한 작업 리스트
        notes: 추가 설명
    """
    
    # 작업 상태 판단
    if failed_tasks:
        title = "⚠️ 작업 완료 (일부 실패)"
        color = 16776960  # 노란색
        status_emoji = "⚠️"
    else:
        title = "✅ 모든 작업 완료"
        color = 3066993  # 초록색
        status_emoji = "✅"
    
    # 메시지 구성
    description = f"**{status_emoji} 작업 요약**\n\n"
    
    # 완료된 작업
    if completed_tasks:
        description += "**완료된 작업:**\n"
        for task in completed_tasks:
            description += f"✅ {task}\n"
        description += "\n"
    
    # 실패한 작업
    if failed_tasks:
        description += "**실패한 작업:**\n"
        for task in failed_tasks:
            description += f"❌ {task}\n"
        description += "\n"
    
    # 추가 설명
    if notes:
        description += f"**참고사항:**\n{notes}\n"
    
    # 통계
    total = len(completed_tasks) + (len(failed_tasks) if failed_tasks else 0)
    success_rate = (len(completed_tasks) / total * 100) if total > 0 else 100
    
    # Embed 생성
    embed = {
        "title": title,
        "description": description,
        "color": color,
        "fields": [
            {
                "name": "📊 통계",
                "value": f"전체: {total}개\n성공: {len(completed_tasks)}개\n실패: {len(failed_tasks) if failed_tasks else 0}개\n성공률: {success_rate:.0f}%",
                "inline": True
            },
            {
                "name": "⏰ 완료 시간",
                "value": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "inline": True
            }
        ],
        "footer": {
            "text": "작업 완료 알림"
        }
    }
    
    # Discord로 전송
    data = {
        "embeds": [embed],
        "username": "작업 관리자"
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=data)
        if response.status_code == 204:
            print("Task summary sent to Discord successfully!")
            return True
        else:
            print(f"Failed to send: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    # 테스트 예시
    completed = [
        "프로젝트 초기 설정",
        "Discord 알림 설정",
        "카카오톡 알림 설정",
        "테스트 메시지 전송"
    ]
    
    failed = [
        "이메일 알림 설정 (SMTP 인증 실패)"
    ]
    
    notes = "Discord 알림이 정상적으로 설정되었습니다. 모바일에서도 알림을 받을 수 있습니다."
    
    send_task_summary(completed, failed, notes)
import requests
import json
from datetime import datetime
import sys

# Discord Webhook URL
WEBHOOK_URL = "https://discord.com/api/webhooks/1409603199630840070/TOZyMqkOTXK5tmA3K-JoN2UuRI6pcCnH7EJr4zTO942DOArqyicw3HVmVEqs42y5idXZ"

def send_detailed_project_summary(
    project_name,
    project_description,
    feature_name,
    implementation_steps,
    completed_tasks,
    failed_tasks=None,
    next_steps=None,
    notes=""
):
    """
    프로젝트 작업 상세 요약을 Discord로 전송
    
    Args:
        project_name: 프로젝트 이름
        project_description: 프로젝트 설명
        feature_name: 구현 중인 기능
        implementation_steps: 구현 단계 리스트
        completed_tasks: 완료된 작업 리스트
        failed_tasks: 실패한 작업 리스트
        next_steps: 다음 단계 리스트
        notes: 추가 설명
    """
    
    # 작업 상태 판단
    if failed_tasks:
        title = f"⚠️ {project_name} - 작업 완료 (일부 실패)"
        color = 16776960  # 노란색
        status_emoji = "⚠️"
    else:
        title = f"✅ {project_name} - 작업 완료"
        color = 3066993  # 초록색
        status_emoji = "✅"
    
    # 메시지 구성
    description = f"**📁 프로젝트: {project_name}**\n"
    description += f"📝 {project_description}\n\n"
    
    # 구현 중인 기능
    description += f"**🎯 구현 기능: {feature_name}**\n\n"
    
    # 구현 단계
    if implementation_steps:
        description += "**📊 구현 단계:**\n"
        for i, step in enumerate(implementation_steps, 1):
            # 완료된 단계 확인
            if any(step.lower() in task.lower() for task in completed_tasks):
                description += f"{i}. ✅ {step}\n"
            elif failed_tasks and any(step.lower() in task.lower() for task in failed_tasks):
                description += f"{i}. ❌ {step}\n"
            else:
                description += f"{i}. ⏳ {step}\n"
        description += "\n"
    
    # 완료된 작업 상세
    if completed_tasks:
        description += "**✅ 완료된 작업:**\n"
        for task in completed_tasks:
            description += f"• {task}\n"
        description += "\n"
    
    # 실패한 작업
    if failed_tasks:
        description += "**❌ 실패한 작업:**\n"
        for task in failed_tasks:
            description += f"• {task}\n"
        description += "\n"
    
    # 다음 단계
    if next_steps:
        description += "**🔜 다음 단계:**\n"
        for step in next_steps:
            description += f"• {step}\n"
        description += "\n"
    
    # 추가 설명
    if notes:
        description += f"**📌 참고사항:**\n{notes}\n"
    
    # 통계 계산
    total_tasks = len(completed_tasks) + (len(failed_tasks) if failed_tasks else 0)
    success_rate = (len(completed_tasks) / total_tasks * 100) if total_tasks > 0 else 100
    
    # 진행률 계산 (구현 단계 기준)
    if implementation_steps:
        completed_steps = sum(1 for step in implementation_steps 
                             if any(step.lower() in task.lower() for task in completed_tasks))
        progress_rate = (completed_steps / len(implementation_steps) * 100)
    else:
        progress_rate = success_rate
    
    # Embed 생성
    embed = {
        "title": title,
        "description": description[:4000],  # Discord 제한
        "color": color,
        "fields": [
            {
                "name": "📊 통계",
                "value": f"""
작업 수: {total_tasks}개
성공: {len(completed_tasks)}개
실패: {len(failed_tasks) if failed_tasks else 0}개
성공률: {success_rate:.0f}%
""",
                "inline": True
            },
            {
                "name": "📈 진행률",
                "value": f"""
전체 진행도: {progress_rate:.0f}%
{'='*int(progress_rate/10)}▶ {100-progress_rate:.0f}%
""",
                "inline": True
            },
            {
                "name": "⏰ 작업 시간",
                "value": datetime.now().strftime("%m/%d %H:%M"),
                "inline": True
            }
        ],
        "footer": {
            "text": f"프로젝트: {project_name} | Claude Code"
        },
        "timestamp": datetime.now().isoformat()
    }
    
    # Discord로 전송
    data = {
        "embeds": [embed],
        "username": "Claude Code 작업 알림",
        "avatar_url": "https://www.anthropic.com/images/icons/apple-touch-icon.png"
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=data)
        if response.status_code == 204:
            print("Detailed project summary sent to Discord successfully!")
            return True
        else:
            print(f"Failed to send: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

# 간단한 테스트를 위한 함수
def quick_summary(project, feature, completed, failed=None):
    """간단한 요약 전송"""
    return send_detailed_project_summary(
        project_name=project,
        project_description="",
        feature_name=feature,
        implementation_steps=[],
        completed_tasks=completed,
        failed_tasks=failed
    )

if __name__ == "__main__":
    # 테스트 예시
    send_detailed_project_summary(
        project_name="E-Commerce Shop",
        project_description="Next.js 기반 이커머스 플랫폼",
        feature_name="사용자 인증 시스템",
        implementation_steps=[
            "로그인/회원가입 UI 구현",
            "JWT 토큰 기반 인증 구현",
            "소셜 로그인 연동",
            "비밀번호 재설정 기능",
            "테스트 코드 작성"
        ],
        completed_tasks=[
            "로그인 페이지 UI 완성",
            "회원가입 폼 검증 구현",
            "JWT 토큰 생성 및 검증 로직",
            "Discord 알림 설정 완료"
        ],
        failed_tasks=[
            "Google OAuth 연동 (API 키 필요)"
        ],
        next_steps=[
            "Google OAuth API 키 설정",
            "비밀번호 재설정 이메일 구현",
            "E2E 테스트 작성"
        ],
        notes="인증 시스템의 기본 기능이 완성되었습니다. OAuth 연동을 위해 API 키 설정이 필요합니다."
    )
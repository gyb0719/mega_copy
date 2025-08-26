import json
import os
from datetime import datetime, timedelta

# 토큰 사용량 파일 경로 (필요에 따라 수정)
USAGE_FILE = "token_usage.json"
# Max20 플랜: 5시간마다 220K 토큰
MAX_TOKENS = 220_000
RESET_HOURS = 5

def load_usage():
    """저장된 토큰 사용량 불러오기"""
    if os.path.exists(USAGE_FILE):
        with open(USAGE_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # 5시간 경과시 자동 리셋
            if 'reset_time' in data:
                reset_time = datetime.fromisoformat(data['reset_time'])
                if datetime.now() >= reset_time:
                    return create_new_usage()
            return data
    return create_new_usage()

def create_new_usage():
    """새로운 사용량 데이터 생성"""
    now = datetime.now()
    reset_time = now + timedelta(hours=RESET_HOURS)
    return {
        "input": 0, 
        "output": 0, 
        "total": 0,
        "start_time": now.isoformat(),
        "reset_time": reset_time.isoformat()
    }

def save_usage(input_tokens, output_tokens):
    """토큰 사용량 저장"""
    usage = load_usage()
    usage["input"] += input_tokens
    usage["output"] += output_tokens
    usage["total"] = usage["input"] + usage["output"]
    usage["last_updated"] = datetime.now().isoformat()
    
    with open(USAGE_FILE, 'w', encoding='utf-8') as f:
        json.dump(usage, f, ensure_ascii=False, indent=2)
    return usage

def format_number(num):
    """숫자를 K, M 단위로 포맷"""
    if num >= 1_000_000:
        return f"{num/1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num/1_000:.0f}K"
    return str(num)

def get_time_remaining():
    """리셋까지 남은 시간 계산"""
    usage = load_usage()
    if 'reset_time' in usage:
        reset_time = datetime.fromisoformat(usage['reset_time'])
        remaining = reset_time - datetime.now()
        if remaining.total_seconds() > 0:
            hours = int(remaining.total_seconds() // 3600)
            minutes = int((remaining.total_seconds() % 3600) // 60)
            if hours > 0:
                return f"{hours}h{minutes}m"
            else:
                return f"{minutes}m"
    return "리셋중"

def get_token_display():
    """토큰 사용량 간단 표시"""
    usage = load_usage()
    total = usage.get("total", 0)
    remaining = MAX_TOKENS - total
    
    # 소수점 1자리까지 정밀하게 계산
    percent_used = min(100.0, (total / MAX_TOKENS) * 100)
    percent_remaining = 100.0 - percent_used
    
    # 남은 시간
    time_left = get_time_remaining()
    
    # 토큰 이모지 선택 (남은 퍼센트에 따라)
    if percent_remaining >= 80:
        token_emoji = "🟢"  # 녹색: 충분함
    elif percent_remaining >= 50:
        token_emoji = "🟡"  # 노란색: 보통
    elif percent_remaining >= 20:
        token_emoji = "🟠"  # 주황색: 주의
    else:
        token_emoji = "🔴"  # 빨간색: 부족
    
    # 남은 토큰 수도 함께 표시 (K 단위)
    remaining_k = remaining / 1000
    
    # 퍼센트는 소수점 1자리까지, 10% 미만일 때는 소수점 2자리까지
    if percent_remaining < 10:
        percent_str = f"{percent_remaining:.2f}%"
    else:
        percent_str = f"{percent_remaining:.1f}%"
    
    return f"{token_emoji} {percent_str} ({remaining_k:.1f}K) [{time_left}]"

def reset_usage():
    """토큰 사용량 초기화"""
    new_usage = create_new_usage()
    with open(USAGE_FILE, 'w', encoding='utf-8') as f:
        json.dump(new_usage, f, ensure_ascii=False, indent=2)
    print("토큰 사용량이 초기화되었습니다.")

def get_git_branch():
    """현재 git 브랜치 확인"""
    import subprocess
    try:
        result = subprocess.run(['git', 'branch', '--show-current'], 
                              capture_output=True, text=True, 
                              cwd=os.getcwd(), timeout=2)
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except:
        pass
    return None

def get_project_name():
    """현재 디렉토리명을 프로젝트명으로 사용"""
    return os.path.basename(os.getcwd())

def get_model_info():
    """Claude Code JSON 입력에서 모델 정보 추출"""
    try:
        import sys
        # stdin에서 JSON 읽기 (Claude Code에서 제공)
        input_data = sys.stdin.read().strip()
        if input_data:
            data = json.loads(input_data)
            model_name = data.get('model', {}).get('display_name', 'Unknown')
            return model_name
    except:
        pass
    return 'Claude'

def get_full_status():
    """전체 상태 라인 생성"""
    parts = []
    
    # 1. 프로젝트명
    project = get_project_name()
    parts.append(f"📁 {project}")
    
    # 2. Git 브랜치 (있다면)
    branch = get_git_branch()
    if branch:
        parts.append(f"🌿 {branch}")
    
    # 3. 모델명
    model = get_model_info()
    parts.append(f"🤖 {model}")
    
    # 4. 토큰 사용량
    token_info = get_token_display()
    parts.append(token_info)
    
    return " | ".join(parts)

def estimate_tokens_from_text(text):
    """텍스트에서 토큰 수 추정"""
    if not text:
        return 0
    
    # 기본 추정 (4글자당 1토큰)
    char_count = len(text)
    word_count = len(text.split())
    
    # 코드 패턴 감지
    import re
    code_patterns = len(re.findall(r'[{}()\[\];,.]', text))
    special_chars = len(re.findall(r'[<>@#$%^&*+=|\\]', text))
    
    estimated = char_count / 4
    
    # 코드 조정
    if code_patterns > char_count * 0.1:
        estimated *= 1.2
    if special_chars > char_count * 0.05:
        estimated *= 1.1
    
    return int(estimated * 1.1)  # 10% 안전 여유

def sync_with_enhanced_tracker():
    """강화된 트래커와 동기화"""
    try:
        # 강화된 트래커 파일이 있는지 확인
        enhanced_file = "claude_token_tracker.json"
        if os.path.exists(enhanced_file):
            with open(enhanced_file, 'r', encoding='utf-8') as f:
                enhanced_data = json.load(f)
            
            # 기존 데이터와 병합
            current = load_usage()
            if enhanced_data.get('total', 0) > current.get('total', 0):
                return enhanced_data
    except Exception:
        pass
    
    return load_usage()

if __name__ == "__main__":
    import sys
    import argparse
    
    # Windows UTF-8 인코딩 설정
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8')
    
    # 향상된 CLI 지원
    if len(sys.argv) > 1:
        if sys.argv[1] == "add":
            if len(sys.argv) == 4:
                # 기존 방식: python token_usage.py add 1000 500
                input_tokens = int(sys.argv[2])
                output_tokens = int(sys.argv[3])
            elif len(sys.argv) == 3 and sys.argv[2].startswith('--'):
                # 새 방식: python token_usage.py add --estimate "text content"
                if sys.argv[2] == '--estimate-input':
                    text = input("입력 텍스트를 붙여넣으세요: ")
                    input_tokens = estimate_tokens_from_text(text)
                    output_tokens = 0
                    print(f"추정된 입력 토큰: {input_tokens}")
                elif sys.argv[2] == '--estimate-output':
                    text = input("출력 텍스트를 붙여넣으세요: ")
                    input_tokens = 0
                    output_tokens = estimate_tokens_from_text(text)
                    print(f"추정된 출력 토큰: {output_tokens}")
                else:
                    print("사용법: python token_usage.py add [입력토큰] [출력토큰] 또는 --estimate-input/--estimate-output")
                    sys.exit(1)
            else:
                print("사용법: python token_usage.py add [입력토큰] [출력토큰]")
                sys.exit(1)
                
            usage = save_usage(input_tokens, output_tokens)
            print(f"추가됨 - 입력: {input_tokens}, 출력: {output_tokens}")
            print(f"총 사용량: {format_number(usage['total'])}")
            
        elif sys.argv[1] == "estimate":
            if len(sys.argv) > 2:
                text = ' '.join(sys.argv[2:])
                tokens = estimate_tokens_from_text(text)
                print(f"추정 토큰 수: {tokens}")
            else:
                print("사용법: python token_usage.py estimate \"텍스트 내용\"")
                
        elif sys.argv[1] == "sync":
            # 강화된 트래커와 동기화
            usage = sync_with_enhanced_tracker()
            print(f"동기화됨 - 총 사용량: {format_number(usage['total'])}")
            
        elif sys.argv[1] == "reset":
            reset_usage()
            
        elif sys.argv[1] == "detail":
            usage = load_usage()
            total = usage.get('total', 0)
            remaining = MAX_TOKENS - total
            percent_used = min(100.0, (total / MAX_TOKENS) * 100)
            percent_remaining = 100.0 - percent_used
            
            print("=" * 50)
            print("📊 토큰 사용량 상세 정보")
            print("=" * 50)
            print(f"입력 토큰: {format_number(usage.get('input', 0))} ({usage.get('input', 0):,})")
            print(f"출력 토큰: {format_number(usage.get('output', 0))} ({usage.get('output', 0):,})")
            print(f"총 사용: {format_number(total)} ({total:,}) / {format_number(MAX_TOKENS)} ({MAX_TOKENS:,})")
            print(f"남은 토큰: {format_number(remaining)} ({remaining:,})")
            print("-" * 50)
            print(f"사용률: {percent_used:.2f}%")
            print(f"남은 비율: {percent_remaining:.2f}%")
            
            # 프로그레스 바 표시
            bar_length = 40
            filled_length = int(bar_length * percent_used / 100)
            bar = '█' * filled_length + '░' * (bar_length - filled_length)
            print(f"진행도: [{bar}] {percent_used:.1f}%")
            print("-" * 50)
            
            if 'start_time' in usage:
                start = datetime.fromisoformat(usage['start_time'])
                print(f"시작 시간: {start.strftime('%Y-%m-%d %H:%M')}")
            if 'reset_time' in usage:
                reset = datetime.fromisoformat(usage['reset_time'])
                print(f"리셋 시간: {reset.strftime('%Y-%m-%d %H:%M')}")
                print(f"남은 시간: {get_time_remaining()}")
            
            # 추가 통계
            if 'estimated_sessions' in usage:
                print(f"추정 세션: {usage['estimated_sessions']}")
            if 'manual_updates' in usage:
                print(f"수동 업데이트: {usage['manual_updates']}")
                
        elif sys.argv[1] == "status":
            # 전체 상태 라인 출력
            print(get_full_status())
            
        elif sys.argv[1] == "monitor":
            # 간단한 모니터링 시작
            print("PowerShell 훅을 사용한 모니터링을 시작하려면:")
            print("powershell -ExecutionPolicy Bypass -File claude_hook.ps1 -Action monitor")
            
        elif sys.argv[1] == "help":
            print("Claude Code 토큰 사용량 추적기")
            print("사용법:")
            print("  python token_usage.py                    # 기본 토큰 상태 표시")
            print("  python token_usage.py status             # 전체 상태 라인")
            print("  python token_usage.py add [입력] [출력]    # 토큰 수동 추가")
            print("  python token_usage.py add --estimate-input   # 입력 텍스트 추정")
            print("  python token_usage.py add --estimate-output  # 출력 텍스트 추정")
            print("  python token_usage.py estimate \"텍스트\"     # 토큰 수 추정만")
            print("  python token_usage.py detail             # 상세 사용량 정보")
            print("  python token_usage.py reset              # 사용량 초기화")
            print("  python token_usage.py sync               # 강화 트래커와 동기화")
            print("  python token_usage.py monitor            # 모니터링 도구 안내")
            
        else:
            print(f"알 수 없는 명령: {sys.argv[1]}")
            print("'python token_usage.py help'로 도움말을 확인하세요.")
    else:
        # 기본: 간단 표시
        print(get_token_display())
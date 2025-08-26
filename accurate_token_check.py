"""
정확한 토큰 상태 확인 스크립트
2025-08-26 기준
"""

import json
import datetime

def check_real_token_status():
    """Claude Code의 실제 토큰 상태 분석"""
    
    print("=" * 60)
    print("토큰 상태 정밀 분석")
    print("=" * 60)
    
    # token_usage.json 읽기
    with open('token_usage.json', 'r') as f:
        data = json.load(f)
    
    # 현재 시간
    now = datetime.datetime.now()
    start_time = datetime.datetime.fromisoformat(data['start_time'])
    reset_time = datetime.datetime.fromisoformat(data['reset_time'])
    
    # 시간 계산
    elapsed = now - start_time
    until_reset = reset_time - now
    
    print(f"\n[시간 정보]")
    print(f"현재 시간: {now.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"시작 시간: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"리셋 시간: {reset_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"경과 시간: {elapsed.total_seconds()/3600:.1f}시간")
    print(f"리셋까지: {until_reset.total_seconds()/3600:.1f}시간")
    
    print(f"\n[기록된 토큰 사용량]")
    print(f"입력 토큰: {data['input']:,}")
    print(f"출력 토큰: {data['output']:,}")
    print(f"총 사용: {data['total']:,}")
    
    # Claude Opus 4.1의 실제 한도 추정
    # 공식 문서 기준이 없으므로 일반적인 추정치 사용
    print(f"\n[문제점 발견]")
    print("1. token_usage.json이 세션 시작(02:32)에만 업데이트됨")
    print("2. 현재(06:28)까지 약 4시간 작업했지만 토큰이 갱신 안됨")
    print("3. 실제 사용량은 75,000보다 훨씬 많을 것")
    
    # 실제 사용량 추정
    hours_worked = elapsed.total_seconds() / 3600
    avg_requests_per_hour = 15  # 시간당 평균 요청
    avg_tokens_per_request = 4000  # 요청당 평균 토큰 (입력+출력)
    
    estimated_actual_tokens = int(hours_worked * avg_requests_per_hour * avg_tokens_per_request)
    
    print(f"\n[실제 사용량 추정]")
    print(f"작업 시간: {hours_worked:.1f}시간")
    print(f"예상 요청 수: {int(hours_worked * avg_requests_per_hour)}회")
    print(f"예상 실제 토큰: {estimated_actual_tokens:,}")
    
    # Opus 4.1 한도 (추정)
    daily_limit = 1000000  # 일일 100만 토큰 (추정)
    remaining_estimate = daily_limit - estimated_actual_tokens
    
    print(f"\n[실제 잔여 토큰 추정]")
    print(f"일일 한도: {daily_limit:,} (추정)")
    print(f"예상 사용: {estimated_actual_tokens:,}")
    print(f"예상 잔여: {remaining_estimate:,}")
    print(f"잔여 비율: {(remaining_estimate/daily_limit)*100:.1f}%")
    
    # 작업 가능 시간 재계산
    remaining_requests = remaining_estimate // avg_tokens_per_request
    remaining_hours = remaining_requests / avg_requests_per_hour
    
    print(f"\n[작업 가능 시간 재계산]")
    print(f"남은 요청: 약 {remaining_requests}회")
    print(f"작업 가능: 약 {remaining_hours:.1f}시간")
    
    print("\n" + "=" * 60)
    print("결론")
    print("=" * 60)
    print("token_usage.json이 실시간 업데이트되지 않아 부정확함")
    print(f"실제 사용량은 약 {estimated_actual_tokens:,} 토큰으로 추정")
    print(f"실제 작업 가능 시간은 약 {remaining_hours:.1f}시간")
    print("\n[중요] Claude 인터페이스의 상태창을 확인하여")
    print("   정확한 토큰 사용량을 확인하세요!")
    
    return {
        "estimated_used": estimated_actual_tokens,
        "estimated_remaining": remaining_estimate,
        "hours_remaining": remaining_hours
    }

if __name__ == "__main__":
    result = check_real_token_status()
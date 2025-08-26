import json
import datetime

def check_token_status():
    with open('token_usage.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    used_tokens = data['total']
    daily_limit = 1000000  # Opus 4.1 일일 한도
    remaining_tokens = daily_limit - used_tokens
    percent_remaining = (remaining_tokens / daily_limit) * 100
    
    # 일반적인 코딩 작업 기준 토큰 사용량 추정
    # 평균: 입력 2000 토큰 + 출력 1000 토큰 = 3000 토큰/요청
    avg_tokens_per_request = 3000
    
    # 남은 요청 횟수 계산
    requests_remaining = remaining_tokens // avg_tokens_per_request
    
    # 작업 가능 시간 추정
    # 일반적으로 시간당 10-15회 요청 (복잡한 작업 기준)
    requests_per_hour = 12  # 평균 12회/시간
    hours_remaining = requests_remaining / requests_per_hour
    
    print("=" * 50)
    print("Opus 4.1 Token Status")
    print("=" * 50)
    print(f"Used Tokens: {used_tokens:,} / {daily_limit:,}")
    print(f"Remaining Tokens: {remaining_tokens:,} ({percent_remaining:.1f}%)")
    print(f"Estimated Requests: {requests_remaining} requests")
    print(f"Work Time Available: {hours_remaining:.1f} hours")
    print("=" * 50)
    
    if hours_remaining > 10:
        print("[OK] Sufficient tokens remaining for large projects!")
    elif hours_remaining > 5:
        print("[GOOD] Moderate tokens for medium-sized tasks!")
    elif hours_remaining > 2:
        print("[WARNING] Low tokens. Use efficiently.")
    else:
        print("[CRITICAL] Very low tokens. Simple tasks only!")
    
    # 리셋 시간 계산
    reset_time = datetime.datetime.fromisoformat(data['reset_time'])
    current_time = datetime.datetime.now()
    time_until_reset = reset_time - current_time
    
    if time_until_reset.total_seconds() > 0:
        hours_until_reset = time_until_reset.total_seconds() / 3600
        print(f"Token reset in: {hours_until_reset:.1f} hours")

if __name__ == "__main__":
    check_token_status()
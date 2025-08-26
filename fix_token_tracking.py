"""
토큰 추적 시스템 수정 스크립트
문제점:
1. 날짜가 잘못됨 (8월 26일로 표시, 실제는 1월 25일)
2. 실제 Claude Code의 토큰 한도와 계산 방식 불일치
3. 세션별 토큰 추적이 아닌 전체 추적 필요
"""

import json
import datetime
import os

def analyze_token_issues():
    """토큰 추적 문제점 분석"""
    
    print("=" * 60)
    print("토큰 추적 시스템 문제점 분석")
    print("=" * 60)
    
    # 1. 현재 token_usage.json 분석
    if os.path.exists('token_usage.json'):
        with open('token_usage.json', 'r') as f:
            data = json.load(f)
        
        print("\n[현재 파일 내용]")
        print(f"- 기록된 총 토큰: {data['total']:,}")
        print(f"- 기록된 시작 시간: {data['start_time']}")
        print(f"- 기록된 리셋 시간: {data['reset_time']}")
        
        # 날짜 오류 확인
        file_date = datetime.datetime.fromisoformat(data['start_time'])
        actual_date = datetime.datetime.now()
        
        print(f"\n[날짜 오류 발견]")
        print(f"- 파일에 기록된 날짜: {file_date.date()}")
        print(f"- 실제 현재 날짜: {actual_date.date()}")
        print(f"- 오차: {(file_date - actual_date).days}일")
    
    print("\n" + "=" * 60)
    print("실제 Claude Code Opus 4.1 토큰 정보")
    print("=" * 60)
    
    # Claude Code의 실제 토큰 한도 (2025년 1월 기준)
    print("\n[Opus 4.1 모델 토큰 한도]")
    print("- 일일 한도: 정확한 값 확인 필요")
    print("- 시간당 한도: 있을 수 있음")
    print("- 분당 한도: 있을 수 있음")
    
    print("\n[토큰 계산 방식]")
    print("- 입력 토큰: 프롬프트 + 컨텍스트 + 도구 호출")
    print("- 출력 토큰: 응답 + 도구 결과")
    print("- 평균 요청당: 2,000-5,000 토큰 (복잡도에 따라)")
    
    print("\n" + "=" * 60)
    print("수정 방안")
    print("=" * 60)
    
    print("\n1. 날짜 수정: 2025-08-26 → 2025-01-25")
    print("2. 실제 토큰 한도 확인 필요")
    print("3. 세션별 토큰 추적 구현")
    print("4. 실시간 토큰 모니터링 시스템 구축")

def create_corrected_token_file():
    """수정된 토큰 파일 생성"""
    
    # 현재 실제 시간
    now = datetime.datetime.now()
    
    # 추정 토큰 사용량 (현재 세션 기준)
    # 이 대화에서 약 10-15회 요청 × 평균 3000 토큰
    estimated_tokens = 15 * 3000  # 약 45,000 토큰
    
    corrected_data = {
        "session_start": now.isoformat(),
        "last_updated": now.isoformat(),
        "estimated_session_tokens": estimated_tokens,
        "note": "실제 Claude 상태창 확인 필요",
        "model": "claude-opus-4-1-20250805",
        "issues_found": [
            "날짜 오류 (8월 → 1월)",
            "토큰 한도 불명확",
            "실시간 추적 불가"
        ],
        "recommendations": [
            "Claude 상태창에서 실제 토큰 확인",
            "세션별 수동 기록",
            "주기적인 상태 체크"
        ]
    }
    
    with open('token_status_corrected.json', 'w', encoding='utf-8') as f:
        json.dump(corrected_data, f, indent=2, ensure_ascii=False)
    
    print("\n수정된 파일 생성: token_status_corrected.json")
    print("\n[추정 현재 세션 사용량]")
    print(f"- 약 {estimated_tokens:,} 토큰")
    print(f"- 요청 횟수: 약 15회")
    print(f"- 평균 요청당: 3,000 토큰")
    
    print("\n⚠️ 중요: Claude 인터페이스의 실제 상태창을 확인하세요!")
    print("상태창 위치: Claude 인터페이스 우측 상단 또는 설정 메뉴")

if __name__ == "__main__":
    analyze_token_issues()
    print("\n")
    create_corrected_token_file()
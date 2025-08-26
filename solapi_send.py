#!/usr/bin/env python3
"""
Solapi SMS 전송 스크립트 - 한국 번호 완벽 지원
사용법: python solapi_send.py --to "01012345678" --message "안녕하세요"
"""

import os
import sys
import argparse
import json
from datetime import datetime
from solapi import SolApi

# Solapi API 인증 정보
# https://console.solapi.com 에서 확인
API_KEY = os.getenv('SOLAPI_API_KEY', 'YOUR_API_KEY')
API_SECRET = os.getenv('SOLAPI_API_SECRET', 'YOUR_API_SECRET')
SENDER_NUMBER = os.getenv('SOLAPI_SENDER', '01038255659')  # 발신번호 (본인 번호)

def send_sms(to_number, message_body, sender=None):
    """SMS 메시지 전송"""
    try:
        # Solapi 클라이언트 초기화
        api = SolApi(API_KEY, API_SECRET)
        
        # 발신번호 설정
        from_number = sender or SENDER_NUMBER
        
        # 수신번호 형식 정리 (010-1234-5678, 010.1234.5678 등 모두 처리)
        to_number = to_number.replace('-', '').replace('.', '').replace(' ', '')
        if to_number.startswith('+82'):
            to_number = '0' + to_number[3:]
        
        # 메시지 전송
        params = {
            'messages': [
                {
                    'to': to_number,
                    'from': from_number,
                    'text': message_body,
                    'type': 'SMS'  # SMS, LMS, MMS 중 선택
                }
            ]
        }
        
        # API 호출
        response = api.messages.send_many(params)
        
        print(f"✅ SMS 전송 성공!")
        print(f"   수신: {to_number}")
        print(f"   발신: {from_number}")
        print(f"   메시지: {message_body[:20]}..." if len(message_body) > 20 else f"   메시지: {message_body}")
        print(f"   그룹ID: {response.get('groupId', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ SMS 전송 실패: {str(e)}")
        return False

def send_lms(to_number, title, message_body, sender=None):
    """LMS (장문) 메시지 전송"""
    try:
        api = SolApi(API_KEY, API_SECRET)
        from_number = sender or SENDER_NUMBER
        
        # 번호 형식 정리
        to_number = to_number.replace('-', '').replace('.', '').replace(' ', '')
        if to_number.startswith('+82'):
            to_number = '0' + to_number[3:]
        
        # LMS 전송
        params = {
            'messages': [
                {
                    'to': to_number,
                    'from': from_number,
                    'subject': title,  # LMS 제목
                    'text': message_body,
                    'type': 'LMS'
                }
            ]
        }
        
        response = api.messages.send_many(params)
        
        print(f"✅ LMS 전송 성공!")
        print(f"   수신: {to_number}")
        print(f"   제목: {title}")
        print(f"   그룹ID: {response.get('groupId', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ LMS 전송 실패: {str(e)}")
        return False

def send_verification_code(to_number, code=None):
    """인증 코드 전송 (6자리 랜덤 생성)"""
    import random
    
    try:
        api = SolApi(API_KEY, API_SECRET)
        
        # 인증 코드 생성
        if not code:
            code = str(random.randint(100000, 999999))
        
        # 번호 형식 정리
        to_number = to_number.replace('-', '').replace('.', '').replace(' ', '')
        if to_number.startswith('+82'):
            to_number = '0' + to_number[3:]
        
        # 인증 메시지 템플릿
        message = f"[Village] 인증번호 [{code}]를 입력해주세요. (유효시간 3분)"
        
        # SMS 전송
        params = {
            'messages': [
                {
                    'to': to_number,
                    'from': SENDER_NUMBER,
                    'text': message,
                    'type': 'SMS'
                }
            ]
        }
        
        response = api.messages.send_many(params)
        
        print(f"✅ 인증 코드 전송 성공!")
        print(f"   수신: {to_number}")
        print(f"   인증 코드: {code}")
        print(f"   유효 시간: 3분")
        
        return code
        
    except Exception as e:
        print(f"❌ 인증 코드 전송 실패: {str(e)}")
        return None

def check_balance():
    """잔액 조회"""
    try:
        api = SolApi(API_KEY, API_SECRET)
        balance = api.cash.balance()
        
        print(f"💰 Solapi 잔액 정보")
        print(f"   잔액: {balance.get('balance', 0):,}원")
        print(f"   포인트: {balance.get('point', 0):,}P")
        
        return balance
        
    except Exception as e:
        print(f"❌ 잔액 조회 실패: {str(e)}")
        return None

def get_message_status(group_id):
    """메시지 전송 상태 확인"""
    try:
        api = SolApi(API_KEY, API_SECRET)
        result = api.messages.get_group(group_id)
        
        print(f"📊 메시지 상태")
        print(f"   그룹ID: {group_id}")
        print(f"   상태: {result.get('status', 'N/A')}")
        print(f"   성공: {result.get('_count', {}).get('success', 0)}건")
        print(f"   실패: {result.get('_count', {}).get('fail', 0)}건")
        
        return result
        
    except Exception as e:
        print(f"❌ 상태 조회 실패: {str(e)}")
        return None

def main():
    parser = argparse.ArgumentParser(description='Solapi SMS 전송 (한국 번호 전용)')
    
    # 명령 선택
    subparsers = parser.add_subparsers(dest='command', help='명령 선택')
    
    # SMS 전송
    sms_parser = subparsers.add_parser('sms', help='SMS 전송')
    sms_parser.add_argument('--to', required=True, help='수신자 번호 (예: 01012345678)')
    sms_parser.add_argument('--message', required=True, help='메시지 내용')
    sms_parser.add_argument('--from', dest='sender', help='발신 번호 (기본: 본인 번호)')
    
    # LMS 전송
    lms_parser = subparsers.add_parser('lms', help='LMS (장문) 전송')
    lms_parser.add_argument('--to', required=True, help='수신자 번호')
    lms_parser.add_argument('--title', required=True, help='LMS 제목')
    lms_parser.add_argument('--message', required=True, help='메시지 내용')
    lms_parser.add_argument('--from', dest='sender', help='발신 번호')
    
    # 인증 코드
    verify_parser = subparsers.add_parser('verify', help='인증 코드 전송')
    verify_parser.add_argument('--to', required=True, help='수신자 번호')
    verify_parser.add_argument('--code', help='인증 코드 (미입력시 자동 생성)')
    
    # 잔액 조회
    balance_parser = subparsers.add_parser('balance', help='잔액 조회')
    
    # 상태 확인
    status_parser = subparsers.add_parser('status', help='메시지 상태 확인')
    status_parser.add_argument('--id', required=True, help='그룹 ID')
    
    args = parser.parse_args()
    
    # API 키 확인
    if API_KEY == 'YOUR_API_KEY' or API_SECRET == 'YOUR_API_SECRET':
        print("❌ 오류: Solapi API 키를 설정해주세요!")
        print("\n📝 설정 방법:")
        print("1. https://console.solapi.com 접속")
        print("2. 회원가입 (무료, 300원 크레딧 제공)")
        print("3. API Keys 메뉴에서 키 생성")
        print("4. 환경변수 설정 또는 이 스크립트에 직접 입력")
        print("\n환경변수 설정:")
        print("  set SOLAPI_API_KEY=your_api_key")
        print("  set SOLAPI_API_SECRET=your_api_secret")
        print("  set SOLAPI_SENDER=01038255659")
        sys.exit(1)
    
    # 명령 실행
    if not args.command:
        parser.print_help()
    elif args.command == 'sms':
        send_sms(args.to, args.message, args.sender)
    elif args.command == 'lms':
        send_lms(args.to, args.title, args.message, args.sender)
    elif args.command == 'verify':
        send_verification_code(args.to, args.code)
    elif args.command == 'balance':
        check_balance()
    elif args.command == 'status':
        get_message_status(args.id)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Twilio Verify 서비스 - 한국 번호 인증 코드 전송
사용법: 
  전송: python twilio_verify.py --send --to "+821012345678"
  확인: python twilio_verify.py --check --to "+821012345678" --code "123456"
"""

import os
import sys
import argparse
from twilio.rest import Client

# Twilio 계정 정보
ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', 'AC2e5ee8e91fa60d8198e79b7e0122da12')
AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', 'ebef292640d3116e5a513cf46c8fd886')

# Verify Service SID (자동 생성 또는 기존 것 사용)
VERIFY_SERVICE_SID = 'VAa00cf11215ac9ad79c1e6ff79093a4a0'

def create_or_get_verify_service(client):
    """Verify 서비스 생성 또는 가져오기"""
    global VERIFY_SERVICE_SID
    
    # 이미 Service SID가 설정되어 있으면 그대로 사용
    if VERIFY_SERVICE_SID:
        print(f"Using Verify Service: {VERIFY_SERVICE_SID}")
        return VERIFY_SERVICE_SID
    
    try:
        # 기존 Verify 서비스 확인
        services = client.verify.v2.services.list(limit=1)
        
        if services:
            VERIFY_SERVICE_SID = services[0].sid
            print(f"Using existing Verify Service: {services[0].friendly_name}")
        else:
            # 새 Verify 서비스 생성
            service = client.verify.v2.services.create(
                friendly_name='Korean SMS Verification',
                code_length=6
            )
            VERIFY_SERVICE_SID = service.sid
            print(f"Created new Verify Service: {service.friendly_name}")
            
        return VERIFY_SERVICE_SID
        
    except Exception as e:
        print(f"Error setting up Verify Service: {str(e)}")
        return None

def send_verification(to_number, channel='sms'):
    """인증 코드 전송"""
    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        
        # Verify 서비스 가져오기
        service_sid = create_or_get_verify_service(client)
        if not service_sid:
            return False
        
        # 인증 코드 전송
        verification = client.verify.v2.services(service_sid) \
            .verifications \
            .create(to=to_number, channel=channel)
        
        print(f"Verification code sent successfully!")
        print(f"   To: {to_number}")
        print(f"   Channel: {channel}")
        print(f"   Status: {verification.status}")
        print(f"   Valid for: 10 minutes")
        
        return True
        
    except Exception as e:
        print(f"Failed to send verification: {str(e)}")
        return False

def check_verification(to_number, code):
    """인증 코드 확인"""
    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        
        # Verify 서비스 가져오기
        service_sid = create_or_get_verify_service(client)
        if not service_sid:
            return False
        
        # 인증 코드 확인
        verification_check = client.verify.v2.services(service_sid) \
            .verification_checks \
            .create(to=to_number, code=code)
        
        if verification_check.status == 'approved':
            print(f"Verification successful!")
            print(f"   Number: {to_number}")
            print(f"   Status: APPROVED")
            return True
        else:
            print(f"Verification failed!")
            print(f"   Status: {verification_check.status}")
            return False
            
    except Exception as e:
        print(f"Failed to check verification: {str(e)}")
        return False

def send_custom_message(to_number, message):
    """커스텀 메시지와 함께 인증 코드 전송 (한국어 지원)"""
    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        
        # Verify 서비스 가져오기
        service_sid = create_or_get_verify_service(client)
        if not service_sid:
            return False
        
        # 서비스 업데이트 (커스텀 메시지 템플릿)
        client.verify.v2.services(service_sid).update(
            custom_code_enabled=True,
            do_not_share_warning_enabled=False
        )
        
        # 인증 코드 전송 (SMS)
        verification = client.verify.v2.services(service_sid) \
            .verifications \
            .create(
                to=to_number,
                channel='sms',
                custom_friendly_name='Village App',
                custom_message=f'{message} 인증 코드: {{{{code}}}}'
            )
        
        print(f"Custom verification sent!")
        print(f"   To: {to_number}")
        print(f"   Message template: {message} 인증 코드: [CODE]")
        
        return True
        
    except Exception as e:
        print(f"Failed to send custom verification: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Twilio Verify - 한국 번호 인증')
    parser.add_argument('--to', required=True, help='수신자 번호 (예: +821012345678)')
    
    # 동작 선택
    action_group = parser.add_mutually_exclusive_group(required=True)
    action_group.add_argument('--send', action='store_true', help='인증 코드 전송')
    action_group.add_argument('--check', action='store_true', help='인증 코드 확인')
    action_group.add_argument('--custom', help='커스텀 메시지와 함께 전송')
    
    # 인증 코드 (확인 시 필요)
    parser.add_argument('--code', help='인증 코드 (6자리)')
    
    # 채널 선택
    parser.add_argument('--channel', default='sms', choices=['sms', 'call', 'whatsapp'],
                       help='전송 채널 (기본값: sms)')
    
    args = parser.parse_args()
    
    # 동작 실행
    if args.send:
        send_verification(args.to, args.channel)
    elif args.check:
        if not args.code:
            print("Error: --code is required for verification check")
            sys.exit(1)
        check_verification(args.to, args.code)
    elif args.custom:
        send_custom_message(args.to, args.custom)

if __name__ == "__main__":
    main()
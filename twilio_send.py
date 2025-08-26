#!/usr/bin/env python3
"""
Twilio SMS/WhatsApp 전송 스크립트
사용법: python twilio_send.py --to "+821012345678" --message "안녕하세요"
"""

import os
import sys
import argparse
from twilio.rest import Client

# Twilio 계정 정보 (환경변수로 설정하거나 직접 입력)
ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', 'YOUR_ACCOUNT_SID')
AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', 'ebef292640d3116e5a513cf46c8fd886')
FROM_NUMBER = os.getenv('TWILIO_FROM_NUMBER', '+821038255659')  # 한국 번호 형식

def send_sms(to_number, message_body):
    """SMS 메시지 전송"""
    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        
        message = client.messages.create(
            body=message_body,
            from_=FROM_NUMBER,
            to=to_number
        )
        
        print("SMS sent successfully!")
        print(f"   Message SID: {message.sid}")
        print(f"   To: {to_number}")
        print(f"   Status: {message.status}")
        return True
        
    except Exception as e:
        print(f"SMS failed: {str(e)}")
        return False

def send_whatsapp(to_number, message_body):
    """WhatsApp 메시지 전송"""
    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        
        # WhatsApp은 번호 앞에 'whatsapp:' 접두어 필요
        from_whatsapp = f'whatsapp:{FROM_NUMBER}'
        to_whatsapp = f'whatsapp:{to_number}'
        
        message = client.messages.create(
            body=message_body,
            from_=from_whatsapp,
            to=to_whatsapp
        )
        
        print("WhatsApp sent successfully!")
        print(f"   Message SID: {message.sid}")
        print(f"   To: {to_number}")
        print(f"   Status: {message.status}")
        return True
        
    except Exception as e:
        print(f"WhatsApp failed: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Twilio SMS/WhatsApp 전송')
    parser.add_argument('--to', required=True, help='수신자 번호 (예: +821012345678)')
    parser.add_argument('--message', required=True, help='메시지 내용')
    parser.add_argument('--type', default='sms', choices=['sms', 'whatsapp'], 
                       help='메시지 타입 (기본값: sms)')
    
    args = parser.parse_args()
    
    # Twilio 설정 확인
    if ACCOUNT_SID == 'YOUR_ACCOUNT_SID' or AUTH_TOKEN == 'YOUR_AUTH_TOKEN':
        print("Error: Please set your Twilio credentials!")
        print("   1. Get Account SID and Auth Token from https://console.twilio.com")
        print("   2. Set environment variables or update this script")
        sys.exit(1)
    
    # 메시지 전송
    if args.type == 'sms':
        send_sms(args.to, args.message)
    else:
        send_whatsapp(args.to, args.message)

if __name__ == "__main__":
    main()
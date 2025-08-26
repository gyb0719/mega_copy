# Twilio Verify 사용 가이드

## 🔴 Trial 계정 제한사항
Trial 계정에서는 **검증된 번호**에만 메시지를 보낼 수 있습니다.

## 📱 번호 검증 방법

### 1단계: Twilio Console 접속
1. https://console.twilio.com 로그인
2. 왼쪽 메뉴에서 **Phone Numbers** → **Verified Caller IDs** 클릭

### 2단계: 번호 추가
1. **Add a new Caller ID** 버튼 클릭
2. 국가 선택: **South Korea (+82)**
3. 번호 입력: `1038255659` (0 제외)
4. **Text me** 선택
5. 받은 인증 코드 입력

### 3단계: 검증 완료 후 테스트
```bash
# 인증 코드 전송
python twilio_verify.py --send --to "+821038255659"

# 인증 코드 확인 (받은 6자리 코드 입력)
python twilio_verify.py --check --to "+821038255659" --code "123456"

# 커스텀 메시지와 함께 전송
python twilio_verify.py --custom "Village 앱" --to "+821038255659"
```

## 💳 정식 계정 업그레이드
Trial 제한을 해제하려면:
1. 결제 정보 추가 (신용카드)
2. 최소 $20 충전
3. 모든 번호에 자유롭게 전송 가능

## 📊 Verify 서비스 장점
- ✅ 한국 번호 지원
- ✅ 인증 코드 자동 생성/검증
- ✅ 10분 자동 만료
- ✅ 재전송 제한 (스팸 방지)
- ✅ SMS, 음성 통화, WhatsApp 지원

## 💰 가격
- SMS: 한국 약 $0.04/건 (약 50원)
- Voice: 한국 약 $0.15/분
- Trial: 무료 $15 크레딧 제공
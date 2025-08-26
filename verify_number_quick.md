# 🚨 번호 검증 필요!

## 빠른 검증 단계:

1. **링크 접속**: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

2. **번호 추가**:
   - "Add a new Caller ID" 클릭
   - Country: **South Korea (+82)**
   - Phone Number: **1038255659** (0 제외)
   - Verification Method: **Text Message**

3. **인증 코드 입력**:
   - 휴대폰으로 받은 6자리 코드 입력
   - "Submit" 클릭

4. **검증 완료 후 테스트**:
```bash
# 인증 코드 전송 (검증 완료 후)
python twilio_verify.py --send --to "+821038255659"
```

## ✅ 검증 상태 확인
검증된 번호는 Console에서 "Verified" 상태로 표시됩니다.

## 💡 참고
- Trial 계정은 검증된 번호에만 전송 가능
- 여러 번호 검증 가능 (최대 10개)
- 정식 계정 업그레이드 시 제한 해제
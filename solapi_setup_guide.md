# 📱 Solapi SMS 설정 가이드

## 🚀 빠른 시작 (5분)

### 1단계: Solapi 회원가입
1. https://console.solapi.com 접속
2. **회원가입** 클릭
3. 이메일 인증 완료
4. **300원 무료 크레딧** 자동 지급!

### 2단계: API 키 발급
1. 로그인 후 **API Keys** 메뉴 클릭
2. **새 API 키 생성** 버튼 클릭
3. 키 이름 입력 (예: "Village App")
4. **API Key**와 **API Secret** 복사

### 3단계: 발신번호 등록 ⚠️ 중요!
1. **발신번호 관리** 메뉴 클릭
2. **발신번호 등록** 버튼 클릭
3. 본인 휴대폰 번호 입력 (01038255659)
4. 인증 문자 확인
5. **등록 완료**

### 4단계: 환경변수 설정
```bash
# Windows (CMD)
setx SOLAPI_API_KEY "발급받은_API_KEY"
setx SOLAPI_API_SECRET "발급받은_API_SECRET"
setx SOLAPI_SENDER "01038255659"

# 새 터미널 열어서 확인
echo %SOLAPI_API_KEY%
```

## 📱 사용 방법

### SMS 전송 (90바이트 이하)
```bash
python solapi_send.py sms --to "01012345678" --message "안녕하세요!"
```

### LMS 전송 (장문 메시지)
```bash
python solapi_send.py lms --to "01012345678" --title "공지사항" --message "긴 메시지 내용..."
```

### 인증 코드 전송
```bash
python solapi_send.py verify --to "01012345678"
```

### 잔액 확인
```bash
python solapi_send.py balance
```

### 전송 상태 확인
```bash
python solapi_send.py status --id "그룹ID"
```

## 💰 요금

| 메시지 타입 | 건당 요금 | 무료 크레딧 |
|------------|----------|------------|
| SMS (90바이트) | 8.4원 | 약 35건 |
| LMS (2000바이트) | 26원 | 약 11건 |
| MMS (이미지) | 88원 | 약 3건 |

## ✅ 체크리스트
- [ ] 회원가입 완료
- [ ] API 키 발급
- [ ] 발신번호 등록 (필수!)
- [ ] 환경변수 설정
- [ ] 테스트 전송

## 🔧 문제 해결

### "발신번호 미등록" 오류
→ 발신번호 관리에서 본인 번호 등록 필수

### "잔액 부족" 오류
→ 충전하기 (최소 1,000원부터)

### "수신번호 형식 오류"
→ 010-1234-5678, 01012345678 모두 지원

## 📞 지원
- 문서: https://docs.solapi.com
- 고객센터: 1600-5107
- 이메일: support@nurigo.net
# 카카오톡 알림 설정 가이드

## 1. 카카오 개발자 앱 설정

1. [Kakao Developers](https://developers.kakao.com) 접속
2. 로그인 후 **내 애플리케이션** 클릭
3. **애플리케이션 추가하기** 클릭
4. 앱 정보 입력:
   - 앱 이름: `작업 알림` (원하는 이름)
   - 사업자명: 개인 개발자

## 2. 앱 필수 설정

### REST API 키 복사
1. 앱 설정 > 요약 정보
2. **REST API 키** 복사
3. `kakao_notify.py` 파일에서 `YOUR_REST_API_KEY` 부분에 붙여넣기

### Redirect URI 설정
1. 앱 설정 > 플랫폼 > Web
2. 사이트 도메인: `http://localhost:5000` 추가
3. 카카오 로그인 > 활성화 설정: **ON**
4. 카카오 로그인 > Redirect URI: `http://localhost:5000` 등록

### 동의항목 설정
1. 카카오 로그인 > 동의항목
2. **카카오톡 메시지 전송** 체크 (필수)

## 3. 설치 및 실행

### 필요한 패키지 설치
```bash
pip install requests
```

### 초기 설정 실행
```bash
python kakao_notify.py
```

1. REST API 키를 파일에 입력한 후 실행
2. 브라우저가 자동으로 열림
3. 카카오 로그인 후 동의
4. 리다이렉트된 URL에서 `code=` 뒤의 값 복사
5. 터미널에 붙여넣기
6. 토큰이 `kakao_token.txt`에 저장됨

## 4. 사용 방법

### 기본 메시지 전송
```bash
python send_notification.py
```

### 커스텀 메시지 전송
```bash
python send_notification.py "빌드가 완료되었습니다!"
```

### npm 스크립트와 함께 사용
```json
// package.json
{
  "scripts": {
    "build:notify": "npm run build && python send_notification.py '빌드 완료!'"
  }
}
```

### Windows 배치 파일에서 사용
```batch
@echo off
npm run build
if %errorlevel% == 0 (
    python send_notification.py "빌드 성공!"
) else (
    python send_notification.py "빌드 실패!"
)
```

## 5. 토큰 갱신

토큰이 만료되면 (약 6시간) `kakao_notify.py`를 다시 실행하여 갱신

## 주의사항

- 토큰은 약 6시간 유효
- `kakao_token.txt` 파일은 공유하지 마세요
- 나에게 메시지는 본인에게만 전송 가능
# MCP Google Authentication Server

Google OAuth2 인증을 지원하는 MCP (Model Context Protocol) 서버입니다.

## 설정 방법

### 1. Google OAuth2 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" > "Credentials" 메뉴로 이동
4. "Create Credentials" > "OAuth client ID" 선택
5. Application type: "Web application" 선택
6. Authorized redirect URIs에 추가:
   - `http://localhost:3000/auth/callback`
7. Client ID와 Client Secret 저장

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 값 입력:

```bash
cp .env.example .env
```

`.env` 파일 편집:
```
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
SESSION_SECRET=generate-random-secret-key
```

### 3. 패키지 설치

```bash
npm install
```

### 4. 서버 실행

```bash
npm start
```

또는 개발 모드 (자동 재시작):
```bash
npm run dev
```

## MCP 클라이언트 연결

`.mcp.json` 파일이 이미 설정되어 있습니다. MCP 클라이언트에서 자동으로 연결됩니다.

## 사용 가능한 MCP Tools

- `getAuthStatus`: 현재 인증 상태 확인
- `initiateAuth`: Google OAuth 인증 시작
- `getUserInfo`: 인증된 사용자 정보 조회
- `logout`: 로그아웃

## API 엔드포인트

- `GET /auth/google`: Google OAuth 인증 시작
- `GET /auth/callback`: OAuth 콜백 처리
- `GET /auth/status`: 인증 상태 확인
- `POST /auth/logout`: 로그아웃

## 보안 고려사항

- Production 환경에서는 반드시 HTTPS 사용
- Session secret을 안전하게 관리
- Client secret을 절대 공개 저장소에 커밋하지 않기
- 적절한 CORS 설정 사용
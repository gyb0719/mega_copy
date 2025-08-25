# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 설정
항상 한국어로 응답하세요. 모든 설명, 메시지, 코멘트를 한국어로 작성합니다.

## 프로젝트 구조

### 주요 프로젝트 목록
- **village**: Flutter 기반 동네 공유 플랫폼 앱 (Supabase 백엔드)
- **devyb-shop**: Next.js 15.5 기반 이커머스 프론트엔드
- **devyb-shop-api**: Node.js/Express 5.1 기반 이커머스 API 서버
- **mcp-server**: Google OAuth2 인증을 지원하는 MCP 서버

## 개발 명령어

### Village (Flutter 앱)
```bash
# 의존성 설치
flutter pub get

# 코드 생성 (freezed 모델 등)
flutter packages pub run build_runner build --delete-conflicting-outputs

# 앱 실행
flutter run

# APK 빌드
flutter build apk --debug  # 디버그 빌드
flutter build apk --release  # 릴리즈 빌드

# 테스트 실행
flutter test

# 코드 분석
flutter analyze

# Flutter 환경 체크
flutter doctor
```

### DevYB Shop (Next.js 이커머스)
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드 (Turbopack 사용)
npm run build

# 프로덕션 서버 실행
npm start

# 타입 체크
tsc --noEmit
```

### DevYB Shop API (Node.js/Express)
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (nodemon + TypeScript)
npm run dev

# TypeScript 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 개발 서버 직접 실행 (ts-node)
npm run start:dev

# 린트 실행
npm run lint

# 빌드 폴더 정리
npm run clean
```

### MCP Server
```bash
# 의존성 설치
npm install

# 서버 실행
npm start

# 개발 모드 (자동 재시작)
npm run dev
```

## 아키텍처 개요

### Village 앱 구조
- **lib/features/**: 기능별 모듈 (auth, chat, home, items, map, news, profile 등)
- **lib/shared/**: 공통 컴포넌트와 위젯 (animations, models, widgets)
- **lib/theme/**: Village/Billage 디자인 시스템과 테마 설정
- **lib/services/**: 외부 서비스 연동 (Supabase, Google Maps, 결제, 검색 등)
- **lib/core/**: 핵심 비즈니스 로직 (models, providers, repositories)
- **상태 관리**: Riverpod
- **라우팅**: GoRouter
- **모델 생성**: Freezed + json_serializable

### DevYB Shop 구조
- **Next.js 15.5**: App Router 사용 (Turbopack 활성화)
- **상태 관리**: Zustand 5.0
- **API 통신**: Axios 1.11
- **스타일링**: Tailwind CSS v4 (PostCSS)
- **애니메이션**: Framer Motion 12.23
- **아이콘**: Lucide React
- **TypeScript**: 엄격한 타입 체크 적용

### DevYB Shop API 구조
- **Express 5.1**: 최신 버전 사용
- **데이터베이스**: MongoDB + Mongoose 8.18
- **인증**: JWT + bcryptjs
- **파일 업로드**: Multer + Cloudinary
- **결제**: Stripe 18.4
- **실시간 통신**: Socket.io 4.8
- **보안**: Helmet, CORS, 입력 검증 (Joi)

## 환경 설정 파일

### Village (.env 파일 필요)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
GOOGLE_MAPS_ANDROID_API_KEY=AIzaSy...
PORTONE_USER_CODE=imp_...
```

### DevYB Shop API (.env 파일 필요)
```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=5000
```

### MCP Server (.env 파일 필요)
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
SESSION_SECRET=generate-random-secret-key
```

## 작업 가이드라인

### Village 앱 작업 시
- 항상 Flutter 앱 작업 후 `flutter analyze`로 코드 검증
- 새로운 모델 추가 시 freezed 코드 생성: `flutter packages pub run build_runner build --delete-conflicting-outputs`
- UI 컴포넌트는 Village/Billage 디자인 시스템 준수 (lib/theme/village_design_system.dart)
- 에러 발생 시 FLUTTER_ERROR_FIXING_PROGRESS.md 참고
- 테스트 시나리오는 TEST_SCENARIOS.md 참고

### DevYB Shop 작업 시
- Turbopack 모드로 개발 (package.json에 이미 설정됨)
- TypeScript 타입 검증 필수: `tsc --noEmit`
- API 연동 시 에러 핸들링 철저히
- 컴포넌트는 app/components 폴더에 작성
- Context는 app/contexts 폴더 사용
- 타입 정의는 app/types/index.ts에 통합 관리

### DevYB Shop API 작업 시
- TypeScript 타입 안전성 보장
- 모든 엔드포인트에 입력 검증 (Joi) 적용
- 에러 미들웨어 활용 (middleware/errorHandler.ts)
- 환경변수는 config 폴더에서 중앙 관리
- API 문서화 유지

## 디버깅 도구

### Flutter
```bash
# 로그 확인
flutter logs

# 디바이스 목록
flutter devices

# Flutter 환경 체크
flutter doctor

# 캐시 정리
flutter clean
flutter pub get
```

### Node.js (Windows)
```bash
# 포트 사용 확인
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID [PID] /F

# npm 캐시 정리
npm cache clean --force
```

## 자주 사용하는 배치 파일 및 스크립트
- **start-ecommerce.bat**: 이커머스 프로젝트 초기 설정 및 패키지 설치
- **claude_korean.bat**: Claude 한국어 모드 실행
- **build_windows.bat**: Windows 빌드 스크립트
- **claude_tokens.bat**: 토큰 사용량 추적

## 코드 작성 원칙

### 파일 관리
- 기존 파일 수정을 우선시 (새 파일 생성 최소화)
- 문서 파일(*.md, README)은 명시적 요청 시에만 생성
- 프로젝트별 기존 구조와 네이밍 컨벤션 준수

### 코드 품질
- TypeScript/Dart 타입 안전성 보장
- 에러 핸들링 철저히 구현
- 기존 코드 스타일과 일관성 유지
- 보안 모범 사례 준수 (환경변수 관리, 인증 처리 등)

### 테스트 및 검증
- 코드 변경 후 반드시 린트/분석 도구 실행
- Flutter: `flutter analyze`
- TypeScript: `tsc --noEmit`
- 단위 테스트 작성 권장

## 효율적인 작업을 위한 팁

### 1. 중요한 작업 후 주기적으로 커밋
- 기능 구현이나 버그 수정 완료 시 즉시 커밋
- 의미 있는 작업 단위로 커밋 메시지 작성
- 세션이 끊겨도 작업 내용을 보존

### 2. 긴 작업은 단계별로 나눠서 진행
- 복잡한 작업은 작은 단위로 분할
- TodoWrite 도구를 활용한 작업 추적
- 각 단계별 완료 상태 확인 후 다음 진행

### 3. 작업 내용을 문서화
- 프로젝트별 README.md 파일 유지
- 구현 내용과 설정 방법 명확히 기록
- 향후 작업을 위한 TODO 리스트 관리
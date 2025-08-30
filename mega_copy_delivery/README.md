# MEGA 쇼핑몰 - 납품 안내서

## 프로젝트 개요
고품질 온라인 쇼핑몰 솔루션

## 기술 스택
- **프론트엔드**: Next.js 14, React 18, TypeScript
- **스타일링**: Tailwind CSS, Framer Motion
- **백엔드**: Supabase (PostgreSQL + 실시간 기능)
- **인프라**: Cloudflare Pages 배포 최적화

## 설치 가이드

### 1. 환경 설정
1. `.env.example` 파일을 `.env.local`로 복사
2. Supabase 프로젝트 생성 후 키 입력
3. 도메인 및 카카오톡 채널 URL 설정

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
npm run start
```

## 배포 가이드

### Cloudflare Pages 배포 (권장)
1. Cloudflare 계정 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - 빌드 명령어: `npm run build`
   - 빌드 출력 디렉토리: `out`
4. 환경 변수 설정
5. 자동 배포 활성화

### 환경 변수 설정
프로덕션 환경에서 다음 변수 필수 설정:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 공개 키
- `SUPABASE_SERVICE_KEY`: Supabase 서비스 키
- `NEXT_PUBLIC_SITE_URL`: 실제 도메인 주소

## 주요 기능
- 상품 관리 시스템
- 관리자 패널
- 카테고리별 상품 분류
- 검색 기능
- 반응형 디자인
- PWA 지원

## 관리자 접속
- URL: `/admin`
- 최초 관리자 계정은 Supabase에서 직접 생성 필요

## 지원 및 유지보수
- 모든 소스 코드 포함
- 상세 주석 처리
- 확장 가능한 구조

## 라이선스
본 프로젝트는 구매자에게 모든 권한이 양도됩니다.
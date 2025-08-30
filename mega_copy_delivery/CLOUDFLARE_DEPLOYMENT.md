# Cloudflare Pages 배포 가이드

## 🚀 Cloudflare Pages 최적화 설정

이 프로젝트는 **Cloudflare Pages에 최적화**되어 있습니다.

### ✅ 이미 적용된 설정

#### next.config.js 설정
```javascript
{
  output: 'export',           // 정적 사이트 생성
  trailingSlash: true,        // URL 끝에 / 추가
  images: {
    unoptimized: true         // Cloudflare는 Next.js 이미지 최적화 미지원
  }
}
```

### 📝 배포 단계별 가이드

#### 1. GitHub 저장소 준비
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/mega-shop.git
git push -u origin main
```

#### 2. Cloudflare Pages 설정
1. [Cloudflare Pages](https://pages.cloudflare.com) 접속
2. "Create a project" 클릭
3. "Connect to GitHub" 선택
4. 저장소 선택

#### 3. 빌드 설정 (중요!)
```
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Root directory: /
Node version: 18
```

#### 4. 환경 변수 설정
Cloudflare Pages 대시보드 > Settings > Environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.pages.dev
NEXT_PUBLIC_KAKAO_CHAT_URL=your_kakao_url
```

### ⚠️ 주의사항

#### API Routes 제한
Cloudflare Pages는 정적 호스팅이므로 Next.js API Routes (`/api/*`)가 작동하지 않습니다.
- 이미지 업로드 등의 서버 기능은 Supabase Storage API 직접 사용
- 관리자 인증은 Supabase Auth 사용

#### 동적 라우팅
- `[id]` 같은 동적 라우트는 `generateStaticParams` 필요
- 또는 클라이언트 사이드 라우팅 사용

### 🎯 성능 최적화

#### Cloudflare 자동 최적화
- 자동 JS/CSS 압축
- 자동 이미지 최적화 (Polish)
- 전 세계 CDN 캐싱
- DDoS 보호

#### 추가 설정 (선택)
1. **커스텀 도메인**
   - Pages 대시보드 > Custom domains
   - DNS 레코드 자동 생성

2. **Web Analytics**
   - 무료 분석 도구
   - Pages 대시보드에서 활성화

3. **Page Rules**
   - 캐시 정책 커스터마이징
   - 리다이렉트 설정

### 🔧 트러블슈팅

#### 빌드 실패 시
```bash
# 로컬에서 먼저 테스트
npm run build
npx serve out
```

#### 404 에러
- `next.config.js`의 `trailingSlash: true` 확인
- Cloudflare Pages > Settings > Builds & deployments > Build settings 확인

#### 환경 변수 미적용
- Production/Preview 환경 구분 확인
- 변수명이 `NEXT_PUBLIC_`로 시작하는지 확인

### 📊 배포 후 모니터링

1. **Cloudflare Analytics**
   - 방문자 수, 대역폭 사용량
   - 성능 메트릭

2. **Web Vitals**
   - Core Web Vitals 점수
   - 페이지 로드 시간

3. **Error Tracking**
   - Supabase 로그 확인
   - Browser Console 에러 체크

### 🚄 빠른 배포 명령어

```bash
# 변경사항 푸시 (자동 배포)
git add .
git commit -m "Update"
git push

# 수동 재배포
# Cloudflare Pages 대시보드 > Deployments > Retry deployment
```

---
**참고**: Cloudflare Pages는 매월 500회 무료 빌드, 무제한 대역폭을 제공합니다.
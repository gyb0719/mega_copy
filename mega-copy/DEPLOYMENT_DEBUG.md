# 🔴 Cloudflare Pages 배포 문제 해결 가이드

## 현재 상황
- GitHub 푸시 완료 ✅
- Cloudflare Pages 빌드 상태: 확인 필요
- 사이트 변경사항 미반영 ❌

## 📋 체크리스트

### 1. Cloudflare Pages 빌드 로그 확인
1. https://dash.cloudflare.com 접속
2. Pages → mega-copy → Deployments
3. 최신 배포 클릭 → "View build log"
4. **다음 에러 메시지를 찾아보세요:**
   - `Build failed`
   - `Module not found`
   - `Cannot find module`
   - `Build exceeded time limit`

### 2. Cloudflare Pages 빌드 설정 확인
Settings → Builds & deployments에서:

**현재 설정이 이렇게 되어있는지 확인:**
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: /
Node version: 18
```

**만약 다르다면 이렇게 변경:**
```
Framework preset: None
Build command: npm run build
Build output directory: .next
Root directory: /
Environment variables:
  NODE_VERSION = 18
```

### 3. 브랜치 확인
- Production branch가 `master`로 설정되어 있는지 확인
- 만약 `main`으로 되어있다면 `master`로 변경

### 4. 대안 1: Static Export로 변경
```javascript
// next.config.js 수정
const nextConfig = {
  output: 'export',  // 'standalone' 대신 'export'
  // ... 나머지 설정
}
```

### 5. 대안 2: Vercel로 마이그레이션
Cloudflare Pages가 계속 문제라면:
1. https://vercel.com 가입
2. GitHub 연동
3. Import repository
4. 자동 배포

### 6. 대안 3: 수동 빌드 후 업로드
```bash
# 로컬에서 빌드
npm run build
npx next export  # out 폴더 생성

# Cloudflare Pages Direct Upload
1. Cloudflare Pages 대시보드
2. "Create a project" → "Upload assets"
3. out 폴더 업로드
```

## 🚨 긴급 해결책

### 방법 A: 프로젝트 재생성
1. Cloudflare Pages에서 현재 프로젝트 삭제
2. 새 프로젝트 생성
3. GitHub 다시 연결
4. 빌드 설정:
   ```
   Build command: npm run build
   Build output directory: .next
   Node version: 18
   ```

### 방법 B: GitHub Actions 사용
`.github/workflows/deploy.yml` 생성:
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: mega-copy
          directory: .next
```

## 🔍 디버깅 정보 수집

Cloudflare Pages 대시보드에서 다음 정보를 확인하고 알려주세요:

1. **Build Status**: Success / Failed / Building
2. **Build Duration**: 몇 분 걸렸는지
3. **Error Message**: 빌드 로그의 에러 메시지
4. **Deploy Status**: Active / Failed
5. **Preview URL**: 작동하는지

## ⚡ 즉시 시도해볼 것

1. **다른 브라우저/기기에서 확인**
   - 모바일에서 접속
   - 다른 PC에서 접속
   - VPN 사용하여 접속

2. **DNS 전파 확인**
   - https://www.whatsmydns.net 에서 megacopy.shop 검색
   - 모든 지역에서 동일한 IP인지 확인

3. **Cloudflare 개발자 모드**
   - Cloudflare 대시보드 → Caching → Configuration
   - "Development Mode" 활성화 (3시간 동안 캐시 무시)

## 📞 추가 지원

문제가 계속되면:
1. Cloudflare 지원팀 문의
2. Vercel로 마이그레이션 고려
3. 다른 호스팅 서비스 검토
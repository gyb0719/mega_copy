# Cloudflare Pages 배포 문제 해결

## 문제 원인 분석

1. **GitHub 자동 배포는 성공했지만 변경사항이 반영되지 않음**
   - Cloudflare Pages가 GitHub 푸시를 감지했지만 빌드가 실패했을 가능성
   - Next.js 15와 Cloudflare Pages 호환성 문제
   - Windows 환경에서 @cloudflare/next-on-pages 빌드 실패

2. **빌드 출력 디렉토리가 비어있음**
   - `.vercel/output/static` 폴더가 생성되지 않음
   - Cloudflare가 빈 폴더를 배포하여 이전 버전이 계속 표시됨

## 해결 방법

### 방법 1: Cloudflare 대시보드에서 직접 재배포

1. https://dash.cloudflare.com 접속
2. Pages → mega-copy 선택
3. Settings → Builds & deployments
4. Build configuration 확인:
   ```
   Build command: npm run build
   Build output directory: .next
   ```
   또는
   ```
   Build command: npx @cloudflare/next-on-pages@1
   Build output directory: .vercel/output/static
   ```

5. Deployments 탭에서 최신 배포 확인
6. "Retry deployment" 클릭

### 방법 2: 캐시 강제 초기화

브라우저에서:
1. F12 (개발자도구) 열기
2. Network 탭 → "Disable cache" 체크
3. Ctrl + Shift + R (강제 새로고침)

Cloudflare 캐시 퍼지:
1. Cloudflare 대시보드 → Caching → Configuration
2. "Purge Everything" 클릭

### 방법 3: 환경변수 확인

Cloudflare Pages 대시보드에서:
1. Settings → Environment variables
2. 다음 변수들이 설정되어 있는지 확인:
   ```
   NODE_VERSION = 18
   NEXT_PUBLIC_SUPABASE_URL = https://nzmscqfrmxqcukhshsok.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
   ```

### 방법 4: 빌드 명령 수정

Cloudflare Pages 설정에서:
1. Build command를 다음으로 변경:
   ```
   npm run build && echo "Build completed"
   ```
2. Build output directory:
   ```
   .next
   ```

## 즉시 해결책

1. **캐시 완전 제거**
   - Cloudflare 대시보드에서 "Purge Everything"
   - 브라우저 캐시 삭제
   - 시크릿 모드에서 확인

2. **배포 로그 확인**
   - Cloudflare Pages → Deployments
   - 최신 배포 클릭 → View build log
   - 에러 메시지 확인

3. **수동 트리거**
   - Settings → Builds & deployments
   - "Trigger deployment" 클릭
   - Production branch 선택

## 확인 사항

- [ ] GitHub에 푸시가 정상적으로 되었는가?
- [ ] Cloudflare Pages가 자동 빌드를 시작했는가?
- [ ] 빌드가 성공했는가? (에러 없이)
- [ ] 배포 상태가 "Active"인가?
- [ ] 캐시를 제거했는가?

## 문제가 지속될 경우

1. Cloudflare Pages 프로젝트 재생성
2. Vercel로 마이그레이션 고려
3. Static export 방식으로 변경
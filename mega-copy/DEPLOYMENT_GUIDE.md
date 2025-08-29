# MEGA-COPY 배포 가이드

## 해결된 문제들

### 1. 모바일 관리자 버튼 문제 ✅
- **문제**: 모바일에서 관리자 버튼 클릭이 작동하지 않음
- **원인**: Link 컴포넌트에서 onClick 이벤트와 preventDefault()가 충돌
- **해결**: Header 컴포넌트에서 불필요한 이벤트 핸들러 제거

### 2. 상품 등록 기능 문제 ✅
- **문제**: 상품 등록 버튼 클릭 시 아무 반응 없음
- **원인**: 
  - ProductAddModal 컴포넌트가 없었음
  - API 라우트가 구현되지 않았음
- **해결**:
  - `/app/api/products/route.ts` - 상품 목록 API 구현
  - `/app/api/products/[id]/route.ts` - 개별 상품 API 구현
  - `/app/components/ProductAddModal.tsx` - 상품 추가 모달 구현

## 배포 전 체크리스트

### 1. 환경 변수 설정
`.env.production` 파일이 이미 설정되어 있음:
```
NEXT_PUBLIC_SUPABASE_URL=https://nzmscqfrmxqcukhshsok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase 설정
- `product-images` 스토리지 버킷이 생성되어 있어야 함
- RLS 정책이 올바르게 설정되어 있어야 함
- ULTIMATE_FIX.sql 스크립트가 실행되어 있어야 함

### 3. 빌드 및 배포

#### Vercel 배포
```bash
npm run build
vercel --prod
```

#### Cloudflare Pages 배포
```bash
npm run pages:build
npm run pages:deploy
```

## 주요 기능 테스트

### 1. 관리자 페이지 접속
- PC: 우측 상단 설정 아이콘 클릭
- 모바일: 우측 상단 설정 아이콘 터치
- 로그인 정보: admin / admin123

### 2. 상품 등록 테스트
1. 관리자 페이지에서 "상품 관리" 탭 클릭
2. 우측 하단 FAB(+) 버튼 클릭
3. 상품 정보 입력:
   - 이미지 업로드 (최대 9개)
   - 상품명 (필수)
   - 가격 (필수)
   - 카테고리 (필수)
   - 기타 정보
4. "상품 등록" 버튼 클릭

### 3. 상품 관리 기능
- 상품 검색
- 카테고리 필터링
- 상품 삭제
- 일괄 선택 및 삭제
- 카테고리 일괄 변경

## 알려진 이슈 및 향후 개선사항

### 향후 개선 필요
1. 상품 수정 기능 구현
2. 실제 결제 시스템 연동
3. 주문 관리 기능 구현
4. 고객 관리 기능 구현
5. 이미지 최적화 (리사이징, 압축)

### 보안 개선 필요
1. 관리자 인증 시스템 강화 (현재 localStorage 기반)
2. API 라우트 인증 미들웨어 추가
3. Rate limiting 구현
4. CORS 설정 강화

## 배포 URL
- 프로덕션: https://megacopy.shop
- GitHub: https://github.com/gyb0719/mega_copy.git

## 문의사항
배포 중 문제가 발생하면 다음을 확인하세요:
1. Supabase 대시보드에서 API 키와 URL이 올바른지 확인
2. 스토리지 버킷 권한 설정 확인
3. 데이터베이스 함수(RPC)가 정상 작동하는지 확인
4. 브라우저 개발자 도구에서 네트워크 에러 확인
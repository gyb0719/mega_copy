# 프로젝트 구조 설명

## 📁 폴더 구조
```
mega_copy_delivery/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # 관리자 페이지
│   ├── api/               # API 라우트
│   ├── components/        # React 컴포넌트
│   ├── product/           # 상품 상세 페이지
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── lib/                   # 유틸리티 및 설정
│   ├── supabase.ts       # Supabase 클라이언트
│   └── utils.ts          # 헬퍼 함수
├── public/               # 정적 파일
│   ├── images/          # 이미지 리소스
│   └── manifest.json    # PWA 설정
└── 설정 파일들
    ├── next.config.js    # Next.js 설정
    ├── tailwind.config.js # Tailwind CSS 설정
    └── tsconfig.json     # TypeScript 설정
```

## 🔑 주요 컴포넌트

### 사용자 인터페이스
- `Header.tsx` - 상단 네비게이션
- `ProductGrid.tsx` - 상품 그리드 레이아웃
- `CategorySection.tsx` - 카테고리 필터
- `SearchBar.tsx` - 검색 기능
- `MobileMenu.tsx` - 모바일 메뉴

### 관리자 기능
- `AdminManagement.tsx` - 관리자 대시보드
- `ProductAddModal.tsx` - 상품 추가 모달
- `ProductEditModal.tsx` - 상품 수정 모달

## 📊 데이터 플로우

### 상품 데이터
```
Supabase (PostgreSQL)
    ↓
API Routes (/app/api/)
    ↓
React Components
    ↓
사용자 인터페이스
```

### 이미지 처리
```
사용자 업로드
    ↓
Supabase Storage
    ↓
CDN URL 생성
    ↓
Next.js Image 최적화
```

## 🛠 커스터마이징 가이드

### 색상 테마 변경
`app/globals.css`에서 CSS 변수 수정:
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

### 카테고리 추가
1. Supabase에서 categories 테이블에 추가
2. `CategorySection.tsx` 자동 반영

### 새 페이지 추가
```typescript
// app/새페이지/page.tsx
export default function NewPage() {
  return <div>새 페이지 내용</div>
}
```

## 🔍 중요 파일 설명

### `lib/supabase.ts`
- Supabase 클라이언트 초기화
- 인증 및 데이터베이스 연결

### `app/api/upload/route.ts`
- 이미지 업로드 API
- Supabase Storage 연동

### `app/layout.tsx`
- 전체 앱 레이아웃
- 메타데이터 설정
- 폰트 및 스타일 로드

## 🚀 성능 최적화

### 이미 적용된 최적화
- 이미지 레이지 로딩
- 정적 페이지 생성
- 컴포넌트 레벨 코드 스플리팅
- Tailwind CSS 퍼지

### 추가 최적화 옵션
- Redis 캐싱 추가
- CDN 설정
- 데이터베이스 커넥션 풀링

## 🔐 보안 고려사항

### 구현된 보안 기능
- 환경 변수로 민감 정보 관리
- CORS 설정
- Rate Limiting 준비
- SQL Injection 방지 (Prepared Statements)

### 추가 보안 강화
- HTTPS 강제
- CSP 헤더 설정
- 2FA 구현 가능
# Supabase 설정 가이드

## 1. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 기존 Pro 구독 프로젝트 선택 또는 새 프로젝트 생성

## 2. 환경 변수 설정

`.env.local` 파일에 다음 정보 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_PASSWORD=mega2024
```

Supabase Dashboard > Settings > API에서 확인 가능:
- `URL`: Project URL
- `Anon key`: Project API keys의 anon public

## 3. 데이터베이스 테이블 생성

SQL Editor에서 `supabase/schema.sql` 파일 내용 실행:

1. Dashboard > SQL Editor
2. New Query 클릭
3. `supabase/schema.sql` 파일 내용 복사/붙여넣기
4. Run 클릭

## 4. Storage 버킷 생성

1. Dashboard > Storage
2. New bucket 클릭:
   - Name: `product-images`
   - Public bucket: ✅ 체크
   - Allowed MIME types:
     - image/jpeg
     - image/png
     - image/gif
     - image/webp

## 5. Storage 정책 설정 (선택사항)

보안 강화를 위해 RLS 정책 추가:

```sql
-- 모든 사용자가 이미지를 볼 수 있음
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');
```

## 6. 초기 관리자 계정 생성 (선택사항)

관리자 인증을 DB로 관리하려면:

```sql
-- bcrypt 해시된 비밀번호 (mega2024)
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$YourHashedPasswordHere');
```

## 7. 테스트

1. 개발 서버 실행: `npm run dev`
2. 관리자 페이지 접속: http://localhost:3004/admin
3. 비밀번호: mega2024
4. 상품 등록 테스트

## 트러블슈팅

### CORS 에러
Dashboard > Authentication > URL Configuration에서 허용된 URL 확인

### 이미지 업로드 실패
- Storage 버킷 Public 설정 확인
- 파일 크기 제한 확인 (기본 50MB)

### 데이터베이스 연결 실패
- 환경 변수 확인
- Supabase 프로젝트 상태 확인
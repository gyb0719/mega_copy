# Supabase Storage 업로드 문제 해결 가이드

## 🚨 문제
상품 등록시 "메인 이미지 업로드 실패" 오류 발생

## ✅ 즉시 해결 방법

### 방법 1: Supabase 대시보드에서 직접 설정 (권장)

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Storage** 클릭
4. `product-images` 버킷 클릭
5. **Policies** 탭 클릭
6. **New Policy** 버튼 클릭
7. **For full customization** 선택
8. 다음 정책들을 각각 추가:

#### 업로드 허용 정책
- Policy name: `Allow public uploads`
- Policy command: `INSERT`
- Target roles: `anon, authenticated`
- WITH CHECK expression: `true`

#### 조회 허용 정책
- Policy name: `Allow public access`
- Policy command: `SELECT`
- Target roles: `anon, authenticated`
- USING expression: `true`

#### 삭제 허용 정책
- Policy name: `Allow public delete`
- Policy command: `DELETE`
- Target roles: `anon, authenticated`
- USING expression: `true`

### 방법 2: SQL Editor에서 실행

1. Supabase 대시보드 > SQL Editor
2. 아래 SQL 복사하여 실행:

```sql
-- Storage 버킷을 public으로 설정
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- 새 정책 생성
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Allow public delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images');
```

### 방법 3: 임시 해결책 (테스트용)

1. Supabase 대시보드 > Storage
2. `product-images` 버킷 설정
3. **RLS 비활성화** (보안상 권장하지 않음)

## 🔍 문제 확인 방법

1. 브라우저 개발자 도구 (F12) 열기
2. Console 탭 확인
3. 상품 등록 시도
4. 에러 메시지 확인:
   - `row-level security` 에러 → RLS 정책 문제
   - `bucket not found` → 버킷 생성 필요
   - `unauthorized` → API 키 문제

## 📝 추가 정보

- 업로드 API 경로: `/api/upload`
- Storage 버킷명: `product-images`
- 최대 파일 크기: 5MB
- 허용 파일 형식: image/jpeg, image/png, image/gif, image/webp

## 🆘 여전히 문제가 있다면

1. Supabase 프로젝트 URL 확인
2. Anon Key 확인
3. 버킷이 생성되어 있는지 확인
4. 브라우저 콘솔 로그 확인
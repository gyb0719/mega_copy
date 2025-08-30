-- ========================================
-- Supabase Storage RLS 정책 수정
-- product-images 버킷 업로드 권한 문제 해결
-- ========================================

-- 1. 먼저 기존 정책 확인 및 삭제
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;

-- 2. product-images 버킷이 public인지 확인하고 설정
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- 3. 버킷이 없으면 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 4. Storage RLS 정책 생성 (모든 사용자 허용)

-- 4-1. 업로드 허용 (INSERT)
CREATE POLICY "Anyone can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- 4-2. 조회 허용 (SELECT)
CREATE POLICY "Anyone can view images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

-- 4-3. 업데이트 허용 (UPDATE)
CREATE POLICY "Anyone can update images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- 4-4. 삭제 허용 (DELETE)
CREATE POLICY "Anyone can delete images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images');

-- 5. RLS가 활성화되어 있는지 확인
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. 확인 쿼리
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- 7. 버킷 정보 확인
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- ========================================
-- 실행 후 확인사항:
-- 1. Supabase 대시보드 > Storage > product-images 버킷 확인
-- 2. RLS Policies 탭에서 정책이 올바르게 설정되었는지 확인
-- 3. 파일 업로드 테스트
-- ========================================
-- ================================================
-- 🚨 긴급 상용화 배포용 수정 스크립트 (에러 수정됨)
-- GROUP BY 에러 해결 버전
-- ================================================

-- ================================================
-- 1. 기존 관리자 계정 추가 (중요!)
-- ================================================
INSERT INTO admins (username, password_hash, password, role, email, is_active) 
VALUES 
  ('martin18', '0601', '0601', 'super_admin', 'martin18@megacopy.shop', true),
  ('mega', '0601', '0601', 'super_admin', 'mega@megacopy.shop', true)
ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  password = EXCLUDED.password,
  is_active = true;

-- ================================================
-- 2. 테스트 데이터 삭제
-- ================================================
DELETE FROM products 
WHERE name IN (
  'Samsung Galaxy S24 Ultra',
  'Apple MacBook Pro 16"',
  'Sony WH-1000XM5',
  'LG OLED TV 65"',
  'Dyson V15'
);

-- ================================================
-- 3. Storage 버킷 설정 (이미지 업로드용)
-- ================================================

-- 버킷을 public으로 설정
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- 버킷이 없으면 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 5242880;

-- 기존 Storage 정책 삭제
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- 새로운 Storage 정책 생성 (공개 업로드/조회 허용)
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Allow public delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images');

-- ================================================
-- 4. 관리자 로그인 함수 수정 (두 형식 모두 지원)
-- ================================================
DROP FUNCTION IF EXISTS admin_login CASCADE;

CREATE OR REPLACE FUNCTION admin_login(
  username_input TEXT,
  password_input TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- password 또는 password_hash 둘 다 확인
  SELECT * INTO admin_record
  FROM admins
  WHERE username = username_input
    AND (password = password_input OR password_hash = password_input)
    AND is_active = true;
  
  IF admin_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;
  
  -- 로그인 시간 업데이트
  UPDATE admins 
  SET last_login = NOW()
  WHERE id = admin_record.id;
  
  -- 성공 응답
  RETURN json_build_object(
    'success', true,
    'admin', json_build_object(
      'id', admin_record.id,
      'username', admin_record.username,
      'email', admin_record.email,
      'role', admin_record.role
    ),
    'token', encode(gen_random_bytes(32), 'hex')
  );
END;
$$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION admin_login TO anon;

-- ================================================
-- 5. 상태 확인 (GROUP BY 에러 수정)
-- ================================================

-- 관리자 계정 확인
SELECT 
  '✅ 관리자 계정' as item,
  COUNT(*)::TEXT as count,
  string_agg(username, ', ') as details
FROM admins 
WHERE is_active = true;

-- 활성 상품 확인
SELECT 
  '✅ 활성 상품' as item,
  COUNT(*)::TEXT as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '상품을 등록해주세요'
    ELSE COUNT(*)::TEXT || '개 상품'
  END as details
FROM products 
WHERE is_active = true;

-- Storage 버킷 확인 (서브쿼리 사용으로 GROUP BY 에러 해결)
SELECT 
  '✅ Storage 버킷' as item,
  '1' as count,
  'product-images 버킷 ' || 
  CASE 
    WHEN (SELECT public FROM storage.buckets WHERE id = 'product-images' LIMIT 1) 
    THEN '공개' 
    ELSE '비공개' 
  END as details;

-- ================================================
-- 완료 메시지
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ 상용화 배포 준비 완료!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📌 관리자 계정:';
  RAISE NOTICE '   - martin18 / 0601 (메인)';
  RAISE NOTICE '   - mega / 0601 (메인)';
  RAISE NOTICE '   - admin / admin123 (메인)';
  RAISE NOTICE '';
  RAISE NOTICE '📌 다음 단계:';
  RAISE NOTICE '   1. Cloudflare Pages 재배포';
  RAISE NOTICE '   2. 관리자 페이지에서 로그인 테스트';
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
END $$;
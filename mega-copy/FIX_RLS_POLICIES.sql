-- ========================================
-- RLS 정책 및 테이블 권한 설정
-- ========================================

-- 1. products 테이블에 additional_images 컬럼 확인/추가
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;

-- 2. RLS 비활성화 (임시)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. 테이블 권한 부여
GRANT ALL ON products TO anon;
GRANT ALL ON products TO authenticated;
GRANT SELECT ON products TO anon;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

-- 4. RLS 정책 삭제 (기존 정책 제거)
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;
DROP POLICY IF EXISTS "Public read access" ON products;
DROP POLICY IF EXISTS "Authenticated write access" ON products;

-- 5. 새로운 RLS 정책 생성
-- 읽기: 모든 사용자 허용
CREATE POLICY "Allow public read"
ON products FOR SELECT
TO public
USING (true);

-- 쓰기: 모든 사용자 허용 (개발 환경용 - 프로덕션에서는 수정 필요)
CREATE POLICY "Allow public insert"
ON products FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update"
ON products FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete"
ON products FOR DELETE
TO public
USING (true);

-- 6. RLS 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 7. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 8. 확인
SELECT 'RLS policies and permissions set successfully!' as message;
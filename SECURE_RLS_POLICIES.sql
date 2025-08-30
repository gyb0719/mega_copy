-- ========================================
-- 보안 강화된 RLS 정책 설정
-- ========================================

-- 1. 기존 정책 모두 제거
DROP POLICY IF EXISTS "Allow public read" ON products;
DROP POLICY IF EXISTS "Allow public insert" ON products;
DROP POLICY IF EXISTS "Allow public update" ON products;
DROP POLICY IF EXISTS "Allow public delete" ON products;

-- 2. products 테이블 - 읽기 전용 공개, 쓰기는 인증 필요
CREATE POLICY "Public can read products"
ON products FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Only authenticated can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated can update products"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Only authenticated can delete products"
ON products FOR DELETE
TO authenticated
USING (true);

-- 3. product_images 테이블 RLS 설정
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read product_images" ON product_images;
DROP POLICY IF EXISTS "Only authenticated can manage product_images" ON product_images;

CREATE POLICY "Public can read product_images"
ON product_images FOR SELECT
TO public
USING (true);

CREATE POLICY "Only authenticated can insert product_images"
ON product_images FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated can update product_images"
ON product_images FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Only authenticated can delete product_images"
ON product_images FOR DELETE
TO authenticated
USING (true);

-- 4. admins 테이블 RLS 설정 (매우 제한적)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins table access" ON admins;

-- admins 테이블은 service role만 접근 가능
CREATE POLICY "No public access to admins"
ON admins FOR ALL
TO public
USING (false);

-- 5. notices 테이블 RLS 설정
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active notices" ON notices;
DROP POLICY IF EXISTS "Only authenticated can manage notices" ON notices;

CREATE POLICY "Public can read active notices"
ON notices FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Only authenticated can insert notices"
ON notices FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated can update notices"
ON notices FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Only authenticated can delete notices"
ON notices FOR DELETE
TO authenticated
USING (true);

-- 6. 새로운 세션 테이블 생성 (관리자 세션 관리용)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 세션 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- 세션 테이블 RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to sessions"
ON admin_sessions FOR ALL
TO public
USING (false);

-- 7. 권한 확인
GRANT SELECT ON products TO anon;
GRANT SELECT ON product_images TO anon;
GRANT SELECT ON notices TO anon;

GRANT ALL ON products TO authenticated;
GRANT ALL ON product_images TO authenticated;
GRANT ALL ON notices TO authenticated;

-- admins와 admin_sessions는 service role만 접근
REVOKE ALL ON admins FROM anon;
REVOKE ALL ON admins FROM authenticated;
REVOKE ALL ON admin_sessions FROM anon;
REVOKE ALL ON admin_sessions FROM authenticated;

-- 8. 확인 메시지
SELECT 'Secure RLS policies applied successfully!' as message;
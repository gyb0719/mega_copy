-- ========================================
-- 보안 강화된 RLS 정책 설정 (테이블 생성 포함)
-- ========================================

-- 1. notices 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. admin_sessions 테이블 생성 (관리자 세션 관리용)
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

-- 3. admins 테이블에 role 컬럼 추가 (없는 경우)
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';

-- ========================================
-- RLS 정책 설정
-- ========================================

-- 1. products 테이블 정책
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "Allow public read" ON products;
DROP POLICY IF EXISTS "Allow public insert" ON products;
DROP POLICY IF EXISTS "Allow public update" ON products;
DROP POLICY IF EXISTS "Allow public delete" ON products;
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Only authenticated can insert products" ON products;
DROP POLICY IF EXISTS "Only authenticated can update products" ON products;
DROP POLICY IF EXISTS "Only authenticated can delete products" ON products;

-- 새 정책 생성
CREATE POLICY "Public can read active products"
ON products FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Authenticated can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update products"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete products"
ON products FOR DELETE
TO authenticated
USING (true);

-- 2. product_images 테이블 정책
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "Public can read product_images" ON product_images;
DROP POLICY IF EXISTS "Only authenticated can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Only authenticated can update product_images" ON product_images;
DROP POLICY IF EXISTS "Only authenticated can delete product_images" ON product_images;

-- 새 정책 생성
CREATE POLICY "Public can view product images"
ON product_images FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated can add product images"
ON product_images FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can modify product images"
ON product_images FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can remove product images"
ON product_images FOR DELETE
TO authenticated
USING (true);

-- 3. admins 테이블 정책
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "Admins table access" ON admins;
DROP POLICY IF EXISTS "No public access to admins" ON admins;

-- admins 테이블은 아무도 직접 접근 불가 (service role만)
CREATE POLICY "Admins restricted access"
ON admins FOR ALL
TO public
USING (false);

-- 4. notices 테이블 정책
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "Public can read active notices" ON notices;
DROP POLICY IF EXISTS "Only authenticated can insert notices" ON notices;
DROP POLICY IF EXISTS "Only authenticated can update notices" ON notices;
DROP POLICY IF EXISTS "Only authenticated can delete notices" ON notices;

-- 새 정책 생성
CREATE POLICY "Public can view active notices"
ON notices FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Authenticated can create notices"
ON notices FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can edit notices"
ON notices FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can remove notices"
ON notices FOR DELETE
TO authenticated
USING (true);

-- 5. admin_sessions 테이블 정책
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- 세션은 아무도 직접 접근 불가
CREATE POLICY "Sessions restricted access"
ON admin_sessions FOR ALL
TO public
USING (false);

-- ========================================
-- 권한 설정
-- ========================================

-- Public (anon) 권한
GRANT SELECT ON products TO anon;
GRANT SELECT ON product_images TO anon;
GRANT SELECT ON notices TO anon;

-- Authenticated 권한
GRANT ALL ON products TO authenticated;
GRANT ALL ON product_images TO authenticated;
GRANT ALL ON notices TO authenticated;

-- admins와 admin_sessions는 권한 제거
REVOKE ALL ON admins FROM anon;
REVOKE ALL ON admins FROM authenticated;
REVOKE ALL ON admin_sessions FROM anon;
REVOKE ALL ON admin_sessions FROM authenticated;

-- ========================================
-- 샘플 관리자 계정 생성
-- ========================================

-- 비밀번호는 SHA256으로 해싱해야 함
-- admin123의 SHA256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- 실제 운영시에는 반드시 변경하세요!

INSERT INTO admins (username, password_hash, role)
VALUES 
    ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'main'),
    ('manager', '6ee4a469cd4e91053847f5d3fcb61dbcc91e8f0ef10be7748da4c4a1ba382d17', 'main')
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- ========================================
-- 확인 메시지
-- ========================================
SELECT 'Secure RLS policies and tables created successfully!' as message;
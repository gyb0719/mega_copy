-- ========================================
-- admins 테이블 체크 제약 확인 및 수정
-- ========================================

-- 1. 기존 체크 제약 확인 및 제거
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_role_check;

-- 2. role 컬럼이 없다면 추가, 있다면 타입 변경
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'role') THEN
        ALTER TABLE admins ADD COLUMN role TEXT DEFAULT 'sub';
    END IF;
END $$;

-- 2-1. 기존 role 값들을 유효한 값으로 먼저 업데이트
UPDATE admins 
SET role = CASE 
    WHEN role IS NULL THEN 'sub'
    WHEN role NOT IN ('main', 'sub', 'admin') THEN 'sub'
    ELSE role
END;

-- 3. 새로운 체크 제약 추가 (main, sub 허용)
ALTER TABLE admins 
ADD CONSTRAINT admins_role_check 
CHECK (role IN ('main', 'sub', 'admin'));

-- 4. notices 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. admin_sessions 테이블 생성 (관리자 세션 관리용)
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

-- ========================================
-- RLS 정책 설정
-- ========================================

-- 1. products 테이블 정책
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 기존 정책 모두 제거
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public read" ON products;
    DROP POLICY IF EXISTS "Allow public insert" ON products;
    DROP POLICY IF EXISTS "Allow public update" ON products;
    DROP POLICY IF EXISTS "Allow public delete" ON products;
    DROP POLICY IF EXISTS "Public can read products" ON products;
    DROP POLICY IF EXISTS "Public can read active products" ON products;
    DROP POLICY IF EXISTS "Only authenticated can insert products" ON products;
    DROP POLICY IF EXISTS "Only authenticated can update products" ON products;
    DROP POLICY IF EXISTS "Only authenticated can delete products" ON products;
    DROP POLICY IF EXISTS "Authenticated can insert products" ON products;
    DROP POLICY IF EXISTS "Authenticated can update products" ON products;
    DROP POLICY IF EXISTS "Authenticated can delete products" ON products;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 새 정책 생성
CREATE POLICY "Anyone can read active products"
ON products FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Auth users can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Auth users can update products"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Auth users can delete products"
ON products FOR DELETE
TO authenticated
USING (true);

-- 2. product_images 테이블 정책
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public can read product_images" ON product_images;
    DROP POLICY IF EXISTS "Public can view product images" ON product_images;
    DROP POLICY IF EXISTS "Only authenticated can insert product_images" ON product_images;
    DROP POLICY IF EXISTS "Only authenticated can update product_images" ON product_images;
    DROP POLICY IF EXISTS "Only authenticated can delete product_images" ON product_images;
    DROP POLICY IF EXISTS "Authenticated can add product images" ON product_images;
    DROP POLICY IF EXISTS "Authenticated can modify product images" ON product_images;
    DROP POLICY IF EXISTS "Authenticated can remove product images" ON product_images;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 새 정책 생성
CREATE POLICY "Anyone can view images"
ON product_images FOR SELECT
TO public
USING (true);

CREATE POLICY "Auth users can add images"
ON product_images FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Auth users can modify images"
ON product_images FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Auth users can remove images"
ON product_images FOR DELETE
TO authenticated
USING (true);

-- 3. admins 테이블 정책
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "Admins table access" ON admins;
DROP POLICY IF EXISTS "No public access to admins" ON admins;
DROP POLICY IF EXISTS "Admins restricted access" ON admins;

-- admins 테이블은 완전 제한
CREATE POLICY "No direct access to admins"
ON admins FOR ALL
TO public
USING (false);

-- 4. notices 테이블 정책
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public can read active notices" ON notices;
    DROP POLICY IF EXISTS "Public can view active notices" ON notices;
    DROP POLICY IF EXISTS "Only authenticated can insert notices" ON notices;
    DROP POLICY IF EXISTS "Only authenticated can update notices" ON notices;
    DROP POLICY IF EXISTS "Only authenticated can delete notices" ON notices;
    DROP POLICY IF EXISTS "Authenticated can create notices" ON notices;
    DROP POLICY IF EXISTS "Authenticated can edit notices" ON notices;
    DROP POLICY IF EXISTS "Authenticated can remove notices" ON notices;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 새 정책 생성
CREATE POLICY "Anyone can see active notices"
ON notices FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Auth users can create notices"
ON notices FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Auth users can edit notices"
ON notices FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Auth users can delete notices"
ON notices FOR DELETE
TO authenticated
USING (true);

-- 5. admin_sessions 테이블 정책
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sessions restricted access" ON admin_sessions;

-- 세션은 완전 제한
CREATE POLICY "No direct session access"
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
-- 관리자 계정 업데이트/생성
-- ========================================

-- 기존 관리자 계정 업데이트 또는 새로 생성
-- admin123의 SHA256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- manager123의 SHA256: 6ee4a469cd4e91053847f5d3fcb61dbcc91e8f0ef10be7748da4c4a1ba382d17

-- admin 계정
INSERT INTO admins (username, password_hash, role)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'main')
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- manager 계정
INSERT INTO admins (username, password_hash, role)
VALUES ('manager', '6ee4a469cd4e91053847f5d3fcb61dbcc91e8f0ef10be7748da4c4a1ba382d17', 'main')
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- ========================================
-- 확인
-- ========================================
SELECT 
    'Setup completed successfully!' as status,
    COUNT(*) as admin_count 
FROM admins 
WHERE username IN ('admin', 'manager');
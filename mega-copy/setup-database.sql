-- ========================================
-- MEGA-COPY 데이터베이스 초기 설정
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. Products 테이블 생성
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  stock INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Admins 테이블 생성
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders 테이블 생성
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Storage Buckets 생성
-- ----------------------------------------
-- Supabase Dashboard > Storage에서 수동으로 생성하거나 아래 실행
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. RLS (Row Level Security) 정책 설정
-- ----------------------------------------

-- Products 테이블 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 상품을 읽을 수 있음
CREATE POLICY "Public can read products" 
  ON products FOR SELECT 
  USING (true);

-- anon 사용자도 상품을 추가할 수 있음 (테스트용)
CREATE POLICY "Anon can insert products" 
  ON products FOR INSERT 
  WITH CHECK (true);

-- anon 사용자도 상품을 수정할 수 있음 (테스트용)
CREATE POLICY "Anon can update products" 
  ON products FOR UPDATE 
  USING (true);

-- anon 사용자도 상품을 삭제할 수 있음 (테스트용)
CREATE POLICY "Anon can delete products" 
  ON products FOR DELETE 
  USING (true);

-- Orders 테이블 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read orders" 
  ON orders FOR SELECT 
  USING (true);

CREATE POLICY "Public can insert orders" 
  ON orders FOR INSERT 
  WITH CHECK (true);

-- Admins 테이블 RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins are viewable by everyone" 
  ON admins FOR SELECT 
  USING (true);

-- 6. 기본 관리자 계정 생성
-- ----------------------------------------
INSERT INTO admins (username, password, role) 
VALUES ('admin', 'admin123', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- 7. 샘플 데이터 추가 (선택사항)
-- ----------------------------------------
INSERT INTO products (name, price, description, category, stock, image_url) VALUES
  ('루이비통 반지갑', 850000, '모노그램 캔버스 소재의 클래식한 반지갑', '지갑', 3, null),
  ('구찌 벨트', 650000, 'GG 버클이 돋보이는 시그니처 벨트', '벨트', 5, null),
  ('샤넬 선글라스', 520000, '엘레강트한 캣아이 프레임', '안경/선글라스', 2, null),
  ('에르메스 스카프', 450000, '실크 100% 프린트 스카프', '숄/머플러', 4, null),
  ('프라다 크로스백', 1200000, '사피아노 가죽 미니 크로스백', '가방', 2, null)
ON CONFLICT DO NOTHING;

-- 8. RPC 함수들 생성
-- ----------------------------------------
-- 이제 database-functions.sql 파일의 내용을 실행하세요!

-- 실행 완료 메시지
SELECT 'Database setup completed successfully!' as message;
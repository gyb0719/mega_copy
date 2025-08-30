-- ================================================
-- MEGA-COPY 완전 수정 스크립트
-- 모든 문제를 한 번에 해결
-- ================================================
-- 실행 순서가 중요합니다! 순서대로 실행하세요
-- ================================================

-- ================================================
-- STEP 1: 기존 오류 정리
-- ================================================

-- RLS 정책 초기화
DROP POLICY IF EXISTS "Public can read active products" ON products;
DROP POLICY IF EXISTS "Anon can insert products" ON products;
DROP POLICY IF EXISTS "Anon can update products" ON products;
DROP POLICY IF EXISTS "Anon can delete products" ON products;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can read own orders" ON orders;

-- ================================================
-- STEP 2: 테이블 점검 및 수정
-- ================================================

-- Products 테이블 확인 (없으면 생성)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(12,2),
  description TEXT,
  category TEXT,
  image_url TEXT,
  additional_images TEXT[],
  stock INT DEFAULT 0 CHECK (stock >= 0),
  sku TEXT UNIQUE,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INT DEFAULT 0,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders 테이블 확인
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  billing_address TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  shipping_fee DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins 테이블 확인
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- STEP 3: RLS 정책 재설정 (완전 개방 - 테스트용)
-- ================================================

-- Products 테이블 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read products" 
  ON products FOR SELECT 
  USING (true);

-- 모든 사용자가 추가 가능 (테스트용)
CREATE POLICY "Anyone can insert products" 
  ON products FOR INSERT 
  WITH CHECK (true);

-- 모든 사용자가 수정 가능 (테스트용)
CREATE POLICY "Anyone can update products" 
  ON products FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- 모든 사용자가 삭제 가능 (테스트용)
CREATE POLICY "Anyone can delete products" 
  ON products FOR DELETE 
  USING (true);

-- Orders 테이블 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders" 
  ON orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can read orders" 
  ON orders FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can update orders" 
  ON orders FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Admins 테이블 RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Anyone can read admins" ON admins;

CREATE POLICY "Anyone can read admins" 
  ON admins FOR SELECT 
  USING (true);

-- ================================================
-- STEP 4: RPC 함수 재생성 (간소화 버전)
-- ================================================

-- 상품 추가 함수 (간소화)
DROP FUNCTION IF EXISTS add_product CASCADE;
CREATE OR REPLACE FUNCTION add_product(
  product_name TEXT,
  product_price DECIMAL,
  product_description TEXT DEFAULT '',
  product_category TEXT DEFAULT '',
  product_image_url TEXT DEFAULT '',
  product_stock INT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- 중요: 함수 실행자 권한으로 실행
AS $$
DECLARE
  new_product_id UUID;
  result JSON;
BEGIN
  -- 상품 추가
  INSERT INTO products (
    name, 
    price, 
    description, 
    category, 
    image_url, 
    stock
  )
  VALUES (
    product_name, 
    product_price, 
    product_description, 
    product_category, 
    product_image_url, 
    product_stock
  )
  RETURNING id INTO new_product_id;
  
  -- 결과 반환
  SELECT json_build_object(
    'success', true,
    'id', id,
    'name', name,
    'price', price,
    'category', category,
    'image_url', image_url,
    'created_at', created_at
  ) INTO result
  FROM products WHERE id = new_product_id;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 상품 조회 함수 (간소화)
DROP FUNCTION IF EXISTS get_products CASCADE;
CREATE OR REPLACE FUNCTION get_products(
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'data', COALESCE(json_agg(row_to_json(p)), '[]'::json),
    'count', COUNT(*) OVER()
  ) INTO result
  FROM (
    SELECT 
      id,
      name,
      brand,
      price,
      description,
      category,
      image_url,
      stock,
      created_at
    FROM products
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count
  ) p;
  
  RETURN COALESCE(result, json_build_object('data', '[]'::json, 'count', 0));
END;
$$;

-- 상품 수정 함수 (간소화)
DROP FUNCTION IF EXISTS update_product CASCADE;
CREATE OR REPLACE FUNCTION update_product(
  product_id UUID,
  product_data JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE products
  SET 
    name = COALESCE((product_data->>'name')::TEXT, name),
    price = COALESCE((product_data->>'price')::DECIMAL, price),
    description = COALESCE((product_data->>'description')::TEXT, description),
    category = COALESCE((product_data->>'category')::TEXT, category),
    image_url = COALESCE((product_data->>'image_url')::TEXT, image_url),
    stock = COALESCE((product_data->>'stock')::INT, stock),
    updated_at = NOW()
  WHERE id = product_id;
  
  SELECT json_build_object(
    'success', true,
    'id', id,
    'name', name,
    'updated_at', updated_at
  ) INTO result
  FROM products WHERE id = product_id;
  
  RETURN COALESCE(result, json_build_object('success', false, 'error', 'Product not found'));
END;
$$;

-- 상품 삭제 함수 (간소화)
DROP FUNCTION IF EXISTS delete_product CASCADE;
CREATE OR REPLACE FUNCTION delete_product(product_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products 
  SET is_active = false 
  WHERE id = product_id;
  
  RETURN json_build_object('success', true, 'id', product_id);
END;
$$;

-- ================================================
-- STEP 5: Storage 버킷 SQL 설정
-- ================================================
-- 주의: Storage 버킷은 Supabase Dashboard에서 수동으로 생성해야 합니다!
-- 아래는 참고용 SQL입니다.

-- Storage 정책 확인 쿼리
-- SELECT * FROM storage.buckets;
-- SELECT * FROM storage.objects;

-- ================================================
-- STEP 6: 관리자 계정 생성
-- ================================================

INSERT INTO admins (username, password, role) 
VALUES 
  ('admin', 'admin123', 'super_admin'),
  ('test', 'test123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- ================================================
-- STEP 7: 테스트 데이터 삽입
-- ================================================

-- 테스트용 상품 1개 추가
INSERT INTO products (name, price, description, category, stock) 
VALUES ('테스트 상품', 10000, '테스트용 상품입니다', '테스트', 100)
ON CONFLICT DO NOTHING;

-- ================================================
-- STEP 8: 권한 부여 (중요!)
-- ================================================

-- anon과 authenticated 역할에 필요한 권한 부여
GRANT ALL ON products TO anon;
GRANT ALL ON orders TO anon;
GRANT ALL ON admins TO anon;
GRANT EXECUTE ON FUNCTION add_product TO anon;
GRANT EXECUTE ON FUNCTION get_products TO anon;
GRANT EXECUTE ON FUNCTION update_product TO anon;
GRANT EXECUTE ON FUNCTION delete_product TO anon;

-- ================================================
-- STEP 9: 검증 쿼리
-- ================================================

-- 테이블 확인
SELECT 
  'Tables Check' as check_type,
  COUNT(*) as table_count,
  string_agg(table_name, ', ') as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'orders', 'admins');

-- RPC 함수 확인
SELECT 
  'Functions Check' as check_type,
  COUNT(*) as function_count,
  string_agg(proname, ', ') as functions
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('add_product', 'get_products', 'update_product', 'delete_product');

-- RLS 정책 확인
SELECT 
  'RLS Policies Check' as check_type,
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename;

-- 최종 테스트: 상품 추가 함수 실행
SELECT add_product(
  '최종 테스트 상품',
  99999,
  '이 상품이 보이면 성공입니다',
  '테스트',
  '',
  10
);

-- ================================================
-- 완료 메시지
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ 모든 설정이 완료되었습니다!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '다음을 확인하세요:';
  RAISE NOTICE '1. 테이블 생성 완료';
  RAISE NOTICE '2. RLS 정책 설정 완료 (개방형)';
  RAISE NOTICE '3. RPC 함수 생성 완료';
  RAISE NOTICE '4. 권한 부여 완료';
  RAISE NOTICE '================================================';
  RAISE NOTICE '⚠️ Storage 버킷 설정:';
  RAISE NOTICE '1. Supabase Dashboard > Storage';
  RAISE NOTICE '2. New bucket 클릭';
  RAISE NOTICE '3. Name: product-images';
  RAISE NOTICE '4. Public bucket: ON';
  RAISE NOTICE '5. Create 클릭';
  RAISE NOTICE '================================================';
END $$;
-- ================================================
-- MEGA-COPY 최종 설정 스크립트
-- admins 테이블 정리 후 실행
-- ================================================

-- ================================================
-- STEP 1: 기존 정책 모두 정리
-- ================================================

-- Products 정책 정리
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

-- Orders 정책 정리
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;

-- ================================================
-- STEP 2: Products 테이블 및 정책
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

-- Products RLS 설정
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert products" 
  ON products FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update products" 
  ON products FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete products" 
  ON products FOR DELETE 
  USING (true);

-- ================================================
-- STEP 3: Orders 테이블 및 정책
-- ================================================

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

-- Orders RLS 설정
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

-- ================================================
-- STEP 4: RPC 함수들
-- ================================================

-- 상품 추가 함수
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
SECURITY DEFINER
AS $$
DECLARE
  new_product_id UUID;
  result JSON;
BEGIN
  INSERT INTO products (
    name, price, description, category, image_url, stock
  )
  VALUES (
    product_name, product_price, product_description, 
    product_category, product_image_url, product_stock
  )
  RETURNING id INTO new_product_id;
  
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

-- 상품 조회 함수
DROP FUNCTION IF EXISTS get_products CASCADE;
CREATE OR REPLACE FUNCTION get_products(
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0,
  search_query TEXT DEFAULT '',
  category_filter TEXT DEFAULT ''
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
      id, name, brand, price, description, 
      category, image_url, stock, created_at
    FROM products
    WHERE is_active = true
      AND (search_query = '' OR name ILIKE '%' || search_query || '%')
      AND (category_filter = '' OR category = category_filter)
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count
  ) p;
  
  RETURN COALESCE(result, json_build_object('data', '[]'::json, 'count', 0));
END;
$$;

-- 상품 ID로 조회
DROP FUNCTION IF EXISTS get_product_by_id CASCADE;
CREATE OR REPLACE FUNCTION get_product_by_id(product_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT row_to_json(p) INTO result
  FROM products p
  WHERE id = product_id AND is_active = true;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- 상품 수정 함수
DROP FUNCTION IF EXISTS update_product CASCADE;
CREATE OR REPLACE FUNCTION update_product(
  product_id UUID,
  product_data JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  
  RETURN json_build_object(
    'success', true,
    'id', product_id
  );
END;
$$;

-- 상품 삭제 함수
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

-- 카테고리 목록
DROP FUNCTION IF EXISTS get_categories CASCADE;
CREATE OR REPLACE FUNCTION get_categories()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(DISTINCT category) INTO result
  FROM products
  WHERE category IS NOT NULL AND is_active = true;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ================================================
-- STEP 5: 권한 부여
-- ================================================

GRANT ALL ON products TO anon;
GRANT ALL ON orders TO anon;
GRANT EXECUTE ON FUNCTION add_product TO anon;
GRANT EXECUTE ON FUNCTION get_products TO anon;
GRANT EXECUTE ON FUNCTION get_product_by_id TO anon;
GRANT EXECUTE ON FUNCTION update_product TO anon;
GRANT EXECUTE ON FUNCTION delete_product TO anon;
GRANT EXECUTE ON FUNCTION get_categories TO anon;

-- ================================================
-- STEP 6: 테스트 데이터
-- ================================================

-- 테스트 상품 추가
INSERT INTO products (name, price, description, category, stock) 
VALUES 
  ('테스트 노트북', 1500000, '고성능 노트북', '전자제품', 10),
  ('테스트 마우스', 30000, '무선 마우스', '액세서리', 50),
  ('테스트 키보드', 80000, '기계식 키보드', '액세서리', 30)
ON CONFLICT DO NOTHING;

-- ================================================
-- STEP 7: 검증
-- ================================================

-- 테이블 확인
SELECT 
  'Tables' as check_type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'orders', 'admins');

-- RPC 함수 확인
SELECT 
  'Functions' as check_type,
  COUNT(*) as count
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname LIKE '%product%';

-- 테스트 상품 조회
SELECT get_products(10, 0, '', '');

-- ================================================
-- 완료 메시지
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '================================';
  RAISE NOTICE '✅ 설정 완료!';
  RAISE NOTICE '================================';
  RAISE NOTICE '다음 단계:';
  RAISE NOTICE '1. Storage 버킷 생성 (Dashboard)';
  RAISE NOTICE '2. 버킷명: product-images';
  RAISE NOTICE '3. Public 설정: ON';
  RAISE NOTICE '================================';
END $$;
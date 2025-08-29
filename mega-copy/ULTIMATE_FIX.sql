-- ================================================
-- MEGA-COPY 최종 해결 스크립트
-- GROUP BY 오류 및 모든 문제 해결
-- ================================================

-- ================================================
-- STEP 1: 완전 초기화
-- ================================================

-- 기존 함수 모두 삭제
DROP FUNCTION IF EXISTS add_product CASCADE;
DROP FUNCTION IF EXISTS get_products CASCADE;
DROP FUNCTION IF EXISTS get_product_by_id CASCADE;
DROP FUNCTION IF EXISTS update_product CASCADE;
DROP FUNCTION IF EXISTS delete_product CASCADE;
DROP FUNCTION IF EXISTS search_products CASCADE;
DROP FUNCTION IF EXISTS get_categories CASCADE;

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

-- ================================================
-- STEP 2: products 테이블 재생성
-- ================================================

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(12,2),
  description TEXT,
  category TEXT,
  image_url TEXT,  -- 단순 TEXT로 유지
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

-- ================================================
-- STEP 3: RLS 정책 설정
-- ================================================

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
-- STEP 4: RPC 함수 생성 (올바른 구조)
-- ================================================

-- 4-1. 상품 추가 (간단 버전)
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
BEGIN
  INSERT INTO products (
    name, price, description, category, image_url, stock
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
  
  RETURN json_build_object(
    'success', true,
    'id', new_product_id,
    'name', product_name,
    'price', product_price
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 4-2. 상품 조회 (GROUP BY 오류 수정)
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
  result_data JSON;
  total_count INT;
BEGIN
  -- 먼저 총 개수 계산
  SELECT COUNT(*) INTO total_count
  FROM products
  WHERE is_active = true
    AND (search_query = '' OR name ILIKE '%' || search_query || '%')
    AND (category_filter = '' OR category = category_filter);
  
  -- 데이터 조회 (서브쿼리 사용)
  WITH filtered_products AS (
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
      AND (search_query = '' OR name ILIKE '%' || search_query || '%')
      AND (category_filter = '' OR category = category_filter)
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count
  )
  SELECT COALESCE(json_agg(row_to_json(filtered_products)), '[]'::json)
  INTO result_data
  FROM filtered_products;
  
  RETURN json_build_object(
    'data', result_data,
    'count', total_count
  );
END;
$$;

-- 4-3. 상품 ID로 조회 (간단 버전)
CREATE OR REPLACE FUNCTION get_product_by_id(product_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT row_to_json(p) INTO result
  FROM (
    SELECT 
      id, name, brand, price, description, 
      category, image_url, stock, is_featured,
      is_active, created_at, updated_at
    FROM products
    WHERE id = product_id AND is_active = true
  ) p;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- 4-4. 상품 수정 (간단 버전)
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
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'id', product_id
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Product not found'
    );
  END IF;
END;
$$;

-- 4-5. 상품 삭제 (간단 버전)
CREATE OR REPLACE FUNCTION delete_product(product_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products 
  SET is_active = false, updated_at = NOW()
  WHERE id = product_id;
  
  IF FOUND THEN
    RETURN json_build_object('success', true, 'id', product_id);
  ELSE
    RETURN json_build_object('success', false, 'error', 'Product not found');
  END IF;
END;
$$;

-- 4-6. 카테고리 목록 (간단 버전)
CREATE OR REPLACE FUNCTION get_categories()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT COALESCE(json_agg(DISTINCT category), '[]'::json) INTO result
  FROM products
  WHERE category IS NOT NULL AND category != '' AND is_active = true;
  
  RETURN result;
END;
$$;

-- 4-7. 상품 검색 (고급)
CREATE OR REPLACE FUNCTION search_products(
  search_term TEXT DEFAULT '',
  search_category TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  in_stock_only BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH filtered AS (
    SELECT 
      id, name, brand, price, description, 
      category, image_url, stock, created_at
    FROM products
    WHERE is_active = true
      AND (search_term = '' OR (
        name ILIKE '%' || search_term || '%' OR
        description ILIKE '%' || search_term || '%' OR
        brand ILIKE '%' || search_term || '%'
      ))
      AND (search_category IS NULL OR category = search_category)
      AND (min_price IS NULL OR price >= min_price)
      AND (max_price IS NULL OR price <= max_price)
      AND (NOT in_stock_only OR stock > 0)
    ORDER BY created_at DESC
    LIMIT 100
  )
  SELECT COALESCE(json_agg(row_to_json(filtered)), '[]'::json)
  INTO result
  FROM filtered;
  
  RETURN result;
END;
$$;

-- ================================================
-- STEP 5: 권한 부여
-- ================================================

GRANT ALL ON products TO anon;
GRANT ALL ON products TO authenticated;
GRANT EXECUTE ON FUNCTION add_product TO anon;
GRANT EXECUTE ON FUNCTION get_products TO anon;
GRANT EXECUTE ON FUNCTION get_product_by_id TO anon;
GRANT EXECUTE ON FUNCTION update_product TO anon;
GRANT EXECUTE ON FUNCTION delete_product TO anon;
GRANT EXECUTE ON FUNCTION get_categories TO anon;
GRANT EXECUTE ON FUNCTION search_products TO anon;

-- ================================================
-- STEP 6: 테스트 데이터
-- ================================================

-- 기존 테스트 데이터 삭제
DELETE FROM products WHERE name LIKE '테스트%' OR name LIKE 'Test%';

-- 새 테스트 데이터 추가
INSERT INTO products (name, price, description, category, image_url, stock) 
VALUES 
  ('Samsung Galaxy S24 Ultra', 1599000, '최신 플래그십 스마트폰', '전자제품', 'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=Galaxy', 15),
  ('Apple MacBook Pro 16"', 3990000, 'M3 Max 칩셋 탑재', '전자제품', 'https://via.placeholder.com/300x300/00FF00/FFFFFF?text=MacBook', 8),
  ('Sony WH-1000XM5', 449000, '노이즈 캔슬링 헤드폰', '액세서리', 'https://via.placeholder.com/300x300/0000FF/FFFFFF?text=Sony', 25),
  ('LG OLED TV 65"', 2890000, '4K OLED 스마트 TV', '전자제품', 'https://via.placeholder.com/300x300/FFFF00/FFFFFF?text=LG-TV', 5),
  ('Dyson V15', 899000, '무선 청소기', '가전제품', 'https://via.placeholder.com/300x300/FF00FF/FFFFFF?text=Dyson', 12);

-- ================================================
-- STEP 7: 테스트 및 검증
-- ================================================

-- 함수 테스트
DO $$
DECLARE
  test_result JSON;
BEGIN
  -- get_products 테스트
  SELECT get_products(10, 0, '', '') INTO test_result;
  RAISE NOTICE 'get_products 결과: %', test_result;
  
  -- get_categories 테스트
  SELECT get_categories() INTO test_result;
  RAISE NOTICE 'get_categories 결과: %', test_result;
  
  RAISE NOTICE '================================';
  RAISE NOTICE '✅ 모든 테스트 완료!';
  RAISE NOTICE '================================';
END $$;

-- 최종 확인
SELECT 
  'Products' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT category) as categories
FROM products
WHERE is_active = true;

-- ================================================
-- 완료 메시지
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '🎉 ULTIMATE FIX 완료!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ GROUP BY 오류 해결';
  RAISE NOTICE '✅ 모든 함수 재작성 완료';
  RAISE NOTICE '✅ 테스트 데이터 5개 추가';
  RAISE NOTICE '================================================';
  RAISE NOTICE '다음 단계:';
  RAISE NOTICE '1. Storage 버킷 설정 (product-images)';
  RAISE NOTICE '2. 웹사이트에서 상품 확인';
  RAISE NOTICE '3. 관리자 페이지에서 상품 등록 테스트';
  RAISE NOTICE '================================================';
END $$;
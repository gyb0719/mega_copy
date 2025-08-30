-- ================================================
-- 데이터베이스 현재 상태 분석 및 완전 재구성
-- ================================================

-- ================================================
-- STEP 1: 현재 상태 확인
-- ================================================

-- 1-1. products 테이블 구조 확인
SELECT 
  '=== PRODUCTS 테이블 현재 구조 ===' as info;
  
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 1-2. 기존 함수 확인
SELECT 
  '=== 현재 RPC 함수 목록 ===' as info;
  
SELECT proname 
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname LIKE '%product%';

-- ================================================
-- STEP 2: 완전 초기화 (주의: 모든 데이터 삭제)
-- ================================================

-- 2-1. 기존 함수 모두 삭제
DROP FUNCTION IF EXISTS add_product CASCADE;
DROP FUNCTION IF EXISTS get_products CASCADE;
DROP FUNCTION IF EXISTS get_product_by_id CASCADE;
DROP FUNCTION IF EXISTS update_product CASCADE;
DROP FUNCTION IF EXISTS delete_product CASCADE;
DROP FUNCTION IF EXISTS search_products CASCADE;
DROP FUNCTION IF EXISTS get_categories CASCADE;
DROP FUNCTION IF EXISTS create_order CASCADE;
DROP FUNCTION IF EXISTS get_orders CASCADE;
DROP FUNCTION IF EXISTS update_order_status CASCADE;
DROP FUNCTION IF EXISTS get_admin_stats CASCADE;

-- 2-2. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;
DROP POLICY IF EXISTS "Public can read active products" ON products;
DROP POLICY IF EXISTS "Anon can insert products" ON products;
DROP POLICY IF EXISTS "Anon can update products" ON products;
DROP POLICY IF EXISTS "Anon can delete products" ON products;

-- 2-3. products 테이블 재생성
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(12,2),
  description TEXT,
  category TEXT,
  images TEXT[],  -- image_url 대신 images 배열 사용
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

-- 첫 번째 이미지를 위한 계산 컬럼 추가
ALTER TABLE products 
ADD COLUMN image_url TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN images IS NOT NULL AND array_length(images, 1) > 0 
    THEN images[1] 
    ELSE NULL 
  END
) STORED;

-- ================================================
-- STEP 3: RLS 정책 재설정
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
-- STEP 4: RPC 함수 재생성 (새로운 스키마에 맞춤)
-- ================================================

-- 4-1. 상품 추가
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
  -- 이미지 URL을 배열로 변환
  INSERT INTO products (
    name, price, description, category, images, stock
  )
  VALUES (
    product_name, 
    product_price, 
    product_description, 
    product_category, 
    CASE 
      WHEN product_image_url != '' 
      THEN ARRAY[product_image_url] 
      ELSE NULL 
    END,
    product_stock
  )
  RETURNING id INTO new_product_id;
  
  SELECT json_build_object(
    'success', true,
    'id', id,
    'name', name,
    'price', price,
    'category', category,
    'image_url', image_url,  -- 계산된 컬럼
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

-- 4-2. 상품 조회
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
    'data', COALESCE(json_agg(
      json_build_object(
        'id', id,
        'name', name,
        'brand', brand,
        'price', price,
        'description', description,
        'category', category,
        'image_url', image_url,  -- 계산된 컬럼
        'images', images,
        'stock', stock,
        'created_at', created_at
      )
    ), '[]'::json),
    'count', COUNT(*)
  ) INTO result
  FROM products
  WHERE is_active = true
    AND (search_query = '' OR name ILIKE '%' || search_query || '%')
    AND (category_filter = '' OR category = category_filter)
  ORDER BY created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
  
  RETURN COALESCE(result, json_build_object('data', '[]'::json, 'count', 0));
END;
$$;

-- 4-3. 상품 ID로 조회
CREATE OR REPLACE FUNCTION get_product_by_id(product_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', id,
    'name', name,
    'brand', brand,
    'price', price,
    'description', description,
    'category', category,
    'image_url', image_url,
    'images', images,
    'stock', stock,
    'is_featured', is_featured,
    'is_active', is_active,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result
  FROM products
  WHERE id = product_id AND is_active = true;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- 4-4. 상품 수정
CREATE OR REPLACE FUNCTION update_product(
  product_id UUID,
  product_data JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  image_url_input TEXT;
  images_array TEXT[];
BEGIN
  -- image_url을 images 배열로 변환
  image_url_input := product_data->>'image_url';
  
  IF image_url_input IS NOT NULL THEN
    images_array := ARRAY[image_url_input];
  END IF;
  
  UPDATE products
  SET 
    name = COALESCE((product_data->>'name')::TEXT, name),
    price = COALESCE((product_data->>'price')::DECIMAL, price),
    description = COALESCE((product_data->>'description')::TEXT, description),
    category = COALESCE((product_data->>'category')::TEXT, category),
    images = COALESCE(images_array, images),
    stock = COALESCE((product_data->>'stock')::INT, stock),
    updated_at = NOW()
  WHERE id = product_id;
  
  RETURN json_build_object(
    'success', true,
    'id', product_id
  );
END;
$$;

-- 4-5. 상품 삭제
CREATE OR REPLACE FUNCTION delete_product(product_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products 
  SET is_active = false, updated_at = NOW()
  WHERE id = product_id;
  
  RETURN json_build_object('success', true, 'id', product_id);
END;
$$;

-- 4-6. 카테고리 목록
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
GRANT ALL ON products TO authenticated;
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
SELECT add_product(
  '테스트 노트북',
  1500000,
  '고성능 게이밍 노트북',
  '전자제품',
  'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=Laptop',
  10
);

SELECT add_product(
  '무선 마우스',
  35000,
  '인체공학적 디자인',
  '액세서리',
  'https://via.placeholder.com/300x300/00FF00/FFFFFF?text=Mouse',
  50
);

SELECT add_product(
  '기계식 키보드',
  89000,
  'RGB 백라이트',
  '액세서리',
  'https://via.placeholder.com/300x300/0000FF/FFFFFF?text=Keyboard',
  30
);

-- ================================================
-- STEP 7: 최종 검증
-- ================================================

-- 테이블 구조 확인
SELECT 
  '=== 최종 PRODUCTS 테이블 구조 ===' as info;
  
SELECT 
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 함수 목록 확인
SELECT 
  '=== 생성된 함수 목록 ===' as info;
  
SELECT proname 
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname LIKE '%product%';

-- 테스트 조회
SELECT get_products(10, 0, '', '');

-- ================================================
-- 완료 메시지
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ 데이터베이스 재구성 완료!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '변경사항:';
  RAISE NOTICE '1. image_url 컬럼을 images 배열로 변경';
  RAISE NOTICE '2. image_url은 계산된 컬럼으로 자동 생성';
  RAISE NOTICE '3. 모든 RPC 함수 재작성';
  RAISE NOTICE '4. 테스트 데이터 3개 추가';
  RAISE NOTICE '================================================';
  RAISE NOTICE '다음 단계:';
  RAISE NOTICE '1. Storage 버킷 생성 (product-images)';
  RAISE NOTICE '2. 웹사이트에서 테스트';
  RAISE NOTICE '================================================';
END $$;
-- ========================================
-- 상품 등록 문제 디버깅 SQL
-- ========================================

-- 1. 현재 products 테이블 상태 확인
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_products
FROM products;

-- 2. 최근 등록된 상품 확인 (모든 상품, is_active 상관없이)
SELECT 
  id,
  name,
  price,
  category,
  is_active,
  created_at,
  image_url
FROM products
ORDER BY created_at DESC
LIMIT 10;

-- 3. get_products 함수 테스트
SELECT get_products(50, 0, '', '');

-- 4. add_product 함수 재생성 (is_active 기본값 true 확인)
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
  result_json JSON;
BEGIN
  -- 디버깅용 로그
  RAISE NOTICE '상품 추가 시작: %', product_name;
  
  INSERT INTO products (
    name, 
    price, 
    description, 
    category, 
    image_url, 
    stock,
    is_active  -- 명시적으로 true 설정
  )
  VALUES (
    product_name, 
    product_price, 
    product_description, 
    product_category, 
    product_image_url,
    product_stock,
    true  -- 반드시 활성 상태로
  )
  RETURNING id INTO new_product_id;
  
  -- 저장된 데이터 확인
  SELECT row_to_json(p) INTO result_json
  FROM (
    SELECT id, name, price, is_active, created_at
    FROM products
    WHERE id = new_product_id
  ) p;
  
  RAISE NOTICE '상품 추가 완료: %', result_json;
  
  RETURN json_build_object(
    'success', true,
    'id', new_product_id,
    'name', product_name,
    'price', product_price,
    'is_active', true,
    'debug', result_json
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '에러 발생: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 5. get_products 함수 재생성 (디버깅 추가)
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
  result_data JSON;
  total_count INT;
  active_count INT;
BEGIN
  -- 전체 상품 수 확인
  SELECT COUNT(*) INTO total_count FROM products;
  
  -- 활성 상품 수 확인
  SELECT COUNT(*) INTO active_count 
  FROM products 
  WHERE is_active = true;
  
  RAISE NOTICE '전체 상품: %, 활성 상품: %', total_count, active_count;
  
  -- 데이터 조회
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
      is_active,
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
  
  RAISE NOTICE '반환할 상품 수: %', json_array_length(result_data);
  
  -- 데이터와 개수 반환
  RETURN result_data;  -- 직접 데이터 배열만 반환
END;
$$;

-- 6. 권한 재설정
GRANT EXECUTE ON FUNCTION add_product TO anon;
GRANT EXECUTE ON FUNCTION get_products TO anon;

-- 7. 테스트: 샘플 상품 추가
SELECT add_product(
  '테스트 상품',
  10000,
  '테스트 설명',
  '테스트',
  'https://via.placeholder.com/300',
  10
);

-- 8. 다시 확인
SELECT COUNT(*) as total_products FROM products WHERE is_active = true;

-- 9. get_products 함수 테스트
SELECT get_products(10, 0, '', '');

-- ========================================
-- 확인 사항:
-- 1. products 테이블에 데이터가 있는지
-- 2. is_active가 true인지
-- 3. get_products 함수가 데이터를 반환하는지
-- ========================================
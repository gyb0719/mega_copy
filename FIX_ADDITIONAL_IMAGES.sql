-- ========================================
-- ADDITIONAL IMAGES 지원을 위한 SQL 수정
-- ========================================

-- 1. products 테이블에 additional_images 컬럼 추가 (이미 있으면 무시)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;

-- 2. add_product 함수 수정 - additional_images 매개변수 추가
CREATE OR REPLACE FUNCTION add_product(
    product_name TEXT,
    product_price NUMERIC,
    product_description TEXT DEFAULT '',
    product_category TEXT DEFAULT '',
    product_image_url TEXT DEFAULT '',
    product_stock INTEGER DEFAULT 0,
    product_additional_images JSONB DEFAULT '[]'::jsonb
)
RETURNS JSON AS $$
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
        stock,
        additional_images,
        is_active
    )
    VALUES (
        product_name, 
        product_price, 
        product_description, 
        product_category, 
        product_image_url, 
        product_stock,
        product_additional_images,
        true
    )
    RETURNING id INTO new_product_id;
    
    -- 결과 반환
    SELECT row_to_json(p) INTO result
    FROM products p
    WHERE p.id = new_product_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. get_product_by_id 함수 수정 - additional_images 포함
CREATE OR REPLACE FUNCTION get_product_by_id(product_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(p) INTO result
    FROM (
        SELECT 
            id,
            name,
            price,
            description,
            category,
            image_url,
            additional_images,
            stock,
            is_active,
            created_at,
            updated_at
        FROM products
        WHERE id = product_id
    ) p;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. get_products 함수 수정 - additional_images 포함
CREATE OR REPLACE FUNCTION get_products(
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    search_query TEXT DEFAULT '',
    category_filter TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    products_array JSON;
    total_count INTEGER;
BEGIN
    -- 상품 목록 조회
    SELECT json_agg(p) INTO products_array
    FROM (
        SELECT 
            id,
            name,
            price,
            description,
            category,
            image_url,
            additional_images,
            stock,
            is_active,
            created_at,
            updated_at
        FROM products
        WHERE is_active = true
        AND (search_query = '' OR 
             name ILIKE '%' || search_query || '%' OR 
             description ILIKE '%' || search_query || '%')
        AND (category_filter = '' OR category = category_filter)
        ORDER BY created_at DESC
        LIMIT limit_count
        OFFSET offset_count
    ) p;
    
    -- 전체 카운트
    SELECT COUNT(*) INTO total_count
    FROM products
    WHERE is_active = true
    AND (search_query = '' OR 
         name ILIKE '%' || search_query || '%' OR 
         description ILIKE '%' || search_query || '%')
    AND (category_filter = '' OR category = category_filter);
    
    -- 결과 반환 (배열 형식으로)
    IF products_array IS NULL THEN
        RETURN '[]'::json;
    ELSE
        RETURN products_array;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. update_product 함수 수정 - additional_images 지원
CREATE OR REPLACE FUNCTION update_product(
    product_id UUID,
    product_data JSON
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- 상품 업데이트
    UPDATE products
    SET 
        name = COALESCE((product_data->>'name')::TEXT, name),
        price = COALESCE((product_data->>'price')::NUMERIC, price),
        description = COALESCE((product_data->>'description')::TEXT, description),
        category = COALESCE((product_data->>'category')::TEXT, category),
        image_url = COALESCE((product_data->>'image_url')::TEXT, image_url),
        additional_images = COALESCE((product_data->>'additional_images')::JSONB, additional_images),
        stock = COALESCE((product_data->>'stock')::INTEGER, stock),
        is_active = COALESCE((product_data->>'is_active')::BOOLEAN, is_active),
        updated_at = NOW()
    WHERE id = product_id
    RETURNING row_to_json(products.*) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 권한 설정
GRANT EXECUTE ON FUNCTION add_product TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_product_by_id TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_products TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_product TO anon, authenticated;

-- 확인
SELECT 'Additional images support added successfully!' as message;
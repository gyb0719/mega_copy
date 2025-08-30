-- ========================================
-- SAFE FIX: Additional Images 지원 완전 수정
-- PostgreSQL 함수 중복 오류 해결
-- ========================================

-- 트랜잭션 시작 (안전한 실행을 위해)
BEGIN;

-- ========================================
-- 1. 기존 함수들 안전 삭제
-- ========================================

-- 모든 add_product 함수 오버로드 삭제
DROP FUNCTION IF EXISTS add_product(TEXT, DECIMAL, TEXT, TEXT, TEXT, INT);
DROP FUNCTION IF EXISTS add_product(TEXT, NUMERIC, TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS add_product(TEXT, NUMERIC, TEXT, TEXT, TEXT, INTEGER, JSONB);

-- 기존 업데이트 관련 함수들도 안전 삭제
DROP FUNCTION IF EXISTS update_product(UUID, JSONB);
DROP FUNCTION IF EXISTS update_product(UUID, JSON);

-- 기존 조회 함수들도 안전 삭제
DROP FUNCTION IF EXISTS get_products(INT, INT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_products(INTEGER, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_product_by_id(UUID);

-- ========================================
-- 2. products 테이블 구조 업데이트
-- ========================================

-- additional_images 컬럼 추가 (이미 있으면 무시)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_products_additional_images 
ON products USING GIN (additional_images);

-- ========================================
-- 3. 새로운 함수들 생성
-- ========================================

-- 3.1. add_product 함수 - additional_images 지원
CREATE OR REPLACE FUNCTION add_product(
    product_name TEXT,
    product_price NUMERIC,
    product_description TEXT DEFAULT '',
    product_category TEXT DEFAULT '',
    product_image_url TEXT DEFAULT '',
    product_stock INTEGER DEFAULT 0,
    product_additional_images JSONB DEFAULT '[]'::jsonb
)
RETURNS JSON 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_product_id UUID;
    result JSON;
BEGIN
    -- 입력값 검증
    IF product_name IS NULL OR TRIM(product_name) = '' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product name is required'
        );
    END IF;
    
    IF product_price IS NULL OR product_price < 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Valid price is required'
        );
    END IF;
    
    -- additional_images가 null이면 빈 배열로 설정
    IF product_additional_images IS NULL THEN
        product_additional_images := '[]'::jsonb;
    END IF;
    
    -- 상품 추가
    INSERT INTO products (
        name, 
        price, 
        description, 
        category, 
        image_url, 
        stock,
        additional_images,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        TRIM(product_name), 
        product_price, 
        COALESCE(TRIM(product_description), ''), 
        COALESCE(TRIM(product_category), ''), 
        COALESCE(TRIM(product_image_url), ''), 
        COALESCE(product_stock, 0),
        product_additional_images,
        true,
        NOW(),
        NOW()
    )
    RETURNING id INTO new_product_id;
    
    -- 결과 조회 및 반환
    SELECT json_build_object(
        'success', true,
        'data', row_to_json(p)
    ) INTO result
    FROM products p
    WHERE p.id = new_product_id;
    
    RETURN result;
EXCEPTION 
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 3.2. get_product_by_id 함수 - additional_images 포함
CREATE OR REPLACE FUNCTION get_product_by_id(product_id UUID)
RETURNS JSON 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    IF product_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product ID is required'
        );
    END IF;
    
    SELECT json_build_object(
        'success', true,
        'data', row_to_json(p)
    ) INTO result
    FROM (
        SELECT 
            id,
            name,
            price,
            description,
            category,
            image_url,
            COALESCE(additional_images, '[]'::jsonb) as additional_images,
            stock,
            is_active,
            created_at,
            updated_at
        FROM products
        WHERE id = product_id
        AND is_active = true
    ) p;
    
    IF result IS NULL OR (result->>'data') = 'null' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found'
        );
    END IF;
    
    RETURN result;
EXCEPTION 
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 3.3. get_products 함수 - additional_images 포함, 개선된 검색
CREATE OR REPLACE FUNCTION get_products(
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    search_query TEXT DEFAULT '',
    category_filter TEXT DEFAULT ''
)
RETURNS JSON 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    products_array JSON;
    total_count INTEGER;
BEGIN
    -- 매개변수 검증
    IF limit_count IS NULL OR limit_count <= 0 THEN
        limit_count := 50;
    END IF;
    
    IF limit_count > 1000 THEN
        limit_count := 1000; -- 최대 제한
    END IF;
    
    IF offset_count IS NULL OR offset_count < 0 THEN
        offset_count := 0;
    END IF;
    
    -- 검색어 정리
    search_query := COALESCE(TRIM(search_query), '');
    category_filter := COALESCE(TRIM(category_filter), '');
    
    -- 상품 목록 조회
    SELECT json_agg(p ORDER BY p.created_at DESC) INTO products_array
    FROM (
        SELECT 
            id,
            name,
            price,
            description,
            category,
            image_url,
            COALESCE(additional_images, '[]'::jsonb) as additional_images,
            stock,
            is_active,
            created_at,
            updated_at
        FROM products
        WHERE is_active = true
        AND (search_query = '' OR 
             name ILIKE '%' || search_query || '%' OR 
             description ILIKE '%' || search_query || '%' OR
             category ILIKE '%' || search_query || '%')
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
         description ILIKE '%' || search_query || '%' OR
         category ILIKE '%' || search_query || '%')
    AND (category_filter = '' OR category = category_filter);
    
    -- 결과 반환
    RETURN json_build_object(
        'success', true,
        'data', COALESCE(products_array, '[]'::json),
        'count', total_count,
        'limit', limit_count,
        'offset', offset_count
    );
EXCEPTION 
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'data', '[]'::json,
            'count', 0
        );
END;
$$;

-- 3.4. update_product 함수 - additional_images 지원
CREATE OR REPLACE FUNCTION update_product(
    product_id UUID,
    product_data JSON
)
RETURNS JSON 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    updated_count INTEGER;
BEGIN
    -- 입력값 검증
    IF product_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product ID is required'
        );
    END IF;
    
    IF product_data IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product data is required'
        );
    END IF;
    
    -- 상품 업데이트
    UPDATE products
    SET 
        name = COALESCE(
            NULLIF(TRIM(product_data->>'name'), ''), 
            name
        ),
        price = COALESCE(
            (product_data->>'price')::NUMERIC, 
            price
        ),
        description = COALESCE(
            TRIM(product_data->>'description'), 
            description
        ),
        category = COALESCE(
            TRIM(product_data->>'category'), 
            category
        ),
        image_url = COALESCE(
            TRIM(product_data->>'image_url'), 
            image_url
        ),
        additional_images = COALESCE(
            (product_data->>'additional_images')::JSONB, 
            additional_images
        ),
        stock = COALESCE(
            (product_data->>'stock')::INTEGER, 
            stock
        ),
        is_active = COALESCE(
            (product_data->>'is_active')::BOOLEAN, 
            is_active
        ),
        updated_at = NOW()
    WHERE id = product_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found or no changes made'
        );
    END IF;
    
    -- 업데이트된 상품 정보 반환
    SELECT json_build_object(
        'success', true,
        'data', row_to_json(p)
    ) INTO result
    FROM products p
    WHERE p.id = product_id;
    
    RETURN result;
EXCEPTION 
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 3.5. delete_product 함수 (소프트 삭제)
CREATE OR REPLACE FUNCTION delete_product(product_id UUID)
RETURNS JSON 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    IF product_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product ID is required'
        );
    END IF;
    
    -- 소프트 삭제 (is_active = false)
    UPDATE products 
    SET 
        is_active = false, 
        updated_at = NOW() 
    WHERE id = product_id 
    AND is_active = true;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found or already deleted'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Product deleted successfully',
        'id', product_id
    );
EXCEPTION 
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- ========================================
-- 4. 권한 설정
-- ========================================

-- anon 사용자 (미로그인 사용자)에게 조회 권한만
GRANT EXECUTE ON FUNCTION get_products TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_product_by_id TO anon, authenticated;

-- authenticated 사용자에게 모든 권한
GRANT EXECUTE ON FUNCTION add_product TO authenticated;
GRANT EXECUTE ON FUNCTION update_product TO authenticated;
GRANT EXECUTE ON FUNCTION delete_product TO authenticated;

-- ========================================
-- 5. RLS 정책 업데이트
-- ========================================

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are editable by authenticated" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

-- 새로운 정책 생성
CREATE POLICY "Enable read access for all users" 
ON products FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON products FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" 
ON products FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" 
ON products FOR DELETE 
USING (auth.role() = 'authenticated');

-- ========================================
-- 6. 테스트 및 확인
-- ========================================

-- 함수 존재 확인
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname IN ('add_product', 'get_products', 'get_product_by_id', 'update_product', 'delete_product');
    
    RAISE NOTICE 'Found % product-related functions', func_count;
    
    -- additional_images 컬럼 확인
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'additional_images'
    ) THEN
        RAISE NOTICE 'additional_images column exists';
    ELSE
        RAISE NOTICE 'WARNING: additional_images column not found!';
    END IF;
END $$;

-- 트랜잭션 커밋
COMMIT;

-- ========================================
-- 완료 메시지
-- ========================================
SELECT json_build_object(
    'status', 'success',
    'message', 'SAFE_FIX_ADDITIONAL_IMAGES completed successfully!',
    'features', json_build_array(
        'Fixed function name conflicts',
        'Added additional_images support',
        'Enhanced error handling',
        'Improved input validation',
        'Updated RLS policies',
        'Added proper indexes'
    ),
    'timestamp', NOW()
) as result;
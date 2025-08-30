-- ========================================
-- 상품 이미지 표시 문제 해결 SQL (Universal Version)
-- TEXT[] 및 JSONB 타입 모두 지원
-- ========================================

-- 0. 현재 additional_images 컬럼 타입 확인 및 JSONB로 변환
DO $$
DECLARE
    col_type TEXT;
BEGIN
    -- 현재 컬럼 타입 확인
    SELECT data_type INTO col_type
    FROM information_schema.columns
    WHERE table_name = 'products' 
    AND column_name = 'additional_images';
    
    IF col_type = 'ARRAY' THEN
        RAISE NOTICE 'Converting additional_images from TEXT[] to JSONB...';
        
        -- 임시 컬럼 생성
        ALTER TABLE products ADD COLUMN IF NOT EXISTS additional_images_temp JSONB;
        
        -- 데이터 변환 (TEXT[] -> JSONB)
        UPDATE products 
        SET additional_images_temp = 
            CASE 
                WHEN additional_images IS NULL THEN '[]'::jsonb
                WHEN array_length(additional_images, 1) IS NULL THEN '[]'::jsonb
                ELSE to_jsonb(additional_images)
            END;
        
        -- 기존 컬럼 삭제
        ALTER TABLE products DROP COLUMN additional_images;
        
        -- 임시 컬럼 이름 변경
        ALTER TABLE products RENAME COLUMN additional_images_temp TO additional_images;
        
        RAISE NOTICE 'Conversion completed';
    ELSIF col_type IS NULL THEN
        -- 컬럼이 없으면 생성
        ALTER TABLE products ADD COLUMN additional_images JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Created additional_images column as JSONB';
    ELSE
        RAISE NOTICE 'additional_images is already JSONB type';
    END IF;
END $$;

-- 1. get_products 함수 수정 - product_images 테이블 조인
CREATE OR REPLACE FUNCTION get_products(
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
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
    -- 메인 쿼리 실행
    SELECT json_build_object(
        'success', true,
        'data', COALESCE(json_agg(
            json_build_object(
                'id', p.id,
                'name', p.name,
                'brand', p.brand,
                'price', p.price,
                'description', p.description,
                'category', p.category,
                'image_url', p.image_url,
                'additional_images', COALESCE(p.additional_images, '[]'::jsonb),
                'product_images', COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'id', pi.id,
                            'image_url', pi.image_url,
                            'display_order', pi.display_order,
                            'is_primary', pi.is_primary
                        ) ORDER BY pi.display_order, pi.created_at
                    )
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ), '[]'::json
                ),
                'stock', p.stock,
                'is_active', p.is_active,
                'created_at', p.created_at,
                'updated_at', p.updated_at
            ) ORDER BY p.created_at DESC
        ), '[]'::json),
        'total', (
            SELECT COUNT(*)
            FROM products p2
            WHERE p2.is_active = true
            AND (search_query = '' OR search_query IS NULL OR 
                 p2.name ILIKE '%' || search_query || '%' OR 
                 p2.description ILIKE '%' || search_query || '%' OR
                 COALESCE(p2.brand, '') ILIKE '%' || search_query || '%')
            AND (category_filter = '' OR category_filter IS NULL OR p2.category = category_filter)
        )
    ) INTO result
    FROM products p
    WHERE p.is_active = true
    AND (search_query = '' OR search_query IS NULL OR 
         p.name ILIKE '%' || search_query || '%' OR 
         p.description ILIKE '%' || search_query || '%' OR
         COALESCE(p.brand, '') ILIKE '%' || search_query || '%')
    AND (category_filter = '' OR category_filter IS NULL OR p.category = category_filter)
    LIMIT limit_count OFFSET offset_count;
    
    RETURN COALESCE(result, json_build_object('success', true, 'data', '[]'::json, 'total', 0));
END;
$$;

-- 2. get_product_by_id 함수 수정
CREATE OR REPLACE FUNCTION get_product_by_id(product_id UUID)
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', p.id,
        'name', p.name,
        'brand', p.brand,
        'price', p.price,
        'description', p.description,
        'category', p.category,
        'image_url', p.image_url,
        'additional_images', COALESCE(p.additional_images, '[]'::jsonb),
        'product_images', COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', pi.id,
                    'image_url', pi.image_url,
                    'display_order', pi.display_order,
                    'is_primary', pi.is_primary
                ) ORDER BY pi.display_order, pi.created_at
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
            ), '[]'::json
        ),
        'stock', p.stock,
        'is_active', p.is_active,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    ) INTO result
    FROM products p
    WHERE p.id = product_id
    AND p.is_active = true;
    
    IF result IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'data', result
    );
END;
$$;

-- 3. 데이터 마이그레이션 - additional_images를 product_images 테이블로 복사
DO $$
DECLARE
    prod_rec RECORD;
    img_url TEXT;
    order_num INTEGER;
BEGIN
    -- 모든 활성 상품 처리
    FOR prod_rec IN 
        SELECT id, image_url, additional_images 
        FROM products 
        WHERE is_active = true
    LOOP
        order_num := 0;
        
        -- 메인 이미지 처리
        IF prod_rec.image_url IS NOT NULL AND prod_rec.image_url != '' THEN
            -- 중복 체크 후 삽입
            INSERT INTO product_images (product_id, image_url, display_order, is_primary)
            SELECT prod_rec.id, prod_rec.image_url, order_num, true
            WHERE NOT EXISTS (
                SELECT 1 FROM product_images 
                WHERE product_id = prod_rec.id 
                AND image_url = prod_rec.image_url
            );
            order_num := order_num + 1;
        END IF;
        
        -- additional_images 처리 (JSONB)
        IF prod_rec.additional_images IS NOT NULL AND 
           prod_rec.additional_images::text != '[]' AND
           prod_rec.additional_images::text != 'null' THEN
            
            -- JSONB 배열의 각 요소 처리
            FOR img_url IN 
                SELECT jsonb_array_elements_text(prod_rec.additional_images)
            LOOP
                IF img_url IS NOT NULL AND img_url != '' THEN
                    -- 중복 체크 후 삽입
                    INSERT INTO product_images (product_id, image_url, display_order, is_primary)
                    SELECT prod_rec.id, img_url, order_num, false
                    WHERE NOT EXISTS (
                        SELECT 1 FROM product_images 
                        WHERE product_id = prod_rec.id 
                        AND image_url = img_url
                    );
                    order_num := order_num + 1;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration completed. Total products processed: %', 
        (SELECT COUNT(*) FROM products WHERE is_active = true);
END $$;

-- 4. 상품 추가 함수 (product_images 지원)
CREATE OR REPLACE FUNCTION add_product_with_images(
    product_name TEXT,
    product_price NUMERIC,
    product_description TEXT DEFAULT '',
    product_category TEXT DEFAULT '',
    product_brand TEXT DEFAULT '',
    product_image_url TEXT DEFAULT '',
    product_stock INTEGER DEFAULT 0,
    product_additional_images JSONB DEFAULT '[]'::jsonb
)
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_product_id UUID;
    img_url TEXT;
    order_num INTEGER := 0;
    result JSON;
BEGIN
    -- 입력값 검증
    IF product_name IS NULL OR TRIM(product_name) = '' THEN
        RETURN json_build_object('success', false, 'error', 'Product name is required');
    END IF;
    
    IF product_price IS NULL OR product_price < 0 THEN
        RETURN json_build_object('success', false, 'error', 'Invalid price');
    END IF;
    
    -- additional_images가 null이면 빈 배열로
    IF product_additional_images IS NULL THEN
        product_additional_images := '[]'::jsonb;
    END IF;
    
    -- 상품 추가
    INSERT INTO products (
        name, brand, price, description, category, 
        image_url, stock, additional_images, is_active
    ) VALUES (
        TRIM(product_name),
        NULLIF(TRIM(product_brand), ''),
        product_price,
        NULLIF(TRIM(product_description), ''),
        NULLIF(TRIM(product_category), ''),
        NULLIF(TRIM(product_image_url), ''),
        COALESCE(product_stock, 0),
        product_additional_images,
        true
    ) RETURNING id INTO new_product_id;
    
    -- 메인 이미지를 product_images에 추가
    IF product_image_url IS NOT NULL AND TRIM(product_image_url) != '' THEN
        INSERT INTO product_images (product_id, image_url, display_order, is_primary)
        VALUES (new_product_id, TRIM(product_image_url), order_num, true);
        order_num := order_num + 1;
    END IF;
    
    -- additional_images를 product_images에 추가
    IF jsonb_array_length(product_additional_images) > 0 THEN
        FOR img_url IN SELECT jsonb_array_elements_text(product_additional_images)
        LOOP
            IF img_url IS NOT NULL AND TRIM(img_url) != '' THEN
                INSERT INTO product_images (product_id, image_url, display_order, is_primary)
                VALUES (new_product_id, TRIM(img_url), order_num, false);
                order_num := order_num + 1;
            END IF;
        END LOOP;
    END IF;
    
    -- 추가된 상품 조회하여 반환
    SELECT get_product_by_id(new_product_id) INTO result;
    RETURN result;
END;
$$;

-- 5. 테스트 및 검증
DO $$
DECLARE
    test_result JSON;
    img_count INTEGER;
BEGIN
    -- product_images 테이블 통계
    SELECT COUNT(DISTINCT product_id) INTO img_count FROM product_images;
    RAISE NOTICE 'Products with images in product_images table: %', img_count;
    
    -- 샘플 데이터 조회
    SELECT get_products(5, 0, '', '') INTO test_result;
    RAISE NOTICE 'Sample products data retrieved successfully';
    
    -- 검증 완료
    RAISE NOTICE '====================================';
    RAISE NOTICE 'All functions created successfully!';
    RAISE NOTICE '====================================';
END $$;

-- 성공 메시지
SELECT json_build_object(
    'status', 'success',
    'message', 'Product image display fix applied successfully',
    'functions_updated', ARRAY[
        'get_products', 
        'get_product_by_id', 
        'add_product_with_images'
    ],
    'products_with_images', (
        SELECT COUNT(DISTINCT product_id) FROM product_images
    ),
    'total_images', (
        SELECT COUNT(*) FROM product_images
    )
) AS result;
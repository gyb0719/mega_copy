-- ========================================
-- 상품 이미지 표시 문제 해결 SQL
-- ========================================

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
    query TEXT;
BEGIN
    -- 동적 쿼리 생성
    query := '
    SELECT json_build_object(
        ''success'', true,
        ''data'', COALESCE(json_agg(
            json_build_object(
                ''id'', p.id,
                ''name'', p.name,
                ''brand'', p.brand,
                ''price'', p.price,
                ''description'', p.description,
                ''category'', p.category,
                ''image_url'', p.image_url,
                ''additional_images'', COALESCE(p.additional_images, ''[]''::jsonb),
                ''product_images'', COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            ''id'', pi.id,
                            ''image_url'', pi.image_url,
                            ''display_order'', pi.display_order,
                            ''is_primary'', pi.is_primary
                        ) ORDER BY pi.display_order, pi.created_at
                    )
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ), ''[]''::json
                ),
                ''stock'', p.stock,
                ''is_active'', p.is_active,
                ''created_at'', p.created_at,
                ''updated_at'', p.updated_at
            )
        ), ''[]''::json),
        ''total'', (
            SELECT COUNT(*)
            FROM products p2
            WHERE p2.is_active = true';
    
    -- 검색 조건 추가
    IF search_query IS NOT NULL AND search_query != '' THEN
        query := query || ' AND (
            p2.name ILIKE ''%'' || $3 || ''%'' OR 
            p2.description ILIKE ''%'' || $3 || ''%'' OR
            p2.brand ILIKE ''%'' || $3 || ''%''
        )';
    END IF;
    
    -- 카테고리 필터 추가
    IF category_filter IS NOT NULL AND category_filter != '' THEN
        query := query || ' AND p2.category = $4';
    END IF;
    
    query := query || '
        )
    )
    FROM products p
    WHERE p.is_active = true';
    
    -- 검색 조건 추가
    IF search_query IS NOT NULL AND search_query != '' THEN
        query := query || ' AND (
            p.name ILIKE ''%'' || $3 || ''%'' OR 
            p.description ILIKE ''%'' || $3 || ''%'' OR
            p.brand ILIKE ''%'' || $3 || ''%''
        )';
    END IF;
    
    -- 카테고리 필터 추가
    IF category_filter IS NOT NULL AND category_filter != '' THEN
        query := query || ' AND p.category = $4';
    END IF;
    
    query := query || '
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2';
    
    -- 쿼리 실행
    IF search_query IS NOT NULL AND search_query != '' AND category_filter IS NOT NULL AND category_filter != '' THEN
        EXECUTE query INTO result USING limit_count, offset_count, search_query, category_filter;
    ELSIF search_query IS NOT NULL AND search_query != '' THEN
        EXECUTE query INTO result USING limit_count, offset_count, search_query;
    ELSIF category_filter IS NOT NULL AND category_filter != '' THEN
        EXECUTE query INTO result USING limit_count, offset_count, category_filter;
    ELSE
        EXECUTE query INTO result USING limit_count, offset_count;
    END IF;
    
    RETURN result;
END;
$$;

-- 2. get_product_by_id 함수 수정 - product_images 테이블 조인
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

-- 3. add_product_with_images 함수 생성 - 상품과 이미지를 함께 추가
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
    image_record JSONB;
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
            'error', 'Invalid price'
        );
    END IF;
    
    -- 상품 추가
    INSERT INTO products (
        name, brand, price, description, category, 
        image_url, stock, additional_images, is_active
    )
    VALUES (
        TRIM(product_name),
        COALESCE(TRIM(product_brand), ''),
        product_price,
        COALESCE(TRIM(product_description), ''),
        COALESCE(TRIM(product_category), ''),
        COALESCE(TRIM(product_image_url), ''),
        COALESCE(product_stock, 0),
        product_additional_images,
        true
    )
    RETURNING id INTO new_product_id;
    
    -- 메인 이미지를 product_images 테이블에도 추가
    IF product_image_url IS NOT NULL AND TRIM(product_image_url) != '' THEN
        INSERT INTO product_images (product_id, image_url, display_order, is_primary)
        VALUES (new_product_id, TRIM(product_image_url), 0, true);
    END IF;
    
    -- additional_images를 product_images 테이블에 추가
    IF product_additional_images IS NOT NULL AND jsonb_array_length(product_additional_images) > 0 THEN
        FOR image_record IN SELECT * FROM jsonb_array_elements(product_additional_images)
        LOOP
            INSERT INTO product_images (product_id, image_url, display_order, is_primary)
            VALUES (
                new_product_id, 
                image_record::text, 
                (SELECT COALESCE(MAX(display_order), 0) + 1 FROM product_images WHERE product_id = new_product_id),
                false
            );
        END LOOP;
    END IF;
    
    -- 추가된 상품 조회
    SELECT get_product_by_id(new_product_id) INTO result;
    
    RETURN result;
END;
$$;

-- 4. update_product_with_images 함수 생성 - 상품과 이미지를 함께 수정
CREATE OR REPLACE FUNCTION update_product_with_images(
    product_id UUID,
    product_data JSONB
)
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    new_images JSONB;
    image_record JSONB;
BEGIN
    -- 상품 존재 확인
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = product_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found'
        );
    END IF;
    
    -- 상품 정보 업데이트
    UPDATE products
    SET 
        name = COALESCE((product_data->>'name')::TEXT, name),
        brand = COALESCE((product_data->>'brand')::TEXT, brand),
        price = COALESCE((product_data->>'price')::NUMERIC, price),
        description = COALESCE((product_data->>'description')::TEXT, description),
        category = COALESCE((product_data->>'category')::TEXT, category),
        image_url = COALESCE((product_data->>'image_url')::TEXT, image_url),
        additional_images = COALESCE((product_data->>'additional_images')::JSONB, additional_images),
        stock = COALESCE((product_data->>'stock')::INTEGER, stock),
        updated_at = NOW()
    WHERE id = product_id;
    
    -- product_images 업데이트가 필요한 경우
    IF product_data ? 'product_images' THEN
        -- 기존 이미지 삭제
        DELETE FROM product_images WHERE product_id = product_id;
        
        -- 새 이미지 추가
        new_images := product_data->'product_images';
        IF new_images IS NOT NULL AND jsonb_array_length(new_images) > 0 THEN
            FOR image_record IN SELECT * FROM jsonb_array_elements(new_images)
            LOOP
                INSERT INTO product_images (
                    product_id, 
                    image_url, 
                    display_order, 
                    is_primary
                )
                VALUES (
                    product_id,
                    image_record->>'image_url',
                    COALESCE((image_record->>'display_order')::INTEGER, 0),
                    COALESCE((image_record->>'is_primary')::BOOLEAN, false)
                );
            END LOOP;
        END IF;
    END IF;
    
    -- 업데이트된 상품 조회
    SELECT get_product_by_id(product_id) INTO result;
    
    RETURN result;
END;
$$;

-- 5. 기존 데이터 마이그레이션 - additional_images를 product_images 테이블로 복사
DO $$
DECLARE
    product_record RECORD;
    img_url TEXT;
    display_order_counter INTEGER;
BEGIN
    -- 모든 상품에 대해 처리
    FOR product_record IN SELECT id, image_url, additional_images FROM products WHERE is_active = true
    LOOP
        display_order_counter := 0;
        
        -- 메인 이미지가 있고 product_images에 없으면 추가
        IF product_record.image_url IS NOT NULL AND product_record.image_url != '' THEN
            IF NOT EXISTS (
                SELECT 1 FROM product_images 
                WHERE product_id = product_record.id 
                AND image_url = product_record.image_url
            ) THEN
                INSERT INTO product_images (product_id, image_url, display_order, is_primary)
                VALUES (product_record.id, product_record.image_url, display_order_counter, true);
                display_order_counter := display_order_counter + 1;
            END IF;
        END IF;
        
        -- additional_images가 있으면 product_images에 추가
        IF product_record.additional_images IS NOT NULL AND jsonb_array_length(product_record.additional_images) > 0 THEN
            FOR img_url IN SELECT jsonb_array_elements_text(product_record.additional_images)
            LOOP
                IF NOT EXISTS (
                    SELECT 1 FROM product_images 
                    WHERE product_id = product_record.id 
                    AND image_url = img_url
                ) THEN
                    INSERT INTO product_images (product_id, image_url, display_order, is_primary)
                    VALUES (product_record.id, img_url, display_order_counter, false);
                    display_order_counter := display_order_counter + 1;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully';
END;
$$;

-- 6. 테스트 쿼리
-- 상품 목록 조회 테스트
SELECT get_products(10, 0, '', '');

-- 특정 상품 조회 테스트 (실제 product_id로 변경 필요)
-- SELECT get_product_by_id('your-product-id-here');

COMMIT;
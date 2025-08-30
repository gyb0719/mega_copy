-- ========================================
-- 상품 이미지 표시 문제 최종 해결 SQL
-- product_images 테이블 구조 확인 및 수정 포함
-- ========================================

-- 0. product_images 테이블 구조 확인 및 수정
DO $$
BEGIN
    -- product_images 테이블이 없으면 생성
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_images') THEN
        CREATE TABLE product_images (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            product_id UUID REFERENCES products(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL,
            display_order INTEGER DEFAULT 0,
            is_primary BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_product_images_product_id ON product_images(product_id);
        RAISE NOTICE 'Created product_images table';
    ELSE
        -- is_primary 컬럼이 없으면 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'product_images' 
                       AND column_name = 'is_primary') THEN
            ALTER TABLE product_images ADD COLUMN is_primary BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added is_primary column to product_images';
        END IF;
    END IF;
END $$;

-- 1. additional_images 컬럼 타입 확인 및 변환
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
    END IF;
END $$;

-- 2. get_products 함수 - 간단한 버전
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
    SELECT json_build_object(
        'success', true,
        'data', COALESCE(json_agg(product_data ORDER BY created_at DESC), '[]'::json),
        'total', COUNT(*) OVER()
    ) INTO result
    FROM (
        SELECT 
            p.id,
            p.name,
            p.brand,
            p.price,
            p.description,
            p.category,
            p.image_url,
            COALESCE(p.additional_images, '[]'::jsonb) as additional_images,
            COALESCE(
                (SELECT json_agg(
                    json_build_object(
                        'id', pi.id,
                        'image_url', pi.image_url,
                        'display_order', pi.display_order,
                        'is_primary', COALESCE(pi.is_primary, false)
                    ) ORDER BY pi.display_order
                )
                FROM product_images pi
                WHERE pi.product_id = p.id
                ), '[]'::json
            ) as product_images,
            p.stock,
            p.is_active,
            p.created_at,
            p.updated_at
        FROM products p
        WHERE p.is_active = true
        AND (search_query = '' OR search_query IS NULL OR 
             p.name ILIKE '%' || search_query || '%' OR 
             COALESCE(p.description, '') ILIKE '%' || search_query || '%' OR
             COALESCE(p.brand, '') ILIKE '%' || search_query || '%')
        AND (category_filter = '' OR category_filter IS NULL OR p.category = category_filter)
        ORDER BY p.created_at DESC
        LIMIT limit_count OFFSET offset_count
    ) as product_data;
    
    RETURN COALESCE(result, json_build_object('success', true, 'data', '[]'::json, 'total', 0));
END;
$$;

-- 3. get_product_by_id 함수
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
                    'is_primary', COALESCE(pi.is_primary, false)
                ) ORDER BY pi.display_order
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
        RETURN json_build_object('success', false, 'error', 'Product not found');
    END IF;
    
    RETURN json_build_object('success', true, 'data', result);
END;
$$;

-- 4. 데이터 마이그레이션 - additional_images를 product_images로 복사
DO $$
DECLARE
    prod_rec RECORD;
    img_url TEXT;
    order_num INTEGER;
    migrated_count INTEGER := 0;
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
            
            -- 삽입된 경우에만 order_num 증가
            IF FOUND THEN
                order_num := order_num + 1;
            END IF;
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
                    
                    -- 삽입된 경우에만 order_num 증가
                    IF FOUND THEN
                        order_num := order_num + 1;
                    END IF;
                END IF;
            END LOOP;
        END IF;
        
        migrated_count := migrated_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Migration completed. Products processed: %', migrated_count;
END $$;

-- 5. 결과 확인
SELECT json_build_object(
    'status', 'SUCCESS',
    'message', '상품 이미지 표시 문제가 해결되었습니다',
    'details', json_build_object(
        'functions_updated', ARRAY['get_products', 'get_product_by_id'],
        'products_with_images', (
            SELECT COUNT(DISTINCT product_id) FROM product_images
        ),
        'total_images_in_product_images', (
            SELECT COUNT(*) FROM product_images
        ),
        'active_products', (
            SELECT COUNT(*) FROM products WHERE is_active = true
        )
    ),
    'next_steps', '관리자 페이지와 상품 상세 페이지에서 이미지가 정상적으로 표시되는지 확인하세요'
) AS result;
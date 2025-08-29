-- ========================================
-- 즉시 실행 가능한 add_product 함수 수정
-- ========================================

-- 1. 기존 함수 삭제 (모든 시그니처)
DROP FUNCTION IF EXISTS add_product CASCADE;

-- 2. 새로운 add_product 함수 생성 (매개변수 순서 수정)
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
    -- products 테이블에 additional_images 컬럼 추가 (없으면)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'additional_images'
    ) THEN
        ALTER TABLE products ADD COLUMN additional_images JSONB DEFAULT '[]'::jsonb;
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
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error adding product: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 권한 부여
GRANT EXECUTE ON FUNCTION add_product TO anon, authenticated;

-- 4. 스키마 캐시 새로고침
NOTIFY pgrst, 'reload schema';

-- 5. 확인
SELECT 'add_product function created successfully!' as message;
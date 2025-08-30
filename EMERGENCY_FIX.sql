-- ========================================
-- 긴급 수정: add_product 함수 재생성
-- ========================================

-- 1. 기존 함수 모두 삭제
DROP FUNCTION IF EXISTS public.add_product CASCADE;

-- 2. products 테이블에 additional_images 컬럼 확인/추가
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' 
                   AND column_name = 'additional_images') THEN
        ALTER TABLE products ADD COLUMN additional_images JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 3. 새로운 add_product 함수 생성 (매개변수 이름 순서대로)
CREATE OR REPLACE FUNCTION public.add_product(
    product_additional_images JSONB DEFAULT '[]'::jsonb,
    product_category TEXT DEFAULT '',
    product_description TEXT DEFAULT '',
    product_image_url TEXT DEFAULT '',
    product_name TEXT,
    product_price NUMERIC,
    product_stock INTEGER DEFAULT 0
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
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        product_name, 
        product_price, 
        product_description, 
        product_category, 
        product_image_url, 
        product_stock,
        product_additional_images,
        true,
        NOW(),
        NOW()
    )
    RETURNING id INTO new_product_id;
    
    -- 결과 반환
    SELECT row_to_json(p) INTO result
    FROM products p
    WHERE p.id = new_product_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 권한 부여
GRANT EXECUTE ON FUNCTION public.add_product TO anon;
GRANT EXECUTE ON FUNCTION public.add_product TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_product TO service_role;

-- 5. 확인
SELECT 'Emergency fix applied successfully!' as message;
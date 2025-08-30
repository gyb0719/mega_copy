-- ========================================
-- Fix Product Detail API
-- Ensures get_product_by_id returns complete product data
-- ========================================

-- Drop and recreate get_product_by_id function
DROP FUNCTION IF EXISTS get_product_by_id(UUID);

CREATE OR REPLACE FUNCTION get_product_by_id(product_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Get product with all fields including images
    SELECT row_to_json(p.*) INTO result
    FROM (
        SELECT 
            p.id,
            p.name,
            p.brand,
            p.price,
            p.original_price,
            p.description,
            p.category,
            p.image_url,
            p.additional_images,
            p.stock,
            p.is_active,
            p.created_at,
            p.updated_at,
            -- Include product_images if table exists
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', pi.id,
                            'image_url', pi.image_url,
                            'display_order', pi.display_order,
                            'is_primary', pi.is_primary
                        ) ORDER BY pi.display_order
                    )
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                ),
                '[]'::json
            ) AS product_images
        FROM products p
        WHERE p.id = product_id
          AND p.is_active = true
    ) p;
    
    -- Log for debugging
    RAISE NOTICE 'Product detail for ID %: %', product_id, result;
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_product_by_id(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_product_by_id(UUID) TO authenticated;

-- Test the function
DO $$
DECLARE
    test_product_id UUID;
    test_result JSON;
BEGIN
    -- Get any active product ID for testing
    SELECT id INTO test_product_id 
    FROM products 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_product_id IS NOT NULL THEN
        test_result := get_product_by_id(test_product_id);
        RAISE NOTICE 'Test product result: %', test_result;
    ELSE
        RAISE NOTICE 'No active products found for testing';
    END IF;
END;
$$;
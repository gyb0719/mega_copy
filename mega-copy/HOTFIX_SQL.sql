-- ================================================
-- 빠른 수정용 SQL (오류 부분만 수정)
-- ================================================
-- 이미 일부 실행했다면 이것만 실행하세요
-- ================================================

-- 1. pg_trgm 확장 활성화 (한국어 검색 지원)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. 인덱스 생성 (오류난 부분 수정)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- 한국어 검색을 위한 GIN 인덱스 (pg_trgm 사용)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_brand_trgm ON products USING gin(brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- 3. 확인 쿼리
SELECT 'Indexes created successfully!' as status;
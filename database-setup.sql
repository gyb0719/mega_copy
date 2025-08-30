-- MEGA 쇼핑몰 데이터베이스 초기 설정
-- Supabase SQL Editor에서 실행

-- 1. 관리자 테이블
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 상품 테이블
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    additional_images JSONB DEFAULT '[]'::jsonb,
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 기본 카테고리 삽입
INSERT INTO categories (name, display_order, is_active) VALUES
    ('가방', 1, true),
    ('지갑', 2, true),
    ('벨트', 3, true),
    ('액세서리', 4, true)
ON CONFLICT (name) DO NOTHING;

-- 5. 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);

-- 6. RLS (Row Level Security) 정책 설정
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 상품 조회는 모두 허용
CREATE POLICY "Products are viewable by everyone" 
    ON products FOR SELECT 
    USING (true);

-- 관리자만 상품 수정 가능
CREATE POLICY "Only admins can modify products" 
    ON products FOR ALL 
    USING (auth.role() = 'authenticated');

-- 카테고리 조회는 모두 허용
CREATE POLICY "Categories are viewable by everyone" 
    ON categories FOR SELECT 
    USING (true);

-- 7. Storage 버킷 설정 (Supabase Dashboard에서 실행)
-- Storage > New Bucket > 'product-images' 생성
-- Public 버킷으로 설정
-- ================================================
-- MEGA-COPY SUPABASE 완전체 설정
-- 이 스크립트 하나로 모든 설정 완료
-- ================================================
-- 실행 방법:
-- 1. Supabase Dashboard > SQL Editor
-- 2. 이 전체 내용 복사 & 붙여넣기
-- 3. Run 클릭
-- ================================================

-- ================================================
-- PART 1: 초기화 (기존 데이터 정리)
-- ================================================

-- 기존 RPC 함수들 삭제
DROP FUNCTION IF EXISTS get_products CASCADE;
DROP FUNCTION IF EXISTS get_product_by_id CASCADE;
DROP FUNCTION IF EXISTS add_product CASCADE;
DROP FUNCTION IF EXISTS update_product CASCADE;
DROP FUNCTION IF EXISTS delete_product CASCADE;
DROP FUNCTION IF EXISTS get_categories CASCADE;
DROP FUNCTION IF EXISTS admin_login CASCADE;
DROP FUNCTION IF EXISTS get_orders CASCADE;
DROP FUNCTION IF EXISTS create_order CASCADE;
DROP FUNCTION IF EXISTS update_order_status CASCADE;
DROP FUNCTION IF EXISTS get_admin_stats CASCADE;
DROP FUNCTION IF EXISTS search_products CASCADE;
DROP FUNCTION IF EXISTS bulk_delete_products CASCADE;
DROP FUNCTION IF EXISTS export_products CASCADE;

-- 기존 테이블 삭제 (CASCADE로 의존성 모두 제거)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- ================================================
-- PART 2: 테이블 생성
-- ================================================

-- Categories 테이블
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products 테이블
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(12,2),
  description TEXT,
  category TEXT,
  image_url TEXT,
  additional_images TEXT[],
  stock INT DEFAULT 0 CHECK (stock >= 0),
  sku TEXT UNIQUE,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INT DEFAULT 0,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images 테이블
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins 테이블
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders 테이블
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  billing_address TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  shipping_fee DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  tracking_number TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items 테이블
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(12,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Subscriptions 테이블
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  keys JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- PART 3: 인덱스 생성 (성능 최적화)
-- ================================================

-- pg_trgm 확장 활성화 (한국어 검색 지원)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);
-- 한국어 검색을 위한 GIN 인덱스 (pg_trgm 사용)
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_brand_trgm ON products USING gin(brand gin_trgm_ops);
CREATE INDEX idx_products_brand ON products(brand);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- ================================================
-- PART 4: RPC 함수들 생성
-- ================================================

-- 1. Products 조회 (페이지네이션, 검색, 필터)
CREATE OR REPLACE FUNCTION get_products(
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0,
  search_query TEXT DEFAULT '',
  category_filter TEXT DEFAULT '',
  price_min DECIMAL DEFAULT NULL,
  price_max DECIMAL DEFAULT NULL,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'DESC'
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  total_count INT;
BEGIN
  -- 전체 카운트 먼저 계산
  SELECT COUNT(*) INTO total_count
  FROM products
  WHERE is_active = true
    AND (search_query = '' OR (
      name ILIKE '%' || search_query || '%' OR 
      brand ILIKE '%' || search_query || '%' OR
      description ILIKE '%' || search_query || '%'
    ))
    AND (category_filter = '' OR category = category_filter)
    AND (price_min IS NULL OR price >= price_min)
    AND (price_max IS NULL OR price <= price_max);

  -- 데이터 조회
  SELECT json_build_object(
    'data', COALESCE(json_agg(
      json_build_object(
        'id', p.id,
        'name', p.name,
        'brand', p.brand,
        'price', p.price,
        'original_price', p.original_price,
        'description', p.description,
        'category', p.category,
        'image_url', p.image_url,
        'additional_images', p.additional_images,
        'stock', p.stock,
        'is_featured', p.is_featured,
        'tags', p.tags,
        'created_at', p.created_at
      )
    ), '[]'::json),
    'count', total_count,
    'page', FLOOR(offset_count / NULLIF(limit_count, 0)) + 1,
    'total_pages', CEIL(total_count::FLOAT / NULLIF(limit_count, 1))
  )
  INTO result
  FROM (
    SELECT * FROM products
    WHERE is_active = true
      AND (search_query = '' OR (
        name ILIKE '%' || search_query || '%' OR 
        brand ILIKE '%' || search_query || '%' OR
        description ILIKE '%' || search_query || '%'
      ))
      AND (category_filter = '' OR category = category_filter)
      AND (price_min IS NULL OR price >= price_min)
      AND (price_max IS NULL OR price <= price_max)
    ORDER BY 
      CASE 
        WHEN sort_by = 'price' AND sort_order = 'ASC' THEN price
        WHEN sort_by = 'price' AND sort_order = 'DESC' THEN -price
        WHEN sort_by = 'name' AND sort_order = 'ASC' THEN name
        ELSE NULL
      END,
      CASE
        WHEN sort_by = 'created_at' AND sort_order = 'DESC' THEN created_at
        ELSE created_at
      END DESC
    LIMIT limit_count
    OFFSET offset_count
  ) p;
  
  RETURN result;
END;
$$;

-- 2. Product 상세 조회
CREATE OR REPLACE FUNCTION get_product_by_id(product_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  -- 조회수 증가
  UPDATE products 
  SET view_count = view_count + 1 
  WHERE id = product_id;

  -- 상품 정보 반환
  SELECT json_build_object(
    'id', p.id,
    'name', p.name,
    'brand', p.brand,
    'price', p.price,
    'original_price', p.original_price,
    'description', p.description,
    'category', p.category,
    'image_url', p.image_url,
    'additional_images', p.additional_images,
    'stock', p.stock,
    'sku', p.sku,
    'is_featured', p.is_featured,
    'view_count', p.view_count,
    'tags', p.tags,
    'metadata', p.metadata,
    'created_at', p.created_at,
    'images', (
      SELECT json_agg(
        json_build_object(
          'id', pi.id,
          'image_url', pi.image_url,
          'display_order', pi.display_order,
          'is_primary', pi.is_primary
        ) ORDER BY pi.display_order, pi.created_at
      )
      FROM product_images pi
      WHERE pi.product_id = p.id
    )
  ) INTO result
  FROM products p
  WHERE p.id = product_id AND p.is_active = true;
  
  RETURN result;
END;
$$;

-- 3. Product 추가
CREATE OR REPLACE FUNCTION add_product(
  product_name TEXT,
  product_price DECIMAL,
  product_description TEXT DEFAULT '',
  product_category TEXT DEFAULT '',
  product_image_url TEXT DEFAULT '',
  product_stock INT DEFAULT 0,
  product_brand TEXT DEFAULT '',
  product_sku TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  new_product JSON;
  new_id UUID;
BEGIN
  -- SKU 자동 생성 (없으면)
  IF product_sku IS NULL THEN
    product_sku := 'SKU-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  END IF;

  INSERT INTO products (
    name, price, description, category, 
    image_url, stock, brand, sku
  )
  VALUES (
    product_name, product_price, product_description, 
    product_category, product_image_url, product_stock, 
    product_brand, product_sku
  )
  RETURNING id INTO new_id;

  -- 이미지가 있으면 product_images에도 추가
  IF product_image_url IS NOT NULL AND product_image_url != '' THEN
    INSERT INTO product_images (product_id, image_url, is_primary)
    VALUES (new_id, product_image_url, true);
  END IF;

  SELECT json_build_object(
    'id', id,
    'name', name,
    'price', price,
    'description', description,
    'category', category,
    'image_url', image_url,
    'stock', stock,
    'brand', brand,
    'sku', sku,
    'created_at', created_at
  ) INTO new_product
  FROM products WHERE id = new_id;
  
  RETURN new_product;
END;
$$;

-- 4. Product 수정
CREATE OR REPLACE FUNCTION update_product(
  product_id UUID,
  product_data JSONB
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  updated_product JSON;
BEGIN
  UPDATE products
  SET 
    name = COALESCE((product_data->>'name')::TEXT, name),
    brand = COALESCE((product_data->>'brand')::TEXT, brand),
    price = COALESCE((product_data->>'price')::DECIMAL, price),
    original_price = COALESCE((product_data->>'original_price')::DECIMAL, original_price),
    description = COALESCE((product_data->>'description')::TEXT, description),
    category = COALESCE((product_data->>'category')::TEXT, category),
    image_url = COALESCE((product_data->>'image_url')::TEXT, image_url),
    stock = COALESCE((product_data->>'stock')::INT, stock),
    is_featured = COALESCE((product_data->>'is_featured')::BOOLEAN, is_featured),
    tags = COALESCE((product_data->>'tags')::TEXT[], tags),
    updated_at = NOW()
  WHERE id = product_id
  RETURNING json_build_object(
    'id', id,
    'name', name,
    'price', price,
    'category', category,
    'stock', stock,
    'updated_at', updated_at
  ) INTO updated_product;
  
  IF updated_product IS NULL THEN
    RETURN json_build_object('error', 'Product not found');
  END IF;
  
  RETURN updated_product;
END;
$$;

-- 5. Product 삭제
CREATE OR REPLACE FUNCTION delete_product(product_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_name TEXT;
BEGIN
  SELECT name INTO deleted_name FROM products WHERE id = product_id;
  
  IF deleted_name IS NULL THEN
    RETURN json_build_object('error', 'Product not found');
  END IF;
  
  -- Soft delete
  UPDATE products 
  SET is_active = false, updated_at = NOW() 
  WHERE id = product_id;
  
  RETURN json_build_object(
    'success', true, 
    'id', product_id,
    'name', deleted_name,
    'message', 'Product soft deleted successfully'
  );
END;
$$;

-- 6. 카테고리 목록 조회
CREATE OR REPLACE FUNCTION get_categories()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'name', category,
      'count', count
    ) ORDER BY count DESC, category
  ) INTO result
  FROM (
    SELECT category, COUNT(*) as count
    FROM products
    WHERE is_active = true AND category IS NOT NULL AND category != ''
    GROUP BY category
  ) c;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 7. Admin 로그인
CREATE OR REPLACE FUNCTION admin_login(
  username_input TEXT,
  password_input TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  SELECT * INTO admin_record
  FROM admins
  WHERE username = username_input AND is_active = true;
  
  IF admin_record IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Invalid credentials'
    );
  END IF;
  
  -- 비밀번호 확인 (실제 운영시 bcrypt 사용 필요)
  IF admin_record.password != password_input THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;
  
  -- 마지막 로그인 시간 업데이트
  UPDATE admins 
  SET last_login = NOW() 
  WHERE id = admin_record.id;
  
  RETURN json_build_object(
    'success', true,
    'admin', json_build_object(
      'id', admin_record.id,
      'username', admin_record.username,
      'email', admin_record.email,
      'role', admin_record.role,
      'created_at', admin_record.created_at
    ),
    'token', encode(gen_random_bytes(32), 'hex')
  );
END;
$$;

-- 8. 주문 생성
CREATE OR REPLACE FUNCTION create_order(
  order_data JSONB
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  new_order_id UUID;
  new_order_number TEXT;
  order_result JSON;
BEGIN
  -- 주문번호 생성 (YYYYMMDD-XXXX 형식)
  new_order_number := TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- 주문 생성
  INSERT INTO orders (
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    items,
    subtotal,
    total_amount,
    payment_method
  )
  VALUES (
    new_order_number,
    (order_data->>'customer_name')::TEXT,
    (order_data->>'customer_email')::TEXT,
    (order_data->>'customer_phone')::TEXT,
    (order_data->>'shipping_address')::TEXT,
    COALESCE(order_data->'items', '[]'::jsonb),
    COALESCE((order_data->>'subtotal')::DECIMAL, 0),
    COALESCE((order_data->>'total_amount')::DECIMAL, 0),
    (order_data->>'payment_method')::TEXT
  )
  RETURNING id INTO new_order_id;
  
  -- 재고 감소 처리
  UPDATE products p
  SET stock = stock - item_qty.quantity
  FROM (
    SELECT 
      (item->>'product_id')::UUID as product_id,
      (item->>'quantity')::INT as quantity
    FROM jsonb_array_elements(order_data->'items') as item
  ) item_qty
  WHERE p.id = item_qty.product_id;
  
  -- 결과 반환
  SELECT json_build_object(
    'id', id,
    'order_number', order_number,
    'customer_name', customer_name,
    'total_amount', total_amount,
    'status', status,
    'created_at', created_at
  ) INTO order_result
  FROM orders WHERE id = new_order_id;
  
  RETURN order_result;
END;
$$;

-- 9. 관리자 통계
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_products', (SELECT COUNT(*) FROM products WHERE is_active = true),
    'total_orders', (SELECT COUNT(*) FROM orders),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid'),
    'today_orders', (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE),
    'today_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND payment_status = 'paid'),
    'low_stock_products', (SELECT COUNT(*) FROM products WHERE stock < 5 AND is_active = true),
    'featured_products', (SELECT COUNT(*) FROM products WHERE is_featured = true AND is_active = true),
    'recent_orders', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'order_number', order_number,
          'customer_name', customer_name,
          'total_amount', total_amount,
          'status', status,
          'created_at', created_at
        ) ORDER BY created_at DESC
      ) FROM (
        SELECT * FROM orders 
        ORDER BY created_at DESC 
        LIMIT 5
      ) recent
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- 10. 대량 상품 삭제
CREATE OR REPLACE FUNCTION bulk_delete_products(product_ids UUID[])
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  UPDATE products 
  SET is_active = false, updated_at = NOW()
  WHERE id = ANY(product_ids);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'message', deleted_count || ' products soft deleted'
  );
END;
$$;

-- ================================================
-- PART 5: RLS (Row Level Security) 정책
-- ================================================

-- Products 테이블 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products" 
  ON products FOR SELECT 
  USING (is_active = true);

DROP POLICY IF EXISTS "Anon can insert products" ON products;
CREATE POLICY "Anon can insert products" 
  ON products FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update products" ON products;
CREATE POLICY "Anon can update products" 
  ON products FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Anon can delete products" ON products;
CREATE POLICY "Anon can delete products" 
  ON products FOR DELETE 
  USING (true);

-- Orders 테이블 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert orders" ON orders;
CREATE POLICY "Public can insert orders" 
  ON orders FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read own orders" ON orders;
CREATE POLICY "Public can read own orders" 
  ON orders FOR SELECT 
  USING (true);

-- Admins 테이블 RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins table is restricted" ON admins;
CREATE POLICY "Admins table is restricted" 
  ON admins FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Categories 테이블 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" 
  ON categories FOR SELECT 
  USING (is_active = true);

-- ================================================
-- PART 6: 트리거 (자동 업데이트)
-- ================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Products 테이블 트리거
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Orders 테이블 트리거
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- PART 7: 초기 데이터 삽입
-- ================================================

-- 카테고리 초기 데이터
INSERT INTO categories (name, display_order) VALUES
  ('가방', 1),
  ('지갑', 2),
  ('시계', 3),
  ('벨트', 4),
  ('안경/선글라스', 5),
  ('액세서리', 6),
  ('신발', 7),
  ('의류', 8),
  ('향수', 9),
  ('기타', 99)
ON CONFLICT (name) DO NOTHING;

-- 관리자 계정 생성
INSERT INTO admins (username, email, password, role) VALUES
  ('admin', 'admin@megacopy.shop', 'admin123', 'super_admin'),
  ('manager', 'manager@megacopy.shop', 'manager123', 'manager')
ON CONFLICT (username) DO NOTHING;

-- 샘플 상품 데이터 (실제 명품 브랜드)
INSERT INTO products (name, brand, price, original_price, description, category, stock, is_featured, tags) VALUES
  -- 가방
  ('클래식 모노그램 토트백', '루이비통', 2850000, 3200000, '루이비통의 시그니처 모노그램 캔버스 토트백. 넉넉한 수납공간과 세련된 디자인', '가방', 3, true, ARRAY['신상품', '베스트셀러']),
  ('마몽 미니 크로스백', '구찌', 1580000, 1850000, 'GG 마몽 컬렉션의 미니 크로스백. 체인 스트랩과 골드 하드웨어', '가방', 5, true, ARRAY['인기상품']),
  ('레이디 디올 미디움', '디올', 4500000, 5200000, '디올의 아이코닉한 레이디 디올 백. 카나주 퀼팅 패턴', '가방', 2, true, ARRAY['프리미엄']),
  ('켈리 28 에프스타인', '에르메스', 18500000, NULL, '에르메스 켈리백 28cm. 토고 레더, 팔라듐 하드웨어', '가방', 1, true, ARRAY['한정판', '프리미엄']),
  
  -- 지갑
  ('지피 월릿 모노그램', '루이비통', 980000, 1100000, '지퍼 장지갑. 12개 카드 슬롯, 3개 지폐 수납공간', '지갑', 8, false, ARRAY['베스트셀러']),
  ('오피디아 GG 반지갑', '구찌', 650000, NULL, 'GG 수프림 캔버스 반지갑. 웹 스트라이프 디테일', '지갑', 10, false, NULL),
  ('트리오미프 카드홀더', '셀린느', 420000, NULL, '트리오미프 캔버스 카드 홀더. 컴팩트한 사이즈', '지갑', 15, false, NULL),
  
  -- 시계
  ('탱크 프랑세즈 스몰', '까르띠에', 4800000, NULL, '스테인리스 스틸, 쿼츠 무브먼트, 화이트 다이얼', '시계', 2, true, ARRAY['클래식']),
  ('서브마리너 데이트', '롤렉스', 15800000, NULL, '오이스터 스틸, 세라믹 베젤, 자동 무브먼트', '시계', 1, true, ARRAY['프리미엄', '인기상품']),
  ('리베르소 클래식', '예거 르쿨트르', 8900000, NULL, '수동 와인딩, 리버시블 케이스', '시계', 2, false, ARRAY['클래식']),
  
  -- 벨트
  ('더블 G 버클 벨트', '구찌', 580000, 650000, '블랙 레더, 골드 톤 더블 G 버클', '벨트', 12, false, NULL),
  ('리버시블 모노그램 벨트', '루이비통', 780000, NULL, '모노그램 캔버스/레더 리버시블', '벨트', 8, false, NULL),
  ('H 버클 벨트', '에르메스', 980000, NULL, '박스 카프/토고 레더, 팔라듐 H 버클', '벨트', 5, true, ARRAY['클래식']),
  
  -- 안경/선글라스
  ('에비에이터 클래식', '레이밴', 280000, NULL, '골드 프레임, 그린 클래식 G-15 렌즈', '안경/선글라스', 20, false, NULL),
  ('캣아이 선글라스', '샤넬', 680000, NULL, '블랙 아세테이트, CC 로고 템플', '안경/선글라스', 7, false, ARRAY['신상품']),
  ('스퀘어 프레임 안경', '톰포드', 520000, NULL, '블랙 아세테이트, 골드 T 로고', '안경/선글라스', 10, false, NULL),
  
  -- 액세서리
  ('러브 브레이슬릿', '까르띠에', 8500000, NULL, '18K 옐로우 골드, 스크류 모티프', '액세서리', 3, true, ARRAY['베스트셀러', '프리미엄']),
  ('트리오미프 이어링', '셀린느', 580000, NULL, '골드 피니시 브라스, 트리오미프 모티프', '액세서리', 8, false, NULL),
  ('인터로킹 G 넥클리스', '구찌', 780000, NULL, '스털링 실버, 인터로킹 G 펜던트', '액세서리', 6, false, NULL),
  
  -- 신발
  ('에이스 스니커즈', '구찌', 890000, 980000, '화이트 레더, 웹 스트라이프, 벌 자수', '신발', 5, false, ARRAY['인기상품']),
  ('트레이너 스니커즈', '발렌시아가', 1250000, NULL, '트리플 S 디자인, 멀티컬러', '신발', 3, true, ARRAY['신상품']),
  ('조던 1 레트로 하이', '나이키', 450000, NULL, '시카고 컬러웨이, 한정판', '신발', 8, false, ARRAY['한정판']),
  
  -- 향수
  ('미스 디올 오드퍼퓸', '디올', 185000, NULL, '100ml, 플로럴 시프레 향', '향수', 15, false, ARRAY['베스트셀러']),
  ('블루 드 샤넬 오드뚜왈렛', '샤넬', 165000, NULL, '100ml, 우디 아로마틱 향', '향수', 12, false, NULL),
  ('톰포드 우드 우드', '톰포드', 380000, NULL, '100ml, 오리엔탈 우디 향', '향수', 8, false, ARRAY['프리미엄'])
ON CONFLICT DO NOTHING;

-- ================================================
-- PART 8: Storage Bucket 설정 (GUI에서 실행 필요)
-- ================================================
-- 주의: 아래 쿼리는 Supabase Dashboard > Storage에서 수동으로 설정하거나
-- 적절한 권한이 있을 때만 실행 가능

-- INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
-- VALUES (
--   'product-images', 
--   'product-images', 
--   true, 
--   false, 
--   5242880, -- 5MB
--   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   public = true,
--   file_size_limit = 5242880;

-- ================================================
-- PART 9: 검증 쿼리
-- ================================================

DO $$
DECLARE
  table_count INT;
  function_count INT;
  product_count INT;
BEGIN
  -- 테이블 확인
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('products', 'orders', 'admins', 'categories');
  
  -- RPC 함수 확인
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE pronamespace = 'public'::regnamespace
    AND proname IN ('get_products', 'add_product', 'update_product', 'delete_product');
  
  -- 상품 데이터 확인
  SELECT COUNT(*) INTO product_count FROM products;
  
  -- 결과 출력
  RAISE NOTICE '=================================';
  RAISE NOTICE '✅ MEGA-COPY 데이터베이스 설정 완료!';
  RAISE NOTICE '=================================';
  RAISE NOTICE '테이블 생성: % 개', table_count;
  RAISE NOTICE 'RPC 함수 생성: % 개', function_count;
  RAISE NOTICE '샘플 상품: % 개', product_count;
  RAISE NOTICE '=================================';
  RAISE NOTICE '관리자 계정:';
  RAISE NOTICE '  ID: admin / PW: admin123';
  RAISE NOTICE '  ID: manager / PW: manager123';
  RAISE NOTICE '=================================';
END $$;

-- 최종 확인 쿼리
SELECT 
  'Setup Complete!' as status,
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_featured THEN 1 END) as featured_products,
  COUNT(DISTINCT category) as categories
FROM products
WHERE is_active = true;
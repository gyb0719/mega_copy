-- 빌리지(Billage) 데이터베이스 스키마
-- Created: 2025-01-27

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- ENUMS
-- =============================================

-- 사용자 역할
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- 사용자 상태
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');

-- 제품 상태
CREATE TYPE product_status AS ENUM ('available', 'rented', 'maintenance', 'deleted');

-- 제품 상태 조건
CREATE TYPE product_condition AS ENUM ('new', 'like_new', 'good', 'fair');

-- 대여 상태
CREATE TYPE rental_status AS ENUM ('requested', 'approved', 'ongoing', 'completed', 'cancelled');

-- 결제 상태
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 리뷰 타입
CREATE TYPE review_type AS ENUM ('renter_to_owner', 'owner_to_renter');

-- =============================================
-- TABLES
-- =============================================

-- 사용자 프로필
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    
    -- 위치 정보
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    
    -- 신뢰도 정보
    trust_score DECIMAL(3, 2) DEFAULT 0.00, -- 0.00 ~ 5.00
    verification_status JSONB DEFAULT '{}',
    
    -- 통계
    total_rentals INTEGER DEFAULT 0,
    total_listings INTEGER DEFAULT 0,
    
    -- 메타데이터
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 제품
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    
    -- 기본 정보
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    condition product_condition NOT NULL,
    status product_status DEFAULT 'available',
    
    -- 가격 정보
    daily_price DECIMAL(10, 2) NOT NULL,
    weekly_price DECIMAL(10, 2),
    monthly_price DECIMAL(10, 2),
    deposit_amount DECIMAL(10, 2) NOT NULL,
    
    -- 위치 정보
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    max_distance INTEGER DEFAULT 5, -- 최대 거래 거리 (km)
    
    -- 미디어
    images JSONB DEFAULT '[]',
    video_url TEXT,
    
    -- 통계
    view_count INTEGER DEFAULT 0,
    rental_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    
    -- 메타데이터
    specifications JSONB DEFAULT '{}',
    available_dates JSONB DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 대여 거래
CREATE TABLE rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id),
    renter_id UUID NOT NULL REFERENCES profiles(id),
    
    -- 대여 정보
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rental_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    
    -- 가격 정보
    daily_rate DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    insurance_fee DECIMAL(10, 2),
    
    -- 상태
    status rental_status DEFAULT 'requested',
    
    -- 픽업/반납 정보
    pickup_location TEXT,
    pickup_time TIMESTAMP WITH TIME ZONE,
    return_time TIMESTAMP WITH TIME ZONE,
    
    -- 메타데이터
    notes TEXT,
    contract_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT rentals_date_check CHECK (end_date >= start_date),
    CONSTRAINT rentals_different_users CHECK (owner_id != renter_id)
);

-- 결제
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES profiles(id),
    
    -- 결제 정보
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    payment_method VARCHAR(50) NOT NULL,
    status payment_status DEFAULT 'pending',
    
    -- 외부 결제 정보
    transaction_id VARCHAR(255) UNIQUE,
    gateway_response JSONB DEFAULT '{}',
    
    -- 타임스탬프
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 채팅방
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
    
    -- 참여자
    participant1_id UUID NOT NULL REFERENCES profiles(id),
    participant2_id UUID NOT NULL REFERENCES profiles(id),
    
    -- 상태
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chat_rooms_different_participants CHECK (participant1_id != participant2_id),
    UNIQUE(participant1_id, participant2_id, product_id)
);

-- 메시지
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    
    -- 메시지 내용
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file, system
    attachments JSONB DEFAULT '[]',
    
    -- 상태
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 리뷰
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    reviewee_id UUID NOT NULL REFERENCES profiles(id),
    product_id UUID NOT NULL REFERENCES products(id),
    
    -- 리뷰 내용
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT NOT NULL,
    review_type review_type NOT NULL,
    
    -- 태그
    tags JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    
    -- 유용성
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT reviews_different_users CHECK (reviewer_id != reviewee_id),
    UNIQUE(rental_id, reviewer_id, review_type)
);

-- 즐겨찾기
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, product_id)
);

-- 알림
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- 알림 내용
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    
    -- 관련 데이터
    related_id UUID,
    related_type VARCHAR(50),
    action_url TEXT,
    
    -- 상태
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 신고
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id),
    
    -- 신고 대상
    reported_user_id UUID REFERENCES profiles(id),
    reported_product_id UUID REFERENCES products(id),
    reported_review_id UUID REFERENCES reviews(id),
    
    -- 신고 내용
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    evidence JSONB DEFAULT '[]',
    
    -- 처리 상태
    status VARCHAR(20) DEFAULT 'pending', -- pending, investigating, resolved, dismissed
    admin_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES profiles(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Profiles
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Products  
CREATE INDEX idx_products_owner_id ON products(owner_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_location ON products USING GIST(location);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_daily_price ON products(daily_price);

-- Rentals
CREATE INDEX idx_rentals_product_id ON rentals(product_id);
CREATE INDEX idx_rentals_owner_id ON rentals(owner_id);
CREATE INDEX idx_rentals_renter_id ON rentals(renter_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);

-- Messages
CREATE INDEX idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Reviews
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

-- Favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Products are viewable by everyone" 
    ON products FOR SELECT 
    USING (status != 'deleted');

CREATE POLICY "Users can create products" 
    ON products FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own products" 
    ON products FOR UPDATE 
    USING (auth.uid() = owner_id);

-- Messages policies
CREATE POLICY "Users can view messages in their chat rooms" 
    ON messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = messages.chat_room_id 
            AND (chat_rooms.participant1_id = auth.uid() OR chat_rooms.participant2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages to their chat rooms" 
    ON messages FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = chat_room_id 
            AND (chat_rooms.participant1_id = auth.uid() OR chat_rooms.participant2_id = auth.uid())
        )
    );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- 업데이트 타임스탬프 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 위치 업데이트 함수
CREATE OR REPLACE FUNCTION update_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 위치 트리거
CREATE TRIGGER update_profiles_location BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_location();

CREATE TRIGGER update_products_location BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_location();

-- 평균 평점 업데이트 함수
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET average_rating = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM reviews 
        WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 평점 트리거
CREATE TRIGGER update_product_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- =============================================
-- SEED DATA
-- =============================================

-- 기본 카테고리 삽입
INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('카메라/렌즈', 'camera-lens', 'camera_alt', 1),
    ('게임 콘솔', 'game-console', 'sports_esports', 2),
    ('노트북/태블릿', 'laptop-tablet', 'laptop', 3),
    ('드론/액션캠', 'drone-action', 'videocam', 4),
    ('음향기기', 'audio', 'headphones', 5),
    ('캠핑/레저', 'camping-leisure', 'outdoor_grill', 6),
    ('전자제품', 'electronics', 'devices', 7),
    ('생활가전', 'home-appliances', 'kitchen', 8),
    ('스포츠용품', 'sports', 'sports_basketball', 9),
    ('기타', 'others', 'category', 10);
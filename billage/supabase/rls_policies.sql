-- Row Level Security (RLS) 정책 설정
-- 이 파일은 schema.sql 실행 후에 실행하세요

-- =============================================
-- Profiles 테이블 RLS
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 새 정책 생성
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- Products 테이블 RLS
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- 새 정책 생성
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (status != 'deleted');

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- Categories 테이블 RLS
-- =============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 카테고리는 모든 사용자가 읽을 수 있음
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- =============================================
-- Chat Rooms 테이블 RLS
-- =============================================
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can update their chat rooms" ON chat_rooms;

-- 새 정책 생성
CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms FOR SELECT
  USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

CREATE POLICY "Users can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

CREATE POLICY "Users can update their chat rooms"
  ON chat_rooms FOR UPDATE
  USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- =============================================
-- Chat Messages 테이블 RLS
-- =============================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;

-- 새 정책 생성
CREATE POLICY "Users can view messages in their chat rooms"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.participant1_id = auth.uid() 
           OR chat_rooms.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their chat rooms"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = room_id
      AND (chat_rooms.participant1_id = auth.uid() 
           OR chat_rooms.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- =============================================
-- Rentals 테이블 RLS
-- =============================================
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their rentals" ON rentals;
DROP POLICY IF EXISTS "Users can create rentals" ON rentals;
DROP POLICY IF EXISTS "Users can update their rentals" ON rentals;

-- 새 정책 생성
CREATE POLICY "Users can view their rentals"
  ON rentals FOR SELECT
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = renter_id
  );

CREATE POLICY "Users can create rentals"
  ON rentals FOR INSERT
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can update their rentals"
  ON rentals FOR UPDATE
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = renter_id
  );

-- =============================================
-- 성공 메시지
-- =============================================
SELECT 'RLS 정책 설정 완료!' as message;
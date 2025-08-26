-- chat_messages 테이블 생성 (messages 테이블 이름 변경)
-- 기존 messages 테이블이 있다면 삭제
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;

-- chat_messages 테이블 생성
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    
    -- 메시지 내용
    content TEXT NOT NULL,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- 상태
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_is_read ON chat_messages(is_read) WHERE is_read = false;

-- RLS 활성화
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;

-- RLS 정책 생성
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

-- 실시간 구독을 위한 Publication 설정
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 성공 메시지
SELECT 'chat_messages 테이블 생성 완료!' as message;
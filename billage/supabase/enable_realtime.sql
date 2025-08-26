-- 실시간 구독 활성화
-- Supabase Dashboard > Database > Replication에서도 설정 가능

-- Realtime Publication 생성 또는 업데이트
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
CREATE PUBLICATION supabase_realtime;

-- 실시간 구독할 테이블 추가
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 확인
SELECT 
  schemaname, 
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 성공 메시지
SELECT 'Realtime 구독 설정 완료!' as message;
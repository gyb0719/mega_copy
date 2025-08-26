-- Storage 버킷 생성만 (정책은 Dashboard에서 설정)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- 버킷이 생성되었는지 확인
SELECT * FROM storage.buckets;
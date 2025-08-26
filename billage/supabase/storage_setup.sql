-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS(Row Level Security) 활성화
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;
DROP POLICY IF EXISTS "Chat images are accessible to authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;

-- Storage 정책 설정
-- 아바타 이미지 정책
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 제품 이미지 정책
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'products' );

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update own product images"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can delete own product images"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 채팅 이미지 정책
CREATE POLICY "Chat images are accessible to authenticated users"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can upload chat images"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'chat-images' AND auth.role() = 'authenticated' );
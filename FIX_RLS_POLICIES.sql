-- Supabase RLS 정책 수정 (모든 사용자가 상품을 읽을 수 있도록)
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. products 테이블 RLS 비활성화 (개발용)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 또는 RLS를 활성화한 채로 모든 사용자에게 읽기 권한 부여
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- 
-- -- 기존 정책 삭제
-- DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
-- DROP POLICY IF EXISTS "Enable read access for all users" ON products;
-- DROP POLICY IF EXISTS "Enable insert for all users" ON products;
-- DROP POLICY IF EXISTS "Enable update for all users" ON products;
-- DROP POLICY IF EXISTS "Enable delete for all users" ON products;
-- 
-- -- 새로운 정책 생성 (모든 사용자 읽기 가능)
-- CREATE POLICY "Enable read access for all users" ON products
--   FOR SELECT USING (true);
-- 
-- -- 인증된 사용자만 생성/수정/삭제 가능 (선택사항)
-- CREATE POLICY "Enable insert for authenticated users" ON products
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Enable update for authenticated users" ON products
--   FOR UPDATE USING (true);
-- 
-- CREATE POLICY "Enable delete for authenticated users" ON products
--   FOR DELETE USING (true);

-- 2. product_images 테이블도 동일하게 처리
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- 3. Storage 버킷 권한 설정
-- Supabase 대시보드 > Storage > product-images 버킷에서
-- Public 버킷으로 설정하거나 RLS 정책을 수정하세요
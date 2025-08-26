-- 테스트 카테고리 삽입
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('카메라', 'camera', 'camera_alt', 1),
  ('렌즈', 'lens', 'camera', 2),
  ('노트북', 'laptop', 'laptop_mac', 3),
  ('태블릿', 'tablet', 'tablet_mac', 4),
  ('스마트폰', 'smartphone', 'smartphone', 5),
  ('게임기', 'gaming', 'sports_esports', 6),
  ('드론', 'drone', 'flight', 7),
  ('액션캠', 'action-cam', 'videocam', 8),
  ('기타', 'others', 'devices_other', 9)
ON CONFLICT (slug) DO NOTHING;

-- 테스트 사용자 생성 안내
-- Supabase Dashboard > Authentication > Users에서:
-- 1. "Invite User" 클릭
-- 2. 테스트 이메일 입력 (예: test1@example.com, test2@example.com)
-- 3. 인증 이메일에서 비밀번호 설정

-- 사용자 프로필은 회원가입 시 자동 생성됩니다 (auth trigger 필요)
-- 아래는 트리거 생성 SQL입니다:

-- 새 사용자 등록 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 테스트 제품 데이터 (사용자 생성 후 실행)
-- 주의: owner_id와 category_id를 실제 값으로 변경해야 합니다
/*
INSERT INTO products (
  owner_id,
  category_id,
  title,
  description,
  brand,
  model,
  condition,
  status,
  daily_price,
  weekly_price,
  monthly_price,
  deposit_amount,
  address,
  latitude,
  longitude,
  images
) VALUES
(
  (SELECT id FROM profiles LIMIT 1),  -- 첫 번째 사용자
  (SELECT id FROM categories WHERE slug = 'camera' LIMIT 1),
  'Sony A7 III 미러리스 카메라',
  '풀프레임 센서, 4K 동영상 촬영 가능한 전문가용 카메라입니다. 박스풀셋이며 상태 매우 좋습니다.',
  'Sony',
  'A7 III',
  'like_new',
  'available',
  50000,
  280000,
  900000,
  200000,
  '서울특별시 강남구 테헤란로',
  37.5063,
  127.0536,
  '["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=2"]'
),
(
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'laptop' LIMIT 1),
  'MacBook Pro 14인치 M3',
  '최신 M3 칩셋 탑재, 16GB RAM, 512GB SSD. 개발 작업에 최적화된 노트북입니다.',
  'Apple',
  'MacBook Pro 14"',
  'like_new',
  'available',
  70000,
  400000,
  1200000,
  300000,
  '서울특별시 서초구 서초대로',
  37.4954,
  127.0245,
  '["https://picsum.photos/400/300?random=3", "https://picsum.photos/400/300?random=4"]'
),
(
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'gaming' LIMIT 1),
  'PlayStation 5 디지털 에디션',
  '최신 게임 콘솔, 컨트롤러 2개 포함. 인기 게임 타이틀도 함께 대여 가능합니다.',
  'Sony',
  'PS5 Digital',
  'good',
  'available',
  30000,
  180000,
  600000,
  150000,
  '서울특별시 마포구 와우산로',
  37.5547,
  126.9239,
  '["https://picsum.photos/400/300?random=5", "https://picsum.photos/400/300?random=6"]'
);
*/
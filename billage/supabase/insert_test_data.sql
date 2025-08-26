-- 테스트 데이터 삽입
-- 주의: 테스트 사용자를 먼저 생성한 후 실행하세요!

-- 1. 카테고리 삽입 (이미 있으면 무시)
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

-- 2. 테스트 제품 데이터 삽입
-- 먼저 사용자 ID와 카테고리 ID를 변수에 저장
DO $$
DECLARE
  v_user_id UUID;
  v_camera_cat_id UUID;
  v_laptop_cat_id UUID;
  v_gaming_cat_id UUID;
  v_tablet_cat_id UUID;
BEGIN
  -- 첫 번째 프로필 사용자 ID 가져오기
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  -- 카테고리 ID 가져오기
  SELECT id INTO v_camera_cat_id FROM categories WHERE slug = 'camera';
  SELECT id INTO v_laptop_cat_id FROM categories WHERE slug = 'laptop';
  SELECT id INTO v_gaming_cat_id FROM categories WHERE slug = 'gaming';
  SELECT id INTO v_tablet_cat_id FROM categories WHERE slug = 'tablet';
  
  -- 사용자가 있을 경우에만 제품 삽입
  IF v_user_id IS NOT NULL THEN
    -- 카메라 제품
    INSERT INTO products (
      owner_id, category_id, title, description, brand, model,
      condition, status, daily_price, weekly_price, monthly_price,
      deposit_amount, address, latitude, longitude, images, specifications
    ) VALUES (
      v_user_id, v_camera_cat_id,
      'Sony A7 III 미러리스 카메라',
      '풀프레임 센서, 4K 동영상 촬영 가능한 전문가용 카메라입니다. 박스풀셋이며 상태 매우 좋습니다.',
      'Sony', 'A7 III', 'like_new', 'available',
      50000, 280000, 900000, 200000,
      '서울특별시 강남구 테헤란로', 37.5063, 127.0536,
      '["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=2"]'::jsonb,
      '{"센서": "35mm 풀프레임", "화소": "2420만", "ISO": "100-51200", "동영상": "4K 30fps"}'::jsonb
    );

    -- 노트북 제품
    INSERT INTO products (
      owner_id, category_id, title, description, brand, model,
      condition, status, daily_price, weekly_price, monthly_price,
      deposit_amount, address, latitude, longitude, images, specifications
    ) VALUES (
      v_user_id, v_laptop_cat_id,
      'MacBook Pro 14인치 M3 Pro',
      '최신 M3 Pro 칩셋 탑재, 16GB RAM, 512GB SSD. 개발 작업에 최적화된 노트북입니다.',
      'Apple', 'MacBook Pro 14"', 'like_new', 'available',
      70000, 400000, 1200000, 300000,
      '서울특별시 서초구 서초대로', 37.4954, 127.0245,
      '["https://picsum.photos/400/300?random=3", "https://picsum.photos/400/300?random=4"]'::jsonb,
      '{"프로세서": "M3 Pro", "RAM": "16GB", "저장공간": "512GB SSD", "디스플레이": "14.2인치 Liquid Retina XDR"}'::jsonb
    );

    -- 게임기 제품
    INSERT INTO products (
      owner_id, category_id, title, description, brand, model,
      condition, status, daily_price, weekly_price, monthly_price,
      deposit_amount, address, latitude, longitude, images, specifications
    ) VALUES (
      v_user_id, v_gaming_cat_id,
      'PlayStation 5 디지털 에디션',
      '최신 게임 콘솔, 컨트롤러 2개 포함. 인기 게임 타이틀도 함께 대여 가능합니다.',
      'Sony', 'PS5 Digital', 'good', 'available',
      30000, 180000, 600000, 150000,
      '서울특별시 마포구 와우산로', 37.5547, 126.9239,
      '["https://picsum.photos/400/300?random=5", "https://picsum.photos/400/300?random=6"]'::jsonb,
      '{"저장공간": "825GB SSD", "컨트롤러": "DualSense 2개", "최대해상도": "4K", "프레임": "최대 120fps"}'::jsonb
    );

    -- 태블릿 제품
    INSERT INTO products (
      owner_id, category_id, title, description, brand, model,
      condition, status, daily_price, weekly_price, monthly_price,
      deposit_amount, address, latitude, longitude, images, specifications
    ) VALUES (
      v_user_id, v_tablet_cat_id,
      'iPad Pro 12.9" 6세대',
      'M2 칩 탑재, 256GB WiFi 모델. 애플펜슬 2세대, 매직키보드 포함.',
      'Apple', 'iPad Pro 12.9"', 'like_new', 'available',
      40000, 230000, 700000, 200000,
      '서울특별시 성동구 왕십리로', 37.5615, 127.0372,
      '["https://picsum.photos/400/300?random=7", "https://picsum.photos/400/300?random=8"]'::jsonb,
      '{"화면크기": "12.9인치", "프로세서": "M2", "저장공간": "256GB", "액세서리": "애플펜슬2, 매직키보드"}'::jsonb
    );

    RAISE NOTICE '테스트 제품 데이터 삽입 완료!';
  ELSE
    RAISE NOTICE '사용자가 없습니다. 먼저 테스트 사용자를 생성해주세요.';
  END IF;
END $$;

-- 삽입된 데이터 확인
SELECT 
  p.title,
  c.name as category,
  p.daily_price,
  p.status
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC;
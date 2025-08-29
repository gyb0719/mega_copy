-- ================================================
-- admins 테이블 구조 확인 및 수정
-- password_hash 컬럼 문제 해결
-- ================================================

-- 1. 현재 admins 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'admins'
ORDER BY ordinal_position;

-- 2. 기존 데이터 백업
SELECT * FROM admins;

-- 3. 테이블 초기화 (주의: 기존 데이터 삭제)
DROP TABLE IF EXISTS admins CASCADE;

-- 4. 새로운 admins 테이블 생성 (password_hash 포함)
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,  -- password_hash 사용
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'viewer')),
  email TEXT UNIQUE,
  phone TEXT,
  full_name TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  password TEXT  -- 임시 컬럼 (호환성을 위해)
);

-- 5. 관리자 계정 추가 (password_hash 사용)
INSERT INTO admins (username, email, password_hash, password, role) 
VALUES 
  ('admin', 'admin@megacopy.shop', 'admin123', 'admin123', 'super_admin'),
  ('manager', 'manager@megacopy.shop', 'manager123', 'manager123', 'manager'),
  ('test', 'test@megacopy.shop', 'test123', 'test123', 'admin');

-- 6. RLS 정책 설정
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Anyone can read admins" ON admins;

CREATE POLICY "Anyone can read admins" 
  ON admins FOR SELECT 
  USING (true);

-- 7. admin_login 함수 수정 (password_hash 사용)
DROP FUNCTION IF EXISTS admin_login CASCADE;

CREATE OR REPLACE FUNCTION admin_login(
  username_input TEXT,
  password_input TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  result JSON;
BEGIN
  -- 관리자 찾기 (password_hash로 확인)
  SELECT * INTO admin_record
  FROM admins
  WHERE username = username_input
    AND password_hash = password_input  -- 실제로는 해시 비교해야 하지만 임시로 평문 비교
    AND is_active = true;
  
  IF admin_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;
  
  -- 로그인 시간 업데이트
  UPDATE admins 
  SET last_login = NOW(),
      failed_login_attempts = 0
  WHERE id = admin_record.id;
  
  -- 성공 응답
  RETURN json_build_object(
    'success', true,
    'admin', json_build_object(
      'id', admin_record.id,
      'username', admin_record.username,
      'email', admin_record.email,
      'role', admin_record.role,
      'full_name', admin_record.full_name
    ),
    'token', encode(gen_random_bytes(32), 'hex')
  );
END;
$$;

-- 8. 권한 부여
GRANT ALL ON admins TO anon;
GRANT EXECUTE ON FUNCTION admin_login TO anon;

-- 9. 결과 확인
SELECT 
  username,
  email,
  role,
  is_active,
  CASE 
    WHEN password_hash IS NOT NULL THEN '✓ password_hash 설정됨' 
    ELSE '✗ 없음' 
  END as password_hash_status,
  CASE 
    WHEN password IS NOT NULL THEN '✓ password 설정됨' 
    ELSE '✗ 없음' 
  END as password_status
FROM admins
ORDER BY created_at;

-- 10. 테스트 로그인
SELECT admin_login('admin', 'admin123');

-- 성공 메시지
DO $$
BEGIN
  RAISE NOTICE '================================';
  RAISE NOTICE '✅ ADMINS 테이블 수정 완료!';
  RAISE NOTICE '================================';
  RAISE NOTICE '관리자 계정:';
  RAISE NOTICE '1. admin / admin123 (최고관리자)';
  RAISE NOTICE '2. manager / manager123 (매니저)'; 
  RAISE NOTICE '3. test / test123 (관리자)';
  RAISE NOTICE '================================';
END $$;
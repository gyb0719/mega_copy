-- ================================================
-- admins 테이블 password 컬럼 문제 해결
-- 실행 순서: 이 스크립트를 먼저 실행한 후 COMPLETE_FIX_ALL.sql 실행
-- ================================================

-- 1. admins 테이블이 존재하는지 확인
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'admins'
  ) THEN
    -- 테이블이 없으면 생성
    CREATE TABLE admins (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'viewer')),
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP WITH TIME ZONE,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE '✅ admins 테이블 생성 완료';
  ELSE
    -- 테이블이 있으면 password 컬럼 확인 및 추가
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'admins'
      AND column_name = 'password'
    ) THEN
      ALTER TABLE admins 
      ADD COLUMN password TEXT NOT NULL DEFAULT 'temp_password';
      RAISE NOTICE '✅ password 컬럼 추가 완료';
    ELSE
      RAISE NOTICE '✓ password 컬럼이 이미 존재합니다';
    END IF;
  END IF;
END $$;

-- 2. 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'admins'
ORDER BY ordinal_position;

-- 3. 기존 데이터 확인
SELECT COUNT(*) as existing_admins FROM admins;

-- 4. 관리자 계정 추가 또는 업데이트
INSERT INTO admins (username, email, password, role) 
VALUES 
  ('admin', 'admin@megacopy.shop', 'admin123', 'super_admin'),
  ('manager', 'manager@megacopy.shop', 'manager123', 'manager'),
  ('test', 'test@megacopy.shop', 'test123', 'admin')
ON CONFLICT (username) 
DO UPDATE SET 
  password = EXCLUDED.password,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = true;

-- 5. 결과 확인
SELECT 
  username,
  email,
  role,
  is_active,
  CASE WHEN password IS NOT NULL THEN '✓ 설정됨' ELSE '✗ 없음' END as password_status
FROM admins
ORDER BY created_at;

-- 6. 성공 메시지
DO $$
BEGIN
  RAISE NOTICE '================================';
  RAISE NOTICE '✅ PASSWORD 컬럼 문제 해결 완료!';
  RAISE NOTICE '================================';
  RAISE NOTICE '관리자 계정:';
  RAISE NOTICE '1. admin / admin123 (최고관리자)';
  RAISE NOTICE '2. manager / manager123 (매니저)'; 
  RAISE NOTICE '3. test / test123 (관리자)';
  RAISE NOTICE '================================';
  RAISE NOTICE '다음 단계:';
  RAISE NOTICE '1. COMPLETE_FIX_ALL.sql 실행';
  RAISE NOTICE '2. Storage 버킷 설정 (Dashboard에서)';
  RAISE NOTICE '================================';
END $$;
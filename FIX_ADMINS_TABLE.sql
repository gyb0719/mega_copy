-- ================================================
-- ADMINS 테이블 수정 스크립트
-- password 컬럼 오류 해결
-- ================================================

-- 1. 기존 admins 테이블 확인 및 수정
-- ================================================

-- 옵션 1: 테이블이 이미 존재하고 password 컬럼만 없는 경우
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT 'admin123';

-- 옵션 2: 테이블을 완전히 재생성하는 경우 (주의: 기존 데이터 삭제됨)
-- DROP TABLE IF EXISTS admins CASCADE;
-- CREATE TABLE admins (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   username TEXT UNIQUE NOT NULL,
--   email TEXT UNIQUE,
--   password TEXT NOT NULL,
--   role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'viewer')),
--   is_active BOOLEAN DEFAULT true,
--   last_login TIMESTAMP WITH TIME ZONE,
--   metadata JSONB DEFAULT '{}',
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- 2. 관리자 계정 생성 (password 컬럼 존재 확인 후)
-- ================================================

-- 기존 데이터 삭제 (선택사항)
DELETE FROM admins WHERE username IN ('admin', 'test', 'manager');

-- 새 관리자 계정 추가
INSERT INTO admins (username, email, password, role) 
VALUES 
  ('admin', 'admin@megacopy.shop', 'admin123', 'super_admin'),
  ('manager', 'manager@megacopy.shop', 'manager123', 'manager'),
  ('test', 'test@megacopy.shop', 'test123', 'admin')
ON CONFLICT (username) 
DO UPDATE SET 
  password = EXCLUDED.password,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- 3. 테이블 구조 확인
-- ================================================

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'admins'
ORDER BY ordinal_position;

-- 4. 데이터 확인
-- ================================================

SELECT 
  username,
  email,
  role,
  CASE WHEN password IS NOT NULL THEN '✓ 설정됨' ELSE '✗ 없음' END as password_status
FROM admins;

-- 5. 성공 메시지
-- ================================================

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
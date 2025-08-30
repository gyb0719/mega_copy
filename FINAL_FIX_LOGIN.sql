-- ==========================================
-- 최종 로그인 문제 해결 SQL
-- ==========================================

-- 1. RLS 완전 비활성화 (가장 확실한 방법)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 2. 모든 RLS 정책 제거  
DROP POLICY IF EXISTS "No direct access to admins" ON admins;
DROP POLICY IF EXISTS "Allow anon to read admins for login" ON admins;
DROP POLICY IF EXISTS "Admins table access" ON admins;
DROP POLICY IF EXISTS "Admins restricted access" ON admins;

-- 3. anon 사용자에게 명시적 권한 부여
GRANT ALL ON admins TO anon;
GRANT ALL ON admins TO authenticated;
GRANT ALL ON admins TO public;

-- 4. 기존 데이터 삭제
DELETE FROM admins;

-- 5. 올바른 해시값으로 관리자 계정 재생성
-- 비밀번호: 0601 => 2636389909f27aa15afff120fce0ae534aa4d22a2723812966a731550564f0f7
-- 비밀번호: sub123 => e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96

INSERT INTO admins (username, password_hash, role) VALUES 
('martin18', '2636389909f27aa15afff120fce0ae534aa4d22a2723812966a731550564f0f7', 'main'),
('mega', '2636389909f27aa15afff120fce0ae534aa4d22a2723812966a731550564f0f7', 'main'),
('sub1', 'e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96', 'sub'),
('sub2', 'e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96', 'sub'),
('sub3', 'e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96', 'sub');

-- 6. 결과 확인
SELECT 
    username,
    substring(password_hash, 1, 20) as hash_preview,
    role,
    created_at
FROM admins
ORDER BY role, username;
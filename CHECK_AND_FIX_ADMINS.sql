-- 1. 현재 admins 테이블 상태 확인
SELECT 
    username,
    password_hash,
    role,
    created_at
FROM admins
ORDER BY username;

-- 2. 기존 데이터 모두 삭제
DELETE FROM admins;

-- 3. 올바른 해시값으로 관리자 계정 생성
-- 메인 관리자 (비밀번호: 0601)
INSERT INTO admins (username, password_hash, role) VALUES 
('martin18', '2636389909f27aa15afff120fce0ae534aa4d22a2723812966a731550564f0f7', 'main'),
('mega', '2636389909f27aa15afff120fce0ae534aa4d22a2723812966a731550564f0f7', 'main');

-- 서브 관리자 (비밀번호: sub123)
INSERT INTO admins (username, password_hash, role) VALUES 
('sub1', 'e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96', 'sub'),
('sub2', 'e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96', 'sub'),
('sub3', 'e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96', 'sub');

-- 4. 확인
SELECT 
    username,
    LEFT(password_hash, 20) as hash_preview,
    role,
    created_at
FROM admins
ORDER BY role, username;
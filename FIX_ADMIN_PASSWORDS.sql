-- 관리자 계정 비밀번호 수정
-- 올바른 SHA256 해시값 사용

-- 1. 기존 관리자 계정 삭제
DELETE FROM admins;

-- 2. 메인 관리자 계정 생성
-- martin18 / 0601
INSERT INTO admins (username, password_hash, role)
VALUES ('martin18', '2636389909f27aa15afff120fce0ae534aa4d22a2723812966a731550564f0f7', 'main');

-- mega / 0601  
INSERT INTO admins (username, password_hash, role)
VALUES ('mega', '2636389909f27aa15afff120fce0ae534aa4d22a2723812966a731550564f0f7', 'main');

-- 3. 서브 관리자 계정 생성
-- sub1 / sub123
INSERT INTO admins (username, password_hash, role)
VALUES ('sub1', 'e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96', 'sub');

-- sub2 / sub123
INSERT INTO admins (username, password_hash, role)
VALUES ('sub2', 'e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96', 'sub');

-- sub3 / sub123
INSERT INTO admins (username, password_hash, role)
VALUES ('sub3', 'e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96', 'sub');

-- 4. 확인
SELECT username, role, created_at 
FROM admins 
ORDER BY role, username;
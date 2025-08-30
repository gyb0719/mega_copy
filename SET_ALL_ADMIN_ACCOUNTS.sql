-- ========================================
-- 모든 관리자 계정 설정 (메인 + 서브)
-- ========================================

-- 비밀번호 해시값
-- 0601의 SHA256: f0e2ad5a4a08812dc8a49577b46ba78a088762549e7b991a34a6075e91e4e971
-- sub123의 SHA256: 0b0db19e2c8de3ce72a8ad68b1a879df8dc8e528497a438eca96c1fa5119cf8e

-- 1. 기존 관리자 계정 정리
DELETE FROM admins WHERE username IN ('admin', 'manager', 'test');

-- 2. 메인 관리자 계정 생성/업데이트
-- martin18 계정 (메인 관리자 1)
INSERT INTO admins (username, password_hash, role)
VALUES ('martin18', 'f0e2ad5a4a08812dc8a49577b46ba78a088762549e7b991a34a6075e91e4e971', 'main')
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- mega 계정 (메인 관리자 2)
INSERT INTO admins (username, password_hash, role)
VALUES ('mega', 'f0e2ad5a4a08812dc8a49577b46ba78a088762549e7b991a34a6075e91e4e971', 'main')
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- 3. 서브 관리자 계정 생성 (기본 비밀번호: sub123)
-- sub1 계정 (서브 관리자 1)
INSERT INTO admins (username, password_hash, role)
VALUES ('sub1', '0b0db19e2c8de3ce72a8ad68b1a879df8dc8e528497a438eca96c1fa5119cf8e', 'sub')
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- sub2 계정 (서브 관리자 2)
INSERT INTO admins (username, password_hash, role)
VALUES ('sub2', '0b0db19e2c8de3ce72a8ad68b1a879df8dc8e528497a438eca96c1fa5119cf8e', 'sub')
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- sub3 계정 (서브 관리자 3)
INSERT INTO admins (username, password_hash, role)
VALUES ('sub3', '0b0db19e2c8de3ce72a8ad68b1a879df8dc8e528497a438eca96c1fa5119cf8e', 'sub')
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- 4. 확인
SELECT 
    username,
    role,
    CASE 
        WHEN role = 'main' THEN '메인 관리자'
        WHEN role = 'sub' THEN '서브 관리자'
        ELSE role
    END as role_korean,
    created_at
FROM admins 
WHERE username IN ('martin18', 'mega', 'sub1', 'sub2', 'sub3')
ORDER BY 
    CASE role 
        WHEN 'main' THEN 1 
        WHEN 'sub' THEN 2 
        ELSE 3 
    END,
    username;
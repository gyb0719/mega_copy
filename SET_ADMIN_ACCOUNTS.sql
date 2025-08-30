-- ========================================
-- 관리자 계정 설정
-- ========================================

-- 비밀번호 해시값
-- 0601의 SHA256: f0e2ad5a4a08812dc8a49577b46ba78a088762549e7b991a34a6075e91e4e971

-- 1. 기존 관리자 계정 삭제 (필요시)
DELETE FROM admins WHERE username IN ('admin', 'manager', 'test');

-- 2. 새 관리자 계정 생성
-- martin18 계정 (메인 관리자)
INSERT INTO admins (username, password_hash, role)
VALUES ('martin18', 'f0e2ad5a4a08812dc8a49577b46ba78a088762549e7b991a34a6075e91e4e971', 'main')
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- mega 계정 (메인 관리자)
INSERT INTO admins (username, password_hash, role)
VALUES ('mega', 'f0e2ad5a4a08812dc8a49577b46ba78a088762549e7b991a34a6075e91e4e971', 'main')
ON CONFLICT (username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- 3. 확인
SELECT 
    username,
    role,
    created_at
FROM admins 
WHERE username IN ('martin18', 'mega')
ORDER BY created_at DESC;
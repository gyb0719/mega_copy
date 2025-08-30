-- admins 테이블의 RLS를 일시적으로 비활성화
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 또는 anon 사용자에게 읽기 권한 부여
GRANT SELECT ON admins TO anon;

-- RLS 정책 제거 후 다시 생성
DROP POLICY IF EXISTS "No direct access to admins" ON admins;

-- anon 사용자가 username으로 조회할 수 있도록 허용
CREATE POLICY "Allow anon to read admins for login"
ON admins FOR SELECT
TO anon
USING (true);

-- 확인
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admins';
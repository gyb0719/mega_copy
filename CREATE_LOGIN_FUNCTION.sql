-- ==========================================
-- 대체 방법: RPC 함수로 로그인 구현
-- ==========================================

-- 1. 로그인 검증 함수 생성
CREATE OR REPLACE FUNCTION public.verify_admin_login(
    input_username TEXT,
    input_password_hash TEXT
)
RETURNS TABLE (
    id UUID,
    username TEXT,
    role TEXT,
    is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER -- 중요: 함수 생성자(postgres) 권한으로 실행
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.username,
        a.role,
        (a.password_hash = input_password_hash) as is_valid
    FROM admins a
    WHERE a.username = input_username
    LIMIT 1;
    
    -- 결과가 없으면 빈 행 반환
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            FALSE::BOOLEAN;
    END IF;
END;
$$;

-- 2. 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.verify_admin_login TO anon;
GRANT EXECUTE ON FUNCTION public.verify_admin_login TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_login TO public;

-- 3. 테스트
SELECT * FROM verify_admin_login('martin18', '2636389909f27aa15afff120fce0ae534aa4d22a2723812966a731550564f0f7');
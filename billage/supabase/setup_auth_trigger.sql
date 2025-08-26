-- 새 사용자 등록 시 프로필 자동 생성 트리거

-- 함수 생성: 새 사용자 등록 시 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name, 
    email,
    avatar_url
  )
  VALUES (
    new.id,
    -- username: 이메일의 @ 앞부분 사용
    COALESCE(
      new.raw_user_meta_data->>'username', 
      split_part(new.email, '@', 1)
    ),
    -- full_name: 메타데이터에서 가져오거나 기본값
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    -- avatar_url: 메타데이터에서 가져오거나 null
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- 이미 프로필이 존재하면 무시
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 삭제 (이미 존재할 경우)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 성공 메시지
SELECT 'Auth 트리거 설정 완료! 이제 새 사용자가 가입하면 자동으로 프로필이 생성됩니다.' as message;
# Billage Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com)에 접속
2. 새 프로젝트 생성
3. 프로젝트 정보 입력:
   - Project name: `billage`
   - Database Password: 강력한 비밀번호 설정
   - Region: `Northeast Asia (Seoul)` 선택

## 2. 데이터베이스 스키마 적용

### SQL Editor에서 실행

1. Supabase Dashboard > SQL Editor 접속
2. `supabase/schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 실행

또는 아래 명령어로 직접 실행:

```bash
# Supabase CLI 설치 (없는 경우)
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref [your-project-ref]

# 스키마 적용
supabase db push
```

## 3. Storage 버킷 생성

SQL Editor에서 실행:

```sql
-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('chat-images', 'chat-images', true);

-- Storage 정책 설정
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Product images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'products' );

CREATE POLICY "Authenticated users can upload product images."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

CREATE POLICY "Chat images are accessible to chat participants."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-images' );
```

## 4. Row Level Security (RLS) 설정

SQL Editor에서 실행:

```sql
-- Profiles 테이블 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Products 테이블 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone."
  ON products FOR SELECT
  USING (status != 'deleted');

CREATE POLICY "Authenticated users can create products."
  ON products FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own products."
  ON products FOR UPDATE
  USING (auth.uid() = owner_id);

-- Chat Rooms 테이블 RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chat rooms."
  ON chat_rooms FOR SELECT
  USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

CREATE POLICY "Users can create chat rooms."
  ON chat_rooms FOR INSERT
  WITH CHECK (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- Chat Messages 테이블 RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chat rooms."
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.participant1_id = auth.uid() 
           OR chat_rooms.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their chat rooms."
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = room_id
      AND (chat_rooms.participant1_id = auth.uid() 
           OR chat_rooms.participant2_id = auth.uid())
    )
  );
```

## 5. Edge Functions 설정 (선택사항)

푸시 알림, 이메일 전송 등을 위한 Edge Functions:

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { userId, title, body, data } = await req.json()
  
  // FCM 또는 다른 푸시 서비스 연동
  // ...
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

## 6. 환경 변수 설정

### `.env` 파일 업데이트

Supabase Dashboard > Settings > API에서 값 복사:

```env
# Supabase Configuration
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
```

### `.env.example` 파일 생성

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# OAuth Keys (Optional)
KAKAO_API_KEY=
GOOGLE_CLIENT_ID=

# Map Services (Optional)
GOOGLE_MAPS_API_KEY=
KAKAO_MAP_API_KEY=

# Payment Gateway (Optional)
PORTONE_USER_CODE=
```

## 7. 테스트 데이터 삽입 (선택사항)

```sql
-- 테스트 카테고리 삽입
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('카메라', 'camera', 'camera_alt', 1),
  ('렌즈', 'lens', 'camera', 2),
  ('노트북', 'laptop', 'laptop_mac', 3),
  ('태블릿', 'tablet', 'tablet_mac', 4),
  ('스마트폰', 'smartphone', 'smartphone', 5),
  ('게임기', 'gaming', 'sports_esports', 6),
  ('드론', 'drone', 'flight', 7),
  ('액션캠', 'action-cam', 'videocam', 8);

-- 테스트 사용자는 Auth > Users에서 생성
```

## 8. 실시간 구독 설정

Supabase Dashboard > Database > Replication에서 다음 테이블 활성화:
- `chat_messages` 
- `chat_rooms`
- `products`

## 9. 앱 실행 및 테스트

```bash
# 의존성 설치
flutter pub get

# 코드 생성
flutter packages pub run build_runner build --delete-conflicting-outputs

# 앱 실행
flutter run
```

## 문제 해결

### 1. Authentication 오류
- Supabase Dashboard > Authentication > Providers 확인
- Email 인증 활성화 확인

### 2. Storage 업로드 실패
- 버킷 권한 정책 확인
- 파일 크기 제한 확인 (기본 50MB)

### 3. 실시간 업데이트 안됨
- Replication 설정 확인
- 네트워크 연결 상태 확인

## 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Flutter Supabase 패키지](https://pub.dev/packages/supabase_flutter)
- [Billage 프로젝트 문서](./README.md)
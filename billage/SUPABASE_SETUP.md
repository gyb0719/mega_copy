# 🚀 Supabase 설정 가이드

## 📋 목차
1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [데이터베이스 스키마 설정](#2-데이터베이스-스키마-설정)
3. [인증 설정](#3-인증-설정)
4. [스토리지 설정](#4-스토리지-설정)
5. [환경변수 설정](#5-환경변수-설정)
6. [Flutter 앱 연동](#6-flutter-앱-연동)

---

## 1. Supabase 프로젝트 생성

### 1.1 계정 생성
1. [Supabase](https://supabase.com) 접속
2. GitHub 계정으로 로그인
3. "New project" 클릭

### 1.2 프로젝트 설정
```
Project name: billage
Database Password: 강력한 비밀번호 생성
Region: Northeast Asia (Seoul)
Pricing Plan: Free tier (시작)
```

### 1.3 프로젝트 URL 및 키 확인
- Settings → API 메뉴에서 확인
- `Project URL`: https://xxxxx.supabase.co
- `anon public`: eyJhbGc...

---

## 2. 데이터베이스 스키마 설정

### 2.1 SQL 에디터에서 스키마 실행
1. SQL Editor 메뉴 진입
2. `supabase/schema.sql` 파일 내용 복사
3. 실행 (F5 또는 Run 버튼)

### 2.2 필수 RPC 함수 추가
```sql
-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET view_count = view_count + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 즐겨찾기 카운트 증가
CREATE OR REPLACE FUNCTION increment_favorite_count(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET favorite_count = favorite_count + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 즐겨찾기 카운트 감소
CREATE OR REPLACE FUNCTION decrement_favorite_count(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET favorite_count = GREATEST(0, favorite_count - 1)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 근처 제품 검색 (위치 기반)
CREATE OR REPLACE FUNCTION nearby_products(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE ST_DWithin(
    location::geography,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_km * 1000  -- km to meters
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 3. 인증 설정

### 3.1 이메일 인증
Authentication → Providers → Email
- Enable Email provider: ✅
- Confirm email: ✅ (프로덕션)
- Email template 커스터마이즈

### 3.2 OAuth 설정

#### Kakao OAuth
1. [Kakao Developers](https://developers.kakao.com) 에서 앱 생성
2. 플랫폼 추가 (Android, iOS)
3. Redirect URI 추가: `https://xxxxx.supabase.co/auth/v1/callback`
4. Supabase에서 설정:
```
Provider: Custom
Client ID: REST API 키
Client Secret: (비워둠)
Authorization URL: https://kauth.kakao.com/oauth/authorize
Token URL: https://kauth.kakao.com/oauth/token
User Info URL: https://kapi.kakao.com/v2/user/me
```

#### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com)
2. OAuth 2.0 클라이언트 생성
3. 승인된 리디렉션 URI: `https://xxxxx.supabase.co/auth/v1/callback`
4. Supabase Authentication → Providers → Google 활성화

#### Apple Sign In (iOS)
1. Apple Developer에서 Sign in with Apple 활성화
2. Service ID 생성
3. Supabase에서 Apple provider 설정

### 3.3 URL Configuration
Authentication → URL Configuration
```
Site URL: com.devyb.billage://
Redirect URLs: 
- com.devyb.billage://login-callback
- com.devyb.billage://reset-password
```

---

## 4. 스토리지 설정

### 4.1 버킷 생성
Storage → New bucket
```
Bucket name: products
Public: true (제품 이미지용)

Bucket name: avatars  
Public: true (프로필 이미지용)

Bucket name: chat-attachments
Public: false (채팅 첨부파일용)
```

### 4.2 정책 설정
각 버킷별 RLS 정책:

```sql
-- Products 버킷 정책
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.uid() IS NOT NULL);

-- Avatars 버킷 정책
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 5. 환경변수 설정

### 5.1 `.env` 파일 생성
`.env.example`을 복사하여 `.env` 생성:

```bash
cp .env.example .env
```

### 5.2 값 입력
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

### 5.3 Flutter에서 환경변수 로드
`lib/core/config/env_config.dart`:
```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';
  static String get kakaoApiKey => dotenv.env['KAKAO_API_KEY'] ?? '';
  // ... 기타 환경변수
}
```

---

## 6. Flutter 앱 연동

### 6.1 초기화 코드 수정
`lib/main.dart`:
```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'core/config/env_config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 환경변수 로드
  await dotenv.load(fileName: ".env");
  
  // Supabase 초기화
  await Supabase.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
      autoRefreshToken: true,
    ),
  );
  
  runApp(const ProviderScope(child: BillageApp()));
}
```

### 6.2 Deep Link 설정 (Android)
`android/app/src/main/AndroidManifest.xml`:
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="com.devyb.billage"
        android:host="login-callback" />
</intent-filter>
```

### 6.3 Deep Link 설정 (iOS)
`ios/Runner/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.devyb.billage</string>
        </array>
    </dict>
</array>
```

---

## 🧪 테스트

### 데이터베이스 연결 테스트
```dart
// 테스트 코드
final supabase = Supabase.instance.client;
final response = await supabase.from('categories').select();
print(response);
```

### 인증 테스트
```dart
// 회원가입 테스트
final response = await supabase.auth.signUp(
  email: 'test@example.com',
  password: 'testpassword123',
);
```

---

## 📚 참고 문서
- [Supabase Flutter 문서](https://supabase.com/docs/guides/flutter)
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [PostGIS 문서](https://postgis.net/documentation/)

---

## ⚠️ 주의사항
1. `.env` 파일은 절대 커밋하지 마세요
2. RLS(Row Level Security) 정책을 반드시 설정하세요
3. 프로덕션 환경에서는 이메일 인증을 활성화하세요
4. API 키는 클라이언트용(anon)과 서버용(service_role)을 구분해서 사용하세요
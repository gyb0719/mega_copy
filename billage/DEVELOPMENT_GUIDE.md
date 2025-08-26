# 🚀 빌리지(Billage) 개발 가이드

## 📱 빠른 시작

### 1. 프로젝트 설정
```bash
# 저장소 클론
git clone [repository-url]
cd billage

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 실제 API 키 입력

# 패키지 설치
flutter pub get

# 코드 생성
flutter pub run build_runner build --delete-conflicting-outputs
```

### 2. 앱 실행
```bash
# 개발 모드 실행
flutter run

# 또는 배치 파일 사용 (Windows)
run_billage.bat
```

## 🏗️ 프로젝트 구조

```
billage/
├── lib/
│   ├── core/               # 핵심 기능
│   │   ├── config/         # 환경 설정
│   │   ├── constants/      # 상수
│   │   ├── providers/      # 전역 Provider
│   │   └── theme/          # 테마
│   │
│   ├── data/               # 데이터 레이어
│   │   ├── models/         # 데이터 모델
│   │   └── repositories/   # Repository 패턴
│   │
│   ├── domain/             # 도메인 레이어
│   │   ├── entities/       # 엔티티
│   │   └── usecases/       # 유즈케이스
│   │
│   └── presentation/       # 프레젠테이션 레이어
│       ├── screens/        # 화면
│       ├── widgets/        # 재사용 위젯
│       └── providers/      # 화면별 Provider
│
├── assets/                 # 에셋 파일
├── supabase/              # Supabase 스키마
└── test/                  # 테스트
```

## 💻 개발 환경 설정

### 필수 도구
- Flutter SDK 3.24.0+
- Dart SDK 3.9.0+
- Android Studio / VS Code
- Git

### VS Code 확장 프로그램
- Flutter
- Dart
- Flutter Riverpod Snippets
- Error Lens
- GitLens

### Android Studio 플러그인
- Flutter
- Dart
- Flutter Enhancement Suite

## 🔧 주요 명령어

### Flutter 명령어
```bash
# 패키지 관련
flutter pub get                 # 패키지 설치
flutter pub upgrade             # 패키지 업그레이드
flutter pub outdated            # 오래된 패키지 확인

# 코드 생성
flutter pub run build_runner build --delete-conflicting-outputs  # 코드 생성
flutter pub run build_runner watch --delete-conflicting-outputs  # 파일 감시 모드

# 빌드
flutter build apk --debug       # 디버그 APK
flutter build apk --release     # 릴리즈 APK
flutter build ios --release     # iOS 릴리즈

# 테스트
flutter test                    # 테스트 실행
flutter test --coverage         # 커버리지 포함

# 분석
flutter analyze                 # 코드 분석
flutter doctor                  # Flutter 환경 체크
```

### Git 작업 흐름
```bash
# 기능 브랜치 생성
git checkout -b feature/기능명

# 작업 후 커밋
git add .
git commit -m "feat: 기능 설명"

# 푸시
git push origin feature/기능명

# PR 생성 후 리뷰 -> 머지
```

## 📝 코드 스타일 가이드

### 네이밍 규칙
- **파일명**: snake_case (예: `user_model.dart`)
- **클래스명**: PascalCase (예: `UserModel`)
- **변수/함수**: camelCase (예: `getUserInfo`)
- **상수**: SCREAMING_SNAKE_CASE (예: `MAX_RETRY_COUNT`)

### 폴더별 역할
- **models/**: 데이터 모델 (Freezed 사용)
- **repositories/**: API 통신 및 데이터 처리
- **providers/**: 상태 관리 (Riverpod)
- **screens/**: 전체 화면
- **widgets/**: 재사용 가능한 위젯

## 🧪 테스트

### 단위 테스트
```dart
// test/models/user_model_test.dart
test('UserModel should parse JSON correctly', () {
  final json = {'id': '123', 'name': 'Test'};
  final user = UserModel.fromJson(json);
  expect(user.id, '123');
});
```

### 위젯 테스트
```dart
// test/widgets/button_test.dart
testWidgets('Button should display text', (tester) async {
  await tester.pumpWidget(MyButton(text: 'Click'));
  expect(find.text('Click'), findsOneWidget);
});
```

## 🔐 환경 변수 관리

### .env 파일 구조
```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...

# OAuth
KAKAO_API_KEY=xxxxx
GOOGLE_CLIENT_ID=xxxxx

# 기타 설정
APP_ENV=development
APP_DEBUG=true
```

### 환경별 설정
- `.env` - 개발 환경 (기본)
- `.env.staging` - 스테이징 환경
- `.env.production` - 프로덕션 환경

## 📦 주요 패키지

### 상태 관리
- `flutter_riverpod`: 상태 관리
- `riverpod_annotation`: 코드 생성

### 네트워킹
- `supabase_flutter`: Supabase 클라이언트
- `dio`: HTTP 클라이언트

### UI/UX
- `flutter_animate`: 애니메이션
- `cached_network_image`: 이미지 캐싱
- `shimmer`: 로딩 효과

### 유틸리티
- `freezed`: 불변 클래스 생성
- `json_serializable`: JSON 직렬화
- `go_router`: 라우팅

## 🚀 빌드 및 배포

### Android
1. 키스토어 생성
```bash
keytool -genkey -v -keystore billage-key.keystore -alias billage -keyalg RSA -keysize 2048 -validity 10000
```

2. `android/key.properties` 생성
```properties
storePassword=<비밀번호>
keyPassword=<비밀번호>
keyAlias=billage
storeFile=../../billage-key.keystore
```

3. 빌드
```bash
flutter build apk --release
flutter build appbundle --release  # Play Store용
```

### iOS
1. Xcode에서 인증서 설정
2. 빌드
```bash
flutter build ios --release
```

## 🐛 디버깅

### Flutter Inspector
- Widget Tree 확인
- Layout Explorer 사용
- Performance Overlay 활성화

### 로깅
```dart
import 'package:flutter/foundation.dart';

// 디버그 모드에서만 출력
if (kDebugMode) {
  print('Debug: $message');
}
```

### Supabase 디버깅
```dart
// Supabase 로그 확인
Supabase.instance.client.auth.onAuthStateChange.listen((data) {
  print('Auth State: ${data.event}');
});
```

## 📚 참고 자료

### 공식 문서
- [Flutter 문서](https://flutter.dev/docs)
- [Riverpod 문서](https://riverpod.dev)
- [Supabase Flutter 가이드](https://supabase.com/docs/guides/flutter)

### 프로젝트 문서
- [README.md](README.md) - 프로젝트 소개
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Supabase 설정 가이드
- [BILLAGE_PROJECT_STATUS.md](../BILLAGE_PROJECT_STATUS.md) - 프로젝트 진행 현황

## 🤝 기여 가이드

### 이슈 생성
1. 버그 리포트: 재현 방법과 예상 동작 명시
2. 기능 제안: 상세한 요구사항과 사용 사례 설명

### Pull Request
1. 기능별로 작은 단위로 PR 생성
2. 테스트 코드 포함
3. 커밋 메시지 규칙 준수
   - feat: 새로운 기능
   - fix: 버그 수정
   - docs: 문서 수정
   - style: 코드 스타일 변경
   - refactor: 리팩토링
   - test: 테스트 추가
   - chore: 기타 변경

## ❓ 자주 묻는 질문

### Q: 패키지 충돌이 발생해요
```bash
flutter clean
flutter pub cache clean
flutter pub get
```

### Q: 코드 생성이 안 돼요
```bash
flutter pub run build_runner clean
flutter pub run build_runner build --delete-conflicting-outputs
```

### Q: Supabase 연결이 안 돼요
- `.env` 파일의 URL과 Key 확인
- Supabase 프로젝트 상태 확인
- 네트워크 연결 확인

---

© 2025 Billage. All rights reserved.
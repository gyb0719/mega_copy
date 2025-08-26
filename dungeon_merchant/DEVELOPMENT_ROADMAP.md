# Dungeon Merchant - 개발 로드맵 📋

## 프로젝트 개요
**Dungeon Merchant**는 상점 경영과 던전 탐험을 결합한 로그라이크 모바일 게임입니다.

## 현재 진행 상황

### ✅ Phase 1: 핵심 시스템 (완료 - 2025.01.26)
- [x] 프로젝트 초기 설정 (Flutter + Flame)
- [x] 상점 경영 메커니즘
  - 고객 AI 시스템
  - 가격 협상 메커니즘
  - 평판 및 레벨 시스템
- [x] 인벤토리 시스템
  - 5가지 아이템 타입
  - 5가지 희귀도 등급
  - 동적 아이템 생성
- [x] 기본 던전 탐험
  - 절차적 던전 생성
  - 방 탐험 메커니즘
  - 전리품 수집 시스템

### 현재 구현된 기능들
```
lib/
├── controllers/
│   └── game_controller.dart    # 게임 로직 컨트롤러
├── models/
│   ├── item.dart               # 아이템 모델
│   ├── shop.dart               # 상점 & 고객 모델
│   └── dungeon.dart            # 던전 모델
├── screens/
│   ├── main_game_screen.dart   # 메인 게임 화면
│   ├── shop_screen.dart        # 상점 화면
│   └── dungeon_screen.dart     # 던전 탐험 화면
└── main.dart                   # 앱 진입점
```

---

## 🚀 향후 개발 계획

### Phase 2: 전투 & AI 시스템 (예상 기간: 4주)
- [ ] **자동 전투 시스템**
  - 턴 기반 전투 로직
  - 데미지 계산 공식
  - 크리티컬 & 회피 시스템
  
- [ ] **적 AI 패턴**
  - 다양한 몬스터 타입
  - 행동 패턴 시스템
  - 난이도별 AI 조정
  
- [ ] **보스 메커니즘**
  - 특수 보스 패턴
  - 페이즈 전환 시스템
  - 보스 보상 시스템
  
- [ ] **스킬 시스템**
  - 액티브 스킬
  - 패시브 스킬
  - 스킬 쿨다운

**구현 파일 예정:**
- `lib/models/combat.dart`
- `lib/models/enemy.dart`
- `lib/models/skill.dart`
- `lib/controllers/battle_controller.dart`
- `lib/screens/battle_screen.dart`

### Phase 3: 메타 시스템 (예상 기간: 3주)
- [ ] **영웅 수집 시스템**
  - 영웅 캐릭터 모델
  - 영웅별 고유 능력
  - 영웅 획득 메커니즘
  
- [ ] **업그레이드 시스템**
  - 상점 업그레이드 트리
  - 영웅 성장 시스템
  - 아이템 강화 시스템
  
- [ ] **일일 퀘스트**
  - 퀘스트 생성 시스템
  - 보상 시스템
  - 주간/월간 미션
  
- [ ] **업적 시스템**
  - 업적 추적
  - 보상 시스템
  - 컬렉션 시스템

**구현 파일 예정:**
- `lib/models/hero.dart`
- `lib/models/quest.dart`
- `lib/models/achievement.dart`
- `lib/controllers/progression_controller.dart`
- `lib/screens/hero_collection_screen.dart`

### Phase 4: 소셜 & 수익화 (예상 기간: 3주)
- [ ] **길드 시스템**
  - 길드 생성/가입
  - 길드 레이드
  - 길드 상점
  
- [ ] **경매장**
  - 플레이어 간 거래
  - 시세 변동 시스템
  - 거래 수수료
  
- [ ] **수익화 통합**
  - IAP (인앱 구매)
  - 광고 시스템
  - 배틀패스
  
- [ ] **리더보드**
  - 글로벌 랭킹
  - 시즌 시스템
  - 보상 분배

**구현 파일 예정:**
- `lib/services/firebase_service.dart`
- `lib/services/iap_service.dart`
- `lib/services/ad_service.dart`
- `lib/screens/guild_screen.dart`
- `lib/screens/auction_screen.dart`

### Phase 5: 폴리싱 & 최적화 (예상 기간: 2주)
- [ ] **튜토리얼 시스템**
  - 단계별 가이드
  - 팁 시스템
  - 인터랙티브 튜토리얼
  
- [ ] **밸런싱**
  - 경제 밸런스 조정
  - 난이도 곡선 최적화
  - A/B 테스팅
  
- [ ] **최적화**
  - 성능 최적화
  - 메모리 관리
  - 배터리 소모 최적화
  
- [ ] **사운드 & 이펙트**
  - BGM 추가
  - 효과음
  - 파티클 이펙트

---

## 🛠 기술 스택
- **프레임워크:** Flutter 3.35.1
- **게임 엔진:** Flame 1.20.0
- **상태 관리:** StreamController (내장)
- **백엔드 (예정):** Firebase / Supabase
- **결제 (예정):** RevenueCat / Stripe
- **광고 (예정):** Google AdMob
- **분석 (예정):** Firebase Analytics

## 📝 개발 시 주의사항

### 코드 컨벤션
- 모든 모델 클래스는 `lib/models/` 디렉토리에 위치
- 컨트롤러는 싱글톤 패턴 사용
- 화면 파일명은 `_screen.dart`로 끝내기
- 가능한 const 생성자 사용

### Git 브랜치 전략
```
main (production)
├── develop
│   ├── feature/phase2-combat
│   ├── feature/phase3-meta
│   └── feature/phase4-social
```

### 테스트
- 각 Phase 완료 시 단위 테스트 작성
- 위젯 테스트로 UI 검증
- 통합 테스트로 게임 플로우 확인

## 🎯 마일스톤
- **Phase 1**: ✅ 완료 (2025.01.26)
- **Phase 2**: 전투 시스템 (목표: 2025.02.23)
- **Phase 3**: 메타 시스템 (목표: 2025.03.16)
- **Phase 4**: 소셜 기능 (목표: 2025.04.06)
- **Phase 5**: 출시 준비 (목표: 2025.04.20)
- **Beta Release**: 2025.04.30 (예정)

## 📞 연락처
프로젝트 관련 문의: [GitHub Issues](https://github.com/your-username/dungeon-merchant/issues)

---

## 다음 작업 시작하기

Phase 2를 시작하려면:
```bash
# 프로젝트 열기
cd dungeon_merchant

# 의존성 설치
flutter pub get

# 개발 시작
flutter run

# Phase 2 브랜치 생성 (선택사항)
git checkout -b feature/phase2-combat
```

**마지막 업데이트:** 2025.01.26
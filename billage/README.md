# 🏘️ Billage - 우리 동네 테크 공유 빌리지

> P2P 기반 IT기기 렌탈 플랫폼

## 📱 프로젝트 정보

- **프로젝트명**: 빌리지 (Billage)
- **슬로건**: "우리 동네 테크 공유 빌리지"
- **대상**: 20-30대 테크 애호가
- **시작일**: 2025년 1월 26일

## 🎯 핵심 가치

1. **공유경제**: 비싼 장비를 구매 대신 대여
2. **신뢰기반**: 철저한 본인인증과 보험시스템
3. **커뮤니티**: 동네 기반 테크 공유 문화

## 🛠️ 기술 스택

### Frontend (Mobile)
- Flutter 3.24+
- Riverpod 3.0
- GoRouter

### Backend
- NestJS
- PostgreSQL 16
- Redis
- Socket.io

### Infrastructure
- Docker + Kubernetes
- AWS/NCP
- GitHub Actions

## 📂 프로젝트 구조

```
billage/
├── app/                 # Flutter 모바일 앱
├── backend/            # NestJS API 서버
├── admin/              # Next.js 관리자 대시보드
├── docs/               # 프로젝트 문서
└── scripts/            # 빌드 및 배포 스크립트
```

## 🚀 시작하기

```bash
# 프로젝트 클론
git clone https://github.com/yourusername/billage.git

# 의존성 설치
cd billage
./scripts/setup.sh
```

## 📝 라이센스

Copyright © 2025 Billage. All rights reserved.
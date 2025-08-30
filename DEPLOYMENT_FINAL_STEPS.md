# 🚀 최종 배포 단계 (30분 이내 완료)

## ✅ 완료된 작업
1. ✅ 관리자 계정 코드 수정 완료
2. ✅ Production 빌드 성공
3. ✅ SQL 수정 스크립트 준비 완료

## 🔴 즉시 실행 필요 (5분)

### 1. Supabase SQL Editor에서 실행
**`URGENT_FIX_FOR_PRODUCTION.sql` 파일 내용을 복사하여 실행**

이 스크립트가 하는 일:
- ✅ martin18/0601, mega/0601 계정 추가
- ✅ 테스트 데이터 삭제
- ✅ Storage 버킷 공개 설정
- ✅ 이미지 업로드 권한 설정

## 📦 배포 옵션 (선택 1개)

### 옵션 A: Vercel 배포 (가장 빠름 - 10분)
```bash
# Vercel CLI 설치 (이미 있으면 스킵)
npm install -g vercel

# 배포 실행
cd mega-copy
vercel --prod
```

Vercel 배포시:
1. 로그인 요청시 Enter 눌러 브라우저에서 로그인
2. "Set up and deploy" 선택
3. Project name: mega-copy (또는 원하는 이름)
4. 모든 질문에 Enter (기본값 사용)

### 옵션 B: Netlify 배포 (15분)
1. [Netlify](https://app.netlify.com) 접속
2. "Add new site" > "Deploy manually"
3. `mega-copy/.next` 폴더를 드래그 & 드롭

### 옵션 C: 로컬 서버 운영 (임시)
```bash
cd mega-copy
npm run start
```
- 포트 3000에서 실행
- ngrok 사용하여 외부 접속 가능

## 🔑 관리자 계정 정보

배포 후 사용 가능한 계정:
- **martin18** / **0601** (메인 관리자)
- **mega** / **0601** (메인 관리자)
- **admin** / **admin123** (백업용)

## ⚡ 배포 후 즉시 테스트

1. **메인 페이지 접속**
   - 상품 목록 표시 확인

2. **관리자 페이지 (/admin)**
   - martin18/0601로 로그인
   - 상품 등록 테스트
   - 이미지 업로드 테스트

3. **모바일 테스트**
   - 반응형 디자인 확인
   - PWA 설치 버튼 확인

## 🚨 문제 발생시 긴급 대응

### 이미지 업로드 실패시
```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### 관리자 로그인 실패시
```sql
-- 모든 관리자 계정 확인
SELECT username, password, password_hash FROM admins;
```

### 상품이 안 보일 때
```sql
-- 상품 상태 확인
SELECT COUNT(*), is_active FROM products GROUP BY is_active;

-- 모든 상품 활성화
UPDATE products SET is_active = true;
```

## 📱 도메인 연결 (선택사항)

Vercel/Netlify 대시보드에서:
1. Settings > Domains
2. Add domain
3. megacopy.shop (또는 보유 도메인)
4. DNS 설정 안내 따르기

## ✅ 최종 체크리스트

- [ ] SQL 스크립트 실행 완료
- [ ] 배포 URL 획득
- [ ] 관리자 로그인 성공
- [ ] 상품 1개 이상 등록
- [ ] 이미지 업로드 성공
- [ ] 모바일 접속 테스트

---

**🎯 목표: 30분 이내 배포 완료!**

현재 시간: ___________
배포 완료 시간: ___________
배포 URL: ___________
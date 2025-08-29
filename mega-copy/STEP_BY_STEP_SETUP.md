# 📋 MEGA-COPY Supabase 설정 단계별 가이드

## 🚨 현재 문제 해결 순서

### Step 1: Password 컬럼 오류 해결
```sql
-- Supabase SQL Editor에서 실행
-- FIX_PASSWORD_COLUMN.sql 파일 내용 전체 복사하여 실행
```

### Step 2: 메인 설정 스크립트 실행
```sql
-- FIX_PASSWORD_COLUMN.sql 성공 후 실행
-- COMPLETE_FIX_ALL.sql 파일 내용 전체 복사하여 실행
```

### Step 3: Storage 버킷 생성 (Dashboard에서)
1. Supabase Dashboard > Storage
2. New bucket 클릭
3. 설정:
   - Name: `product-images`
   - Public bucket: ✅ ON
   - File size limit: 5MB
4. Create 클릭

### Step 4: Storage 정책 설정
버킷 생성 후 Policies 탭에서:
1. New Policy 클릭
2. "For full customization" 선택
3. 각각 추가:
   - SELECT 정책 (읽기)
   - INSERT 정책 (업로드)
   - UPDATE 정책 (수정)
   - DELETE 정책 (삭제)

### Step 5: 테스트
1. 웹사이트 접속: https://megacopy.shop
2. 관리자 페이지: https://megacopy.shop/admin
3. 로그인: admin / admin123
4. 상품 등록 테스트
5. 이미지 업로드 테스트

## ✅ 체크리스트

- [ ] FIX_PASSWORD_COLUMN.sql 실행 성공
- [ ] COMPLETE_FIX_ALL.sql 실행 성공
- [ ] Storage 버킷 'product-images' 생성
- [ ] Storage 정책 4개 추가
- [ ] 관리자 로그인 성공
- [ ] 상품 등록 성공
- [ ] 이미지 업로드 성공

## 🔧 문제 발생 시

### SQL 오류
- 에러 메시지와 라인 번호 확인
- 해당 부분만 따로 실행

### Storage 오류
- 버킷 이름 확인 (정확히 'product-images')
- Public 설정 확인
- Policies 확인

### API 오류
- RPC 함수 목록 확인:
```sql
SELECT proname FROM pg_proc
WHERE pronamespace = 'public'::regnamespace;
```

### 로그인 오류
- admins 테이블 데이터 확인:
```sql
SELECT username, role FROM admins;
```
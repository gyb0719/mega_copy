# 🚨 긴급 상용화 배포 체크리스트 (1시간 이내)

## ⚠️ 현재 상황
- 두 개의 SQL 스크립트가 실행됨
- products 테이블과 admins 테이블이 재생성됨
- **중요**: 기존 데이터가 삭제되었을 가능성 있음

## ✅ 즉시 확인 사항 (5분)

### 1. Supabase 대시보드에서 확인
```sql
-- SQL Editor에서 실행하여 현재 상태 확인
SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Admins', COUNT(*) FROM admins
UNION ALL
SELECT 'Active Products', COUNT(*) FROM products WHERE is_active = true;
```

### 2. 현재 관리자 계정 확인
```sql
-- 관리자 계정 목록
SELECT username, role, is_active FROM admins;
```

## 🔧 긴급 수정 사항 (10분)

### 1. 관리자 계정 수정 (app/admin/page.tsx 수정 필요)
현재 DB의 관리자 계정:
- **admin** / **admin123** (super_admin)
- **manager** / **manager123** (manager)  
- **test** / **test123** (admin)

기존 코드의 계정:
- martin18 / 0601
- mega / 0601

**즉시 수정 필요!**

### 2. Storage 버킷 설정 (5분)
```sql
-- Supabase SQL Editor에서 실행
-- Storage 버킷 공개 설정
UPDATE storage.buckets SET public = true WHERE id = 'product-images';

-- RLS 정책 추가 (이미지 업로드 허용)
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');
```

## 📦 배포 전 필수 작업 (20분)

### 1. 환경 변수 설정
`.env.production` 파일 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=https://nzmscqfrmxqcukhshsok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXNjcWZybXhxY3VraHNoc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTg1NDMsImV4cCI6MjA3MTc5NDU0M30.o0zQtPEjsuJnfQnY2MiakuM2EvTlVuRO9yeoajrwiLU
```

### 2. 테스트 데이터 삭제
```sql
-- 테스트 데이터 제거
DELETE FROM products WHERE name IN (
  'Samsung Galaxy S24 Ultra',
  'Apple MacBook Pro 16"',
  'Sony WH-1000XM5',
  'LG OLED TV 65"',
  'Dyson V15'
);
```

### 3. 실제 상품 데이터 추가
관리자 페이지(/admin)에서 실제 상품 등록

## 🚀 배포 명령어 (15분)

### 1. 빌드
```bash
cd mega-copy
npm run build
```

### 2. Vercel 배포 (권장)
```bash
npm install -g vercel
vercel --prod
```

### 3. 또는 다른 호스팅 사용
- Netlify
- Railway
- Render

## ⚡ 빠른 해결책

### 옵션 A: 기존 계정 유지하고 싶다면
```sql
-- admins 테이블에 기존 계정 추가
INSERT INTO admins (username, password_hash, password, role, email) 
VALUES 
  ('martin18', '0601', '0601', 'super_admin', 'martin@megacopy.shop'),
  ('mega', '0601', '0601', 'super_admin', 'mega@megacopy.shop')
ON CONFLICT (username) DO NOTHING;
```

### 옵션 B: 코드를 DB에 맞추기
app/admin/page.tsx의 29-38번 줄을 다음으로 교체:
```javascript
const adminAccounts = [
  { username: 'admin', password: 'admin123', role: 'main' },
  { username: 'manager', password: 'manager123', role: 'main' },
  { username: 'test', password: 'test123', role: 'sub' },
];
```

## 🎯 최종 체크리스트

- [ ] 관리자 로그인 가능한가?
- [ ] 상품 목록이 표시되는가?
- [ ] 상품 등록이 가능한가?
- [ ] 이미지 업로드가 되는가?
- [ ] 모바일에서 정상 작동하는가?

## 📞 문제 발생시

1. **DB 롤백 필요시**: Supabase 대시보드 > Database > Backups
2. **긴급 수정**: 위의 SQL 쿼리들을 순서대로 실행
3. **배포 실패시**: 로컬에서 `npm run dev`로 먼저 테스트

---
**시간이 촉박합니다! 위 순서대로 빠르게 진행하세요.**
# 📦 Supabase Storage 버킷 설정 가이드

## 🚨 중요: Storage는 SQL로 생성할 수 없습니다! Dashboard에서 수동 설정 필요

## Step 1: Storage 버킷 생성

1. **Supabase Dashboard 접속**
   - https://app.supabase.com
   - 프로젝트 선택

2. **Storage 메뉴 클릭** (왼쪽 사이드바)

3. **New bucket 버튼 클릭**

4. **버킷 정보 입력:**
   ```
   Name: product-images
   Public bucket: ✅ ON (체크)
   File size limit: 5MB (5242880 bytes)
   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
   ```

5. **Create 클릭**

## Step 2: Storage 정책 설정

### 버킷 생성 후 자동으로 Policies 탭이 열립니다

1. **New Policy 클릭**

2. **For full customization 선택**

3. **각 정책 추가:**

### Policy 1: Public Read (읽기 허용)
```sql
Name: Public can read images
Allowed operation: SELECT
Target roles: anon, authenticated
WITH CHECK expression: true
```

### Policy 2: Public Insert (업로드 허용)
```sql
Name: Public can upload images
Allowed operation: INSERT
Target roles: anon, authenticated
WITH CHECK expression: true
```

### Policy 3: Public Update (수정 허용)
```sql
Name: Public can update images
Allowed operation: UPDATE
Target roles: anon, authenticated
USING expression: true
WITH CHECK expression: true
```

### Policy 4: Public Delete (삭제 허용)
```sql
Name: Public can delete images
Allowed operation: DELETE
Target roles: anon, authenticated
USING expression: true
```

## Step 3: 빠른 설정 (SQL Editor에서 실행)

```sql
-- Storage 정책 설정 (버킷 생성 후 실행)
INSERT INTO storage.policies (bucket_id, name, operation, definition, check_expression)
VALUES 
  ('product-images', 'Public Access', 'SELECT', '{"roles": ["anon", "authenticated"]}', 'true'),
  ('product-images', 'Public Upload', 'INSERT', '{"roles": ["anon", "authenticated"]}', 'true'),
  ('product-images', 'Public Update', 'UPDATE', '{"roles": ["anon", "authenticated"]}', 'true'),
  ('product-images', 'Public Delete', 'DELETE', '{"roles": ["anon", "authenticated"]}', 'true')
ON CONFLICT DO NOTHING;
```

## Step 4: CORS 설정 (중요!)

1. **Settings > API** 메뉴
2. **CORS configuration** 섹션
3. 다음 추가:
   ```
   http://localhost:3000
   https://megacopy.shop
   https://www.megacopy.shop
   https://mega-copy3.pages.dev
   ```

## Step 5: 업로드 테스트

### JavaScript 테스트 코드:
```javascript
// Supabase Storage 업로드 테스트
const { supabase } = await import('/lib/supabase-rpc-api.js');

async function testUpload() {
  const file = new File(['test'], 'test.txt', { type: 'text/plain' });
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`test-${Date.now()}.txt`, file);
    
  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Upload success:', data);
    
    // Public URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);
      
    console.log('Public URL:', publicUrl);
  }
}

testUpload();
```

## Step 6: 확인 사항

### ✅ 체크리스트:
- [ ] Storage 버킷 'product-images' 생성됨
- [ ] Public bucket 설정 ON
- [ ] 4개 정책 모두 추가됨 (SELECT, INSERT, UPDATE, DELETE)
- [ ] CORS 설정 완료
- [ ] 업로드 테스트 성공

## 🔧 문제 해결

### 1. "Policy violation" 오류
- Storage Policies 확인
- anon 역할 포함 확인

### 2. "CORS error" 오류
- Settings > API > CORS configuration 확인
- 도메인 추가 확인

### 3. "Bucket not found" 오류
- Storage에서 버킷 이름 확인 (정확히 'product-images')

### 4. 파일이 업로드되지만 접근 불가
- Public bucket 설정 확인
- SELECT 정책 확인

## 📸 이미지 URL 형식

업로드 후 이미지 URL:
```
https://[project-id].supabase.co/storage/v1/object/public/product-images/[filename]
```

예시:
```
https://nzmscqfrmxqcukhshsok.supabase.co/storage/v1/object/public/product-images/product-001.jpg
```
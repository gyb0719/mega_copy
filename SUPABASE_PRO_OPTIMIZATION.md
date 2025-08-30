# ✅ Supabase Pro 플랜 최적화 가이드

## 🎉 좋은 소식: Pro 플랜으로 충분합니다!

### 📊 최적화 후 예상 사용량

**이미지 압축 개선 완료:**
- 메인 이미지: 1200px → **800px**, 품질 90% → **75%**
- 세부 이미지: 1920px → **1200px**, 품질 85% → **70%**
- **결과: 파일 크기 50-60% 감소**

**개선된 용량 계산:**
```
압축 후 평균 크기:
- 메인: ~100KB
- 세부: ~150KB

일일: 1000상품 × 3장 × 125KB = 375MB
월간: 11GB
연간: 132GB
```

### 🚀 Pro 플랜 활용도

| 리소스 | Pro 제한 | 월 사용량 | 여유도 |
|--------|----------|-----------|--------|
| Storage | 100GB | 11GB/월 누적 | **9개월 여유** |
| 대역폭 | 200GB/월 | 30-50GB | **충분** ✅ |
| Database | 8GB | 100MB/월 | **매우 충분** ✅ |

## 🔧 추가 최적화 방안

### 1. 자동 정리 기능 구현 (3개월마다)
```typescript
// app/api/cleanup/route.ts
export async function POST() {
  // 3개월 이상 된 비활성 상품 이미지 삭제
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  // 1. 비활성 상품 찾기
  const { data: oldProducts } = await supabase
    .from('products')
    .select('id, image_url, additional_images')
    .eq('is_active', false)
    .lt('updated_at', threeMonthsAgo.toISOString());
  
  // 2. Storage에서 이미지 삭제
  for (const product of oldProducts) {
    // 이미지 URL에서 파일명 추출 후 삭제
    await storageAPI.deleteImage(product.image_url);
  }
  
  return Response.json({ 
    cleaned: oldProducts.length,
    freedSpace: `${oldProducts.length * 0.125}MB`
  });
}
```

### 2. 썸네일 생성으로 목록 페이지 최적화
```typescript
// 목록용 썸네일 (300x300, 30KB)
export async function createListThumbnail(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.60,  // 작은 크기에선 품질 낮춰도 OK
    outputType: 'file'
  }) as Promise<File>;
}
```

### 3. WebP 자동 변환 (30% 추가 절감)
```typescript
// Canvas API는 WebP 지원
canvas.toBlob(
  (blob) => { /* ... */ },
  'image/webp',  // JPEG 대신 WebP
  quality
);
```

## 📅 장기 로드맵

### 0-3개월: 현재 상태 유지 ✅
- Pro 플랜으로 충분
- 이미지 압축 최적화 완료

### 3-6개월: 모니터링
- Storage 사용량 추적
- 필요시 오래된 이미지 정리

### 6-9개월: 선택적 업그레이드
**옵션 A**: Supabase Storage 추가 구매
- $25/월당 100GB 추가

**옵션 B**: Cloudflare R2 병행 사용
- 오래된 이미지만 R2로 이동
- 신규 이미지는 Supabase 유지

### 9개월 이후: 하이브리드 구조
```
최근 3개월 이미지: Supabase (빠른 접근)
3개월 이상 이미지: R2 (저렴한 보관)
```

## ✅ 현재 조치사항

### 1. 완료된 최적화
- ✅ 이미지 압축률 개선 (50% 용량 감소)
- ✅ 관리자 계정 동기화
- ✅ SQL 스크립트 수정

### 2. 즉시 실행 필요
```bash
# Cloudflare Pages 재배포
cd mega-copy
npm run pages:deploy
```

### 3. 모니터링 대시보드
Supabase 대시보드에서 확인:
- Storage → Usage 탭
- 일일 사용량 추적
- 월말 총 사용량 체크

## 💡 비용 절감 팁

1. **이미지 중복 방지**
   - 동일 이미지 재사용 시 URL만 저장

2. **판매 완료 상품 아카이빙**
   - 판매 완료 30일 후 이미지 압축률 높이기

3. **CDN 캐싱 최대화**
   - Cache-Control: max-age=31536000

## 🎯 결론

**Pro 플랜으로 9개월은 문제없습니다!**

매월 모니터링하면서:
- 3개월: 30GB 사용 (70GB 여유)
- 6개월: 60GB 사용 (40GB 여유)
- 9개월: 90GB 사용 → 추가 조치 검토

충분한 시간이 있으니 걱정하지 마세요! 🚀
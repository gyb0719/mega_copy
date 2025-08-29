# 이미지 표시 문제 해결 가이드

## 문제 설명
1. 관리자 메뉴에서 상품 등록시 사진이 안보이는 현상
2. 상품 상세 페이지에서 추가 이미지(최대 20장)가 안 나오는 현상

## 해결 방법

### 1. Supabase SQL Editor 접속
1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "SQL Editor" 클릭

### 2. SQL 실행
1. SQL Editor에 `FIX_PRODUCT_IMAGES_DISPLAY.sql` 파일의 내용을 복사/붙여넣기
2. "Run" 버튼 클릭하여 실행

### 3. 확인 사항
SQL 실행 후 다음 기능들이 추가/수정됩니다:
- `get_products` 함수: product_images 테이블 조인하여 이미지 목록 반환
- `get_product_by_id` 함수: product_images 테이블 조인하여 이미지 목록 반환  
- `add_product_with_images` 함수: 상품과 이미지를 함께 추가
- `update_product_with_images` 함수: 상품과 이미지를 함께 수정
- 기존 데이터 마이그레이션: additional_images를 product_images 테이블로 복사

### 4. 테스트
1. 관리자 페이지에서 상품 목록 확인 - 이미지가 정상적으로 표시되는지 확인
2. 상품 상세 페이지에서 여러 이미지가 있는 상품 확인 - 모든 이미지가 슬라이드로 표시되는지 확인
3. 새 상품 추가시 여러 이미지 업로드 - 정상적으로 저장되고 표시되는지 확인

## 주요 변경사항

### 데이터 구조
- products 테이블의 `additional_images` (JSONB) 컬럼과
- product_images 테이블을 모두 활용하도록 수정
- API 응답에 `product_images` 배열 추가

### 프론트엔드
- 상품 상세 페이지: product_images 배열 우선 사용, 없으면 additional_images 사용
- 관리자 메뉴: product_images 배열의 첫 번째 이미지를 썸네일로 표시

## 문제 해결 확인
SQL 적용 후:
1. 관리자 메뉴에서 상품 이미지가 정상적으로 표시됩니다
2. 상품 상세 페이지에서 모든 추가 이미지가 슬라이드로 표시됩니다
3. 새로 추가하는 상품의 이미지도 정상적으로 저장/표시됩니다
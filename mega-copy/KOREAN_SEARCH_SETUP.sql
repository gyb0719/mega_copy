-- ================================================
-- 한국어 검색 최적화 설정
-- pg_trgm을 사용한 한국어 부분 검색 지원
-- ================================================

-- 1. pg_trgm 확장 설치 (필수)
-- trigram 기반 텍스트 유사도 검색 지원
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. unaccent 확장 설치 (선택)
-- 액센트 제거 (영문 검색 개선)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 3. 한국어 검색 최적화 인덱스 생성
-- ================================================

-- 상품명 검색 인덱스 (가장 중요)
DROP INDEX IF EXISTS idx_products_name_trgm;
CREATE INDEX idx_products_name_trgm 
ON products USING gin(name gin_trgm_ops);

-- 브랜드명 검색 인덱스
DROP INDEX IF EXISTS idx_products_brand_trgm;
CREATE INDEX idx_products_brand_trgm 
ON products USING gin(brand gin_trgm_ops);

-- 설명 검색 인덱스
DROP INDEX IF EXISTS idx_products_description_trgm;
CREATE INDEX idx_products_description_trgm 
ON products USING gin(description gin_trgm_ops);

-- 복합 검색을 위한 통합 인덱스
DROP INDEX IF EXISTS idx_products_search_text;
CREATE INDEX idx_products_search_text 
ON products USING gin((
  COALESCE(name, '') || ' ' || 
  COALESCE(brand, '') || ' ' || 
  COALESCE(description, '') || ' ' ||
  COALESCE(category, '')
) gin_trgm_ops);

-- 4. 한국어 검색 함수 (개선된 버전)
-- ================================================

-- 한국어 검색 함수 v2
CREATE OR REPLACE FUNCTION search_products_korean(
  search_query TEXT,
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  total_count INT;
  search_pattern TEXT;
BEGIN
  -- 검색어 정규화
  search_pattern := '%' || LOWER(TRIM(search_query)) || '%';
  
  -- 전체 카운트
  SELECT COUNT(*) INTO total_count
  FROM products
  WHERE is_active = true
    AND (
      LOWER(name) LIKE search_pattern OR
      LOWER(brand) LIKE search_pattern OR
      LOWER(description) LIKE search_pattern OR
      LOWER(category) LIKE search_pattern OR
      -- trigram 유사도 검색 (오타 허용)
      similarity(LOWER(name), LOWER(search_query)) > 0.3 OR
      similarity(LOWER(brand), LOWER(search_query)) > 0.3
    );

  -- 검색 결과 조회
  SELECT json_build_object(
    'data', COALESCE(json_agg(
      json_build_object(
        'id', p.id,
        'name', p.name,
        'brand', p.brand,
        'price', p.price,
        'original_price', p.original_price,
        'description', p.description,
        'category', p.category,
        'image_url', p.image_url,
        'stock', p.stock,
        'score', p.score,
        'created_at', p.created_at
      ) ORDER BY p.score DESC, p.created_at DESC
    ), '[]'::json),
    'count', total_count,
    'query', search_query
  )
  INTO result
  FROM (
    SELECT 
      *,
      -- 관련도 점수 계산
      CASE
        WHEN LOWER(name) LIKE search_pattern THEN 100
        WHEN LOWER(brand) LIKE search_pattern THEN 90
        WHEN LOWER(category) = LOWER(search_query) THEN 80
        WHEN LOWER(description) LIKE search_pattern THEN 70
        ELSE GREATEST(
          similarity(LOWER(name), LOWER(search_query)) * 100,
          similarity(LOWER(brand), LOWER(search_query)) * 100
        )
      END as score
    FROM products
    WHERE is_active = true
      AND (
        LOWER(name) LIKE search_pattern OR
        LOWER(brand) LIKE search_pattern OR
        LOWER(description) LIKE search_pattern OR
        LOWER(category) LIKE search_pattern OR
        similarity(LOWER(name), LOWER(search_query)) > 0.3 OR
        similarity(LOWER(brand), LOWER(search_query)) > 0.3
      )
    ORDER BY score DESC, created_at DESC
    LIMIT limit_count
    OFFSET offset_count
  ) p;
  
  RETURN result;
END;
$$;

-- 5. 자동완성용 검색 함수
-- ================================================

CREATE OR REPLACE FUNCTION search_autocomplete(
  prefix TEXT,
  limit_count INT DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'suggestions', COALESCE(json_agg(DISTINCT 
      json_build_object(
        'value', suggestion,
        'type', suggestion_type
      )
    ), '[]'::json)
  )
  INTO result
  FROM (
    -- 상품명에서 추출
    SELECT DISTINCT name as suggestion, 'product' as suggestion_type
    FROM products
    WHERE is_active = true
      AND LOWER(name) LIKE LOWER(prefix) || '%'
    LIMIT 5
    
    UNION ALL
    
    -- 브랜드명에서 추출
    SELECT DISTINCT brand as suggestion, 'brand' as suggestion_type
    FROM products
    WHERE is_active = true
      AND brand IS NOT NULL
      AND LOWER(brand) LIKE LOWER(prefix) || '%'
    LIMIT 3
    
    UNION ALL
    
    -- 카테고리에서 추출
    SELECT DISTINCT category as suggestion, 'category' as suggestion_type
    FROM products
    WHERE is_active = true
      AND category IS NOT NULL
      AND LOWER(category) LIKE LOWER(prefix) || '%'
    LIMIT 2
  ) suggestions
  LIMIT limit_count;
  
  RETURN result;
END;
$$;

-- 6. 인기 검색어 테이블 (선택사항)
-- ================================================

CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_term TEXT NOT NULL,
  search_count INT DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인기 검색어 인덱스
CREATE INDEX IF NOT EXISTS idx_search_history_term 
ON search_history(search_term);

CREATE INDEX IF NOT EXISTS idx_search_history_count 
ON search_history(search_count DESC);

-- 7. 검색어 기록 함수
-- ================================================

CREATE OR REPLACE FUNCTION log_search_term(term TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO search_history (search_term, search_count, last_searched)
  VALUES (LOWER(TRIM(term)), 1, NOW())
  ON CONFLICT (search_term) 
  DO UPDATE SET 
    search_count = search_history.search_count + 1,
    last_searched = NOW();
END;
$$;

-- 8. 인기 검색어 조회 함수
-- ================================================

CREATE OR REPLACE FUNCTION get_popular_searches(limit_count INT DEFAULT 10)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'popular_searches', COALESCE(json_agg(
      json_build_object(
        'term', search_term,
        'count', search_count,
        'last_searched', last_searched
      ) ORDER BY search_count DESC
    ), '[]'::json)
  )
  INTO result
  FROM (
    SELECT search_term, search_count, last_searched
    FROM search_history
    WHERE last_searched > NOW() - INTERVAL '30 days'
    ORDER BY search_count DESC
    LIMIT limit_count
  ) popular;
  
  RETURN result;
END;
$$;

-- 9. 실제 사용 예제
-- ================================================

-- 한국어 검색 테스트
-- SELECT * FROM search_products_korean('루이비통');
-- SELECT * FROM search_products_korean('구찌');
-- SELECT * FROM search_products_korean('가방');

-- 오타 허용 검색 테스트 (similarity)
-- SELECT * FROM search_products_korean('루이비똥'); -- 오타도 검색됨
-- SELECT * FROM search_products_korean('구치'); -- 오타도 검색됨

-- 자동완성 테스트
-- SELECT * FROM search_autocomplete('루이');
-- SELECT * FROM search_autocomplete('가');

-- 10. 검색 성능 확인
-- ================================================

-- 인덱스 사용 확인
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM products 
WHERE name ILIKE '%루이%';

-- trigram 인덱스 사용 확인
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM products
WHERE name % '루이비통'; -- trigram 유사도 연산자

-- 성공 메시지
SELECT '한국어 검색 설정 완료!' as status,
       '- pg_trgm 확장 설치됨' as feature1,
       '- 한국어 부분 검색 지원' as feature2,
       '- 오타 허용 검색 가능' as feature3,
       '- 자동완성 기능 추가' as feature4;
-- Supabase 데이터베이스에 is_available 컬럼 추가
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- products 테이블에 is_available 컬럼 추가 (없는 경우만)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'is_available'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN is_available BOOLEAN DEFAULT true;
    
    -- 기존 상품들을 모두 활성화 상태로 설정
    UPDATE products 
    SET is_available = true 
    WHERE is_available IS NULL;
    
    RAISE NOTICE 'is_available 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'is_available 컬럼이 이미 존재합니다.';
  END IF;
END $$;
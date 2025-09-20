'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'last-viewed-product';

export function useScrollToProduct() {
  // 현재 뷰포트에서 가장 위에 있는 상품 ID 저장
  const saveVisibleProduct = () => {
    const products = document.querySelectorAll('[data-product-id]');
    const viewportTop = window.scrollY;
    const viewportMiddle = viewportTop + window.innerHeight / 2;

    for (const product of products) {
      const rect = product.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementBottom = elementTop + rect.height;

      // 뷰포트 중앙에 가장 가까운 상품 찾기
      if (elementTop <= viewportMiddle && elementBottom >= viewportMiddle) {
        const productId = product.getAttribute('data-product-id');
        if (productId) {
          const scrollData = {
            productId,
            offset: viewportMiddle - elementTop, // 상품 내에서의 상대적 위치
            timestamp: Date.now()
          };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scrollData));
          console.log('[ScrollToProduct] 저장된 상품:', productId);
        }
        break;
      }
    }
  };

  // 저장된 상품으로 스크롤
  const restoreToProduct = () => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const { productId, offset } = JSON.parse(stored);
      console.log('[ScrollToProduct] 복원할 상품:', productId);

      const attemptScroll = (attempts = 0) => {
        const product = document.querySelector(`[data-product-id="${productId}"]`);

        if (product) {
          const rect = product.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const targetScroll = elementTop + offset - window.innerHeight / 2;

          window.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'auto'
          });

          console.log('[ScrollToProduct] 상품 위치로 스크롤 완료:', productId);
        } else if (attempts < 20) {
          // 상품이 아직 로드되지 않았으면 재시도
          setTimeout(() => attemptScroll(attempts + 1), 100);
        }
      };

      attemptScroll();
    } catch (error) {
      console.error('[ScrollToProduct] 복원 실패:', error);
    }
  };

  useEffect(() => {
    // 페이지 로드 시 복원
    restoreToProduct();

    // 스크롤 이벤트에서 현재 위치 저장
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveVisibleProduct, 200);
    };

    // 페이지 떠날 때 저장
    const handleBeforeUnload = () => {
      saveVisibleProduct();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
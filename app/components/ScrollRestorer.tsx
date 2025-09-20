'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';

const STORAGE_KEY_PREFIX = 'scroll-position:';

const buildStorageKey = (
  pathname: string | null,
  searchParams: ReadonlyURLSearchParams | URLSearchParams | null
) => {
  const search = searchParams ? searchParams.toString() : '';
  return `${pathname ?? ''}?${search}`;
};

const isInternalAnchor = (anchor: HTMLAnchorElement) => {
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;
  const href = anchor.getAttribute('href');
  if (!href) return false;
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
};

export default function ScrollRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentKeyRef = useRef<string>('');
  const latestPositionRef = useRef<number>(0);
  const navigationInProgressRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = buildStorageKey(pathname, searchParams);
    currentKeyRef.current = key;
    navigationInProgressRef.current = false;

    const storageKey = `${STORAGE_KEY_PREFIX}${key}`;

    const readStoredPosition = () => {
      const stored = sessionStorage.getItem(storageKey);
      if (stored === null) return null;
      const parsed = Number.parseInt(stored, 10);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const applyScroll = (value: number, force: boolean = false) => {
      // 이미 정확한 위치에 있으면 스킵
      if (!force && Math.abs(window.scrollY - value) < 10) {
        return;
      }
      latestPositionRef.current = value;
      window.scrollTo({ top: value, behavior: 'auto' });
    };

    const restoreFromStorage = () => {
      const stored = readStoredPosition();
      if (stored === null) {
        console.log('[ScrollRestorer] 저장된 스크롤 위치 없음:', storageKey);
        return;
      }
      console.log('[ScrollRestorer] 스크롤 복원 시작:', stored, 'px for', storageKey);

      let lastDocumentHeight = 0;
      let stableHeightCount = 0;
      const maxAttempts = 50; // 최대 50번 시도
      let attemptNumber = 0;

      // 스크롤 복원 함수
      const attemptRestore = () => {
        attemptNumber++;

        const currentScroll = window.scrollY;
        const targetScroll = stored;
        const difference = Math.abs(currentScroll - targetScroll);

        // 이미 정확한 위치에 있으면 종료
        if (difference < 10) {
          console.log('[ScrollRestorer] 복원 성공:', currentScroll, 'px');
          return true; // 성공
        }

        // 문서 높이 체크
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const maxScrollPosition = documentHeight - viewportHeight;

        // 문서 높이가 안정화되었는지 확인
        if (documentHeight === lastDocumentHeight) {
          stableHeightCount++;
        } else {
          stableHeightCount = 0;
        }
        lastDocumentHeight = documentHeight;

        // 목표 위치까지 스크롤할 수 있는지 확인
        if (targetScroll <= maxScrollPosition) {
          applyScroll(targetScroll, true);
          console.log(`[ScrollRestorer] 복원 시도 #${attemptNumber}: ${targetScroll}px (문서 높이: ${documentHeight}px)`);

          // 스크롤 후 다시 확인
          requestAnimationFrame(() => {
            const newScroll = window.scrollY;
            const newDifference = Math.abs(newScroll - targetScroll);
            if (newDifference < 10) {
              console.log('[ScrollRestorer] 복원 성공:', newScroll, 'px');
            } else if (attemptNumber < maxAttempts) {
              // 실패했으면 다시 시도
              requestAnimationFrame(attemptRestore);
            }
          });
          return false; // 계속 시도
        } else {
          console.log(`[ScrollRestorer] 대기 중 #${attemptNumber}: 문서 높이 ${documentHeight}px, 필요 ${targetScroll + viewportHeight}px`);

          // 문서 높이가 3번 연속 동일하고 여전히 부족하면 포기
          if (stableHeightCount >= 3) {
            console.log('[ScrollRestorer] 문서 높이가 더 이상 증가하지 않음 - 사용 가능한 최대 위치로 스크롤');
            applyScroll(maxScrollPosition, true);
            return true; // 종료
          }

          return false; // 계속 대기
        }
      };

      // 다양한 타이밍으로 복원 시도
      const scheduleRestore = () => {
        const attempt = () => {
          if (attemptNumber >= maxAttempts) {
            console.log('[ScrollRestorer] 최대 시도 횟수 도달 - 복원 중단');
            return;
          }

          const success = attemptRestore();
          if (!success && attemptNumber < maxAttempts) {
            // 점진적으로 대기 시간 증가
            const nextDelay = Math.min(50 * Math.floor(attemptNumber / 5), 500);
            setTimeout(attempt, nextDelay);
          }
        };

        // 즉시 시작
        requestAnimationFrame(attempt);
      };

      scheduleRestore();
    };

    const persist = (value: number) => {
      // 이미 저장된 값보다 작은 값은 무시 (페이지 전환 중 발생하는 0 값 방지)
      const currentStored = readStoredPosition();
      if (currentStored !== null && value < currentStored - 100 && value < 100) {
        console.log('[ScrollRestorer] 작은 값 무시:', value, 'px (저장된 값:', currentStored, 'px)');
        return;
      }

      latestPositionRef.current = value;
      sessionStorage.setItem(storageKey, `${value}`);
      console.log('[ScrollRestorer] 스크롤 위치 저장:', value, 'px for', storageKey);
    };

    restoreFromStorage();

    let scrollTimeout: NodeJS.Timeout;
    let ticking = false;
    const handleScroll = () => {
      if (navigationInProgressRef.current) return;

      // 페이지 언로드 중이면 스크롤 이벤트 무시
      if (document.readyState === 'loading') return;

      // 즉시 저장
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const currentScrollY = window.scrollY;
          latestPositionRef.current = currentScrollY;
        });
      }

      // 디바운스된 저장
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollY = window.scrollY;
        // 너무 작은 값은 무시 (페이지 로딩 중 발생하는 이벤트)
        if (scrollY > 10 || latestPositionRef.current > 10) {
          persist(Math.max(scrollY, latestPositionRef.current));
        }
      }, 100);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const finalPosition = Math.max(window.scrollY, latestPositionRef.current);
        if (finalPosition > 10) {
          persist(finalPosition);
        }
      }
    };

    const handlePageHide = () => {
      // pagehide 이벤트에서도 마지막 유효한 위치 저장
      const finalPosition = Math.max(window.scrollY, latestPositionRef.current);
      if (finalPosition > 10) {
        sessionStorage.setItem(storageKey, `${finalPosition}`);
        console.log('[ScrollRestorer] 페이지 숨김 - 최종 위치 저장:', finalPosition, 'px');
      }
    };

    const handleBeforeUnload = () => {
      // 페이지 언로드 시 마지막 유효한 위치 저장
      const finalPosition = Math.max(window.scrollY, latestPositionRef.current);
      if (finalPosition > 10) {
        sessionStorage.setItem(storageKey, `${finalPosition}`);
        console.log('[ScrollRestorer] 페이지 언로드 - 최종 위치 저장:', finalPosition, 'px');
      }
    };

    const handlePopState = () => {
      navigationInProgressRef.current = false;
      const url = new URL(window.location.href);
      const targetKey = buildStorageKey(url.pathname, new URLSearchParams(url.search));
      const stored = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${targetKey}`);
      if (stored !== null) {
        const parsed = Number.parseInt(stored, 10);
        if (!Number.isNaN(parsed)) {
          requestAnimationFrame(() => window.scrollTo({ top: parsed, behavior: 'auto' }));
        }
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      const anchor = target.closest('a');
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalAnchor(anchor)) return;

      const href = anchor.getAttribute('href');
      console.log('[ScrollRestorer] 내부 링크 클릭 감지:', href);
      navigationInProgressRef.current = true;
      // 즉시 저장하고 latestPositionRef도 업데이트
      const currentY = window.scrollY;
      latestPositionRef.current = currentY;
      persist(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      if (!navigationInProgressRef.current) {
        persist(latestPositionRef.current || window.scrollY);
      }
    };
  }, [pathname, searchParams]);

  return null;
}

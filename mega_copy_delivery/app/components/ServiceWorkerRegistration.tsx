'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker 등록 성공:', registration.scope);
            
            // 업데이트 체크
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // 새 버전이 있을 때 알림
                    console.log('새로운 버전이 있습니다. 페이지를 새로고침하세요.');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('Service Worker 등록 실패:', error);
          });
      });
    }
  }, []);

  return null;
}
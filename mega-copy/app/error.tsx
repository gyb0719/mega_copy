'use client';

import { useEffect } from 'react';
import ErrorMessage from './components/ErrorMessage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-20">
        <ErrorMessage
          title="페이지 로드 중 오류가 발생했습니다"
          message={error.message || '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
          onRetry={reset}
          showHomeButton={true}
        />
      </div>
    </div>
  );
}
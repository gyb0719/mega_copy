import LoadingSpinner from './components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" message="페이지를 불러오는 중..." />
    </div>
  );
}
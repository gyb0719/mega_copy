'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategorySection from './components/CategorySection';
import NoticeBanner from './components/NoticeBanner';
import ProductGridOptimized from './components/ProductGridOptimized';
import PWAInstallButton from './components/PWAInstallButton';
import Footer from './components/Footer';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || '전체';
  const urlSearchTerm = searchParams.get('search') || '';

  // 로컬 상태로 입력값 관리 (한글 IME 문제 해결)
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // URL 파라미터가 변경되면 로컬 상태 동기화 (뒤로가기 시)
  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  const handleSearchChange = (value: string) => {
    // 즉시 로컬 상태 업데이트 (한글 입력 가능)
    setSearchTerm(value);

    // 디바운스로 URL 업데이트 (300ms 후)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      const queryString = params.toString();
      router.replace(queryString ? `/?${queryString}` : '/', { scroll: false });
    }, 300);
  };

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === '전체') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      <PWAInstallButton />
      <CategorySection
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
      <NoticeBanner />
      <div className="flex-grow">
        <ProductGridOptimized category={selectedCategory} searchTerm={searchTerm} />
      </div>
      <Footer />
    </div>
  );
}
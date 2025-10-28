'use client';

import { useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');

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
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
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
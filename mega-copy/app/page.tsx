'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategorySection from './components/CategorySection';
import NoticeBanner from './components/NoticeBanner';
import ProductGridOptimized from './components/ProductGridOptimized';
import PWAInstallButton from './components/PWAInstallButton';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen">
      <Header />
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <PWAInstallButton />
      <CategorySection
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <NoticeBanner />
      <ProductGridOptimized category={selectedCategory} />
    </div>
  );
}
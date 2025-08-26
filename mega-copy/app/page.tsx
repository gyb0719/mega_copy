'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import NoticeBanner from './components/NoticeBanner';
import CategorySection from './components/CategorySection';
import ProductGrid from './components/ProductGrid';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  return (
    <div className="min-h-screen">
      <Header />
      <NoticeBanner />
      <CategorySection 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <ProductGrid category={selectedCategory} />
    </div>
  );
}
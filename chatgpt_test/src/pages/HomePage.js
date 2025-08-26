import React, { useState } from 'react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  
  // 선택된 카테고리에 따라 상품 필터링
  const filteredProducts = selectedCategory === '전체' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // 카테고리 목록 (중복 제거)
  const categories = ['전체', ...new Set(products.map(product => product.category))];

  return (
    <div>
      {/* 페이지 타이틀 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">인기 상품</h1>
        <p className="text-gray-600">최고의 품질, 최상의 가격으로 만나보세요</p>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 상품 개수 표시 */}
      <div className="mb-4 text-gray-600">
        총 {filteredProducts.length}개의 상품
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 상품이 없을 때 */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">해당 카테고리에 상품이 없습니다.</p>
        </div>
      )}

      {/* 프로모션 배너 */}
      <div className="mt-16 bg-gradient-to-r from-primary to-blue-600 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">특별 할인 이벤트</h2>
        <p className="mb-6">신규 회원 가입 시 10% 할인 쿠폰 증정!</p>
        <button className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          지금 가입하기
        </button>
      </div>
    </div>
  );
};

export default HomePage;
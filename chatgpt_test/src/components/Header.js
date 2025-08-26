import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCategories } from '../data/products';

const Header = () => {
  const navigate = useNavigate();
  const { getCartItemsCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const categories = getCategories();

  // 검색 처리 함수
  const handleSearch = (e) => {
    e.preventDefault();
    // 실제로는 검색 결과 페이지로 이동하도록 구현 가능
    console.log('검색어:', searchTerm);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* 상단 네비게이션 바 */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">쇼핑몰</h1>
          </Link>

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="상품을 검색하세요..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* 장바구니 버튼 */}
          <Link
            to="/cart"
            className="relative flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            장바구니
            {/* 장바구니 아이템 개수 표시 */}
            {getCartItemsCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {getCartItemsCount()}
              </span>
            )}
          </Link>
        </div>

        {/* 카테고리 메뉴 */}
        <nav className="border-t">
          <ul className="flex space-x-8 py-3">
            <li>
              <Link
                to="/"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                전체보기
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category}>
                <button
                  onClick={() => console.log(`카테고리 ${category} 클릭`)}
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
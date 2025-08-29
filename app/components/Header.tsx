'use client';

import { Settings, ShoppingBag, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 
                bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-blue-700 
                transition-all duration-300">
                MEGA
              </span>
              <span className="text-2xl md:text-3xl font-black text-gray-900 ml-1">
                SHOP
              </span>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 
                rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/categories" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
              카테고리
            </Link>
            <Link href="/deals" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
              특가상품
            </Link>
            <Link href="/new" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
              신상품
            </Link>
            <Link href="/best" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
              베스트
            </Link>
          </nav>

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 장바구니 */}
            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
              <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-purple-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-600 
                text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* 사용자 */}
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
              <User className="w-5 h-5 text-gray-700 group-hover:text-purple-600" />
            </button>

            {/* 관리자 */}
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              title="관리자 페이지"
            >
              <Settings className="w-5 h-5 text-gray-700 group-hover:text-purple-600" />
            </Link>

            {/* 모바일 메뉴 */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            >
              <Menu className="w-5 h-5 text-gray-700 group-hover:text-purple-600" />
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 드롭다운 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slide-up">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/categories" 
                className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 
                  rounded-lg font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                카테고리
              </Link>
              <Link 
                href="/deals" 
                className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 
                  rounded-lg font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                특가상품
              </Link>
              <Link 
                href="/new" 
                className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 
                  rounded-lg font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                신상품
              </Link>
              <Link 
                href="/best" 
                className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 
                  rounded-lg font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                베스트
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
'use client';

import { ShoppingCart, Search, User, Menu, Heart, Bell, MapPin, ChevronDown, Package, Headphones, CreditCard, Gift, Truck, Home, Tag, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// useTheme 제거됨 - 라이트 모드만 사용

interface ModernHeaderProps {
  cartCount: number;
  onCartClick: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function ModernHeader({ cartCount, onCartClick, searchTerm, onSearchChange }: ModernHeaderProps) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  // 테마 관련 코드 제거됨

  useEffect(() => {
    updateWishlistCount();
    updateCartCount();
    
    window.addEventListener('wishlistUpdated', updateWishlistCount);
    return () => window.removeEventListener('wishlistUpdated', updateWishlistCount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  const updateWishlistCount = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistCount(wishlist.length);
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
  };

  const categories = [
    { name: '노트북', icon: '💻', description: '최신 노트북' },
    { name: '스마트폰', icon: '📱', description: '플래그십 폰' },
    { name: '오디오', icon: '🎧', description: '프리미엄 사운드' },
    { name: '태블릿', icon: '📱', description: '태블릿 PC' },
    { name: '웨어러블', icon: '⌚', description: '스마트 워치' },
    { name: '액세서리', icon: '🎮', description: '각종 액세서리' }
  ];

  const popularTags = ['맥북', '아이폰15', '갤럭시', '에어팟'];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              전국 배송 가능
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Truck className="h-3 w-3" />
              3만원 이상 무료배송
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tracking" className="hover:text-gray-300">배송조회</Link>
            <Link href="/support" className="hover:text-gray-300">고객센터</Link>
            <Link href="/benefits" className="hover:text-gray-300">멤버십 혜택</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Left Section - Logo & Categories */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <span className="font-bold text-xl hidden sm:block">DevYB</span>
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                  <span className="hidden md:block">카테고리</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    {categories.map((cat) => (
                      <Link 
                        key={cat.name}
                        href={`/category/${cat.name}`} 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowCategoryDropdown(false)}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{cat.name}</p>
                          <p className="text-xs text-gray-500">{cat.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-xl mx-2 md:mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim()) {
                      // 검색 결과 페이지로 이동하거나 검색 실행
                      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
                    }
                  }}
                  className="w-full px-4 py-2.5 pl-10 pr-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <div className="hidden lg:flex absolute right-3 top-1/2 transform -translate-y-1/2 items-center gap-2">
                  {popularTags.slice(0, 2).map(tag => (
                    <button
                      key={tag}
                      onClick={() => onSearchChange(tag)}
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg relative hidden sm:block"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <Link
                href="/signup"
                className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block"
              >
                <User className="h-5 w-5" />
              </Link>

              <Link
                href="/wishlist"
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <Heart className="h-4 w-4 md:h-5 md:w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-xs">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={onCartClick}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* 모바일 메뉴 버튼 */}
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg sm:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-4 md:gap-6 mt-3 text-sm overflow-x-auto scrollbar-hide pb-2">
            <Link href="/deals" className="flex items-center gap-1 text-red-600 font-semibold whitespace-nowrap">
              <Sparkles className="h-4 w-4" />
              오늘의 딜
            </Link>
            <Link href="/best" className="hover:text-gray-600 whitespace-nowrap">베스트</Link>
            <Link href="/events" className="hover:text-gray-600 whitespace-nowrap">이벤트</Link>
            <Link href="/coupons" className="hover:text-gray-600 whitespace-nowrap hidden sm:block">쿠폰</Link>
            <Link href="/benefits" className="hover:text-gray-600 whitespace-nowrap flex items-center gap-1">
              <Gift className="h-4 w-4" />
              혜택
            </Link>
          </div>

          {/* 모바일 카테고리 메뉴 */}
          {showCategoryMenu && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
              {categories.slice(0, 6).map((cat) => (
                <Link 
                  key={cat.name}
                  href={`/category/${cat.name}`} 
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  onClick={() => setShowCategoryMenu(false)}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
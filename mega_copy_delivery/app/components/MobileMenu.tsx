'use client';

import { useState } from 'react';
import { Menu, X, Home, Search, Package, User, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/search', label: '검색', icon: Search },
  { href: '/products', label: '상품', icon: Package },
  { href: '/admin', label: '관리자', icon: User },
  { href: 'http://pf.kakao.com/_xjxexdG', label: '문의', icon: Phone, external: true },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* 햄버거 메뉴 버튼 */}
      <button
        onClick={toggleMenu}
        className="fixed bottom-4 right-4 z-50 md:hidden bg-mega-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800"
        aria-label="Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* 메뉴 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* 슬라이드 메뉴 */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white z-45 md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } rounded-t-3xl shadow-2xl`}
      >
        <div className="p-6 pb-8">
          <div className="mb-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-center">메뉴</h3>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={toggleMenu}
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-mega-yellow text-black'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={toggleMenu}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-600'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  hideAdminButton?: boolean;
}

export default function Header({ hideAdminButton = false }: HeaderProps) {
  const pathname = usePathname();
  const isProductPage = pathname === '/product';
  const shouldHideAdmin = hideAdminButton || isProductPage;
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2" suppressHydrationWarning>
            <span className="text-xl md:text-2xl font-black text-mega-yellow">MEGA</span>
            <span className="text-xl md:text-2xl font-black text-black">COPY</span>
          </Link>

          {/* 관리자 메뉴 버튼 - 상세 페이지에서는 숨김 */}
          {!shouldHideAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] p-3 bg-gray-200 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors touch-manipulation cursor-pointer"
              title="관리자 페이지"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
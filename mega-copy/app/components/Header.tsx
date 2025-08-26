'use client';

import { useState } from 'react';
import { Search, Coffee } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black">MEGA</span>
            <span className="bg-mega-yellow px-2 py-1 rounded flex items-center justify-center">
              <Coffee className="w-5 h-5 text-black" />
            </span>
            <span className="text-2xl font-black">COPY</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-black rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="상품명, 브랜드 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black text-white px-4 py-2 outline-none w-64"
            />
            <button type="submit" className="bg-black px-4 py-2 hover:bg-gray-800">
              <Search className="w-5 h-5 text-white" />
            </button>
          </form>

          {/* Mobile Search Button */}
          <button 
            onClick={() => router.push('/search')}
            className="md:hidden bg-black p-2 rounded-lg hover:bg-gray-800"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
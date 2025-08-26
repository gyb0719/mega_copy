'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black">MEGA</span>
            <span className="bg-mega-yellow px-2 py-0.5 rounded text-black font-black text-xl">
              C
            </span>
            <span className="text-2xl font-black">COPY</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-black rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="검색"
              className="bg-black text-white px-4 py-2 outline-none w-64"
            />
            <button className="bg-black px-4 py-2">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Mobile Search Button */}
          <button className="md:hidden bg-black p-2 rounded-lg">
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
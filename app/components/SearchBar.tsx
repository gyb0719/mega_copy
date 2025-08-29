'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="상품 검색..."
        className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mega-yellow"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
      >
        <Search className="w-5 h-5 text-gray-600" />
      </button>
    </form>
  );
}
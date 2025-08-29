'use client';

import { Search, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className={`relative transition-all duration-300 ${
            isFocused ? 'scale-[1.02]' : ''
          }`}>
            {/* 검색 입력 필드 */}
            <div className={`relative rounded-2xl transition-all duration-300 ${
              isFocused 
                ? 'shadow-2xl shadow-purple-500/20' 
                : 'shadow-lg'
            }`}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="상품명, 브랜드, 카테고리 검색..."
                className={`w-full px-14 py-4 bg-white rounded-2xl text-gray-900 placeholder-gray-400 
                  border-2 transition-all duration-300 outline-none font-medium
                  ${isFocused 
                    ? 'border-purple-500' 
                    : 'border-transparent hover:border-gray-200'
                  }`}
              />
              
              {/* 왼쪽 아이콘 */}
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <Search className={`w-5 h-5 transition-colors duration-300 ${
                  isFocused ? 'text-purple-500' : 'text-gray-400'
                }`} />
              </div>
              
              {/* 오른쪽 버튼들 */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                  >
                    <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                )}
                
                {/* AI 추천 버튼 */}
                <button
                  type="button"
                  className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl 
                    hover:from-purple-600 hover:to-blue-600 transition-all duration-200 
                    transform hover:scale-105 group"
                  title="AI 추천"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* 포커스 시 그라데이션 효과 */}
            {isFocused && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 to-blue-400 
                opacity-20 blur-xl pointer-events-none animate-pulse-glow" />
            )}
          </div>
          
          {/* 인기 검색어 */}
          {!searchTerm && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">인기:</span>
              {['한우', '제주 감귤', '신라면', '콜라', '젤리'].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => onSearchChange(keyword)}
                  className="px-3 py-1 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 
                    rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
                >
                  {keyword}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
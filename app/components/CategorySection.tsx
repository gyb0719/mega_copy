'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Package, Shirt, Watch, Briefcase, Sparkles } from 'lucide-react';

interface CategorySectionProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  productCounts?: Record<string, number>;
}

const categories = [
  { name: '전체', icon: Package, color: 'from-purple-500 to-blue-500' },
  { name: '남성 상의', icon: Shirt, color: 'from-blue-500 to-cyan-500' },
  { name: '남성 하의', icon: Shirt, color: 'from-cyan-500 to-teal-500' },
  { name: '여성 의류', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
  { name: '모자', icon: Package, color: 'from-orange-500 to-yellow-500' },
  { name: '벨트', icon: Package, color: 'from-green-500 to-emerald-500' },
  { name: '신발', icon: Package, color: 'from-indigo-500 to-purple-500' },
  { name: '숄/머플러', icon: Package, color: 'from-red-500 to-pink-500' },
  { name: '가방', icon: Briefcase, color: 'from-amber-500 to-orange-500' },
  { name: '지갑', icon: Package, color: 'from-teal-500 to-green-500' },
  { name: '안경/선글라스', icon: Package, color: 'from-purple-500 to-indigo-500' },
  { name: '시계/넥타이', icon: Watch, color: 'from-gray-500 to-gray-700' },
  { name: '악세서리', icon: Sparkles, color: 'from-pink-500 to-purple-500' },
  { name: '향수', icon: Package, color: 'from-rose-500 to-pink-500' },
  { name: '기타', icon: Package, color: 'from-slate-500 to-slate-700' }
];

export default function CategorySection({ selectedCategory, onCategorySelect, productCounts = {} }: CategorySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-8 px-4 border-b border-gray-100">
      <div className="container mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 
            bg-clip-text text-transparent mb-2">
            카테고리별 쇼핑
          </h2>
          <p className="text-gray-500 text-sm">원하시는 카테고리를 선택해주세요</p>
        </div>
        
        {/* Desktop Grid - 현대적인 카드 스타일 */}
        <div className="hidden lg:grid lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.name;
            const count = productCounts[category.name];
            
            return (
              <button
                key={category.name}
                onClick={() => onCategorySelect(category.name)}
                className={`relative group transition-all duration-300 ${
                  isSelected ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <div className={`
                  p-4 rounded-2xl transition-all duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-r ' + category.color + ' shadow-lg shadow-purple-500/25' 
                    : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
                  }
                `}>
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`w-8 h-8 transition-colors duration-300 ${
                      isSelected ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'
                    }`} />
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      isSelected ? 'text-white' : 'text-gray-700 group-hover:text-purple-600'
                    }`}>
                      {category.name}
                    </span>
                  </div>
                  
                  {count !== undefined && count > 0 && (
                    <span className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${
                      isSelected 
                        ? 'bg-white text-purple-600' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    }`}>
                      {count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tablet Horizontal Scroll */}
        <div className="hidden md:block lg:hidden relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm 
                rounded-full shadow-lg hover:bg-white transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm 
                rounded-full shadow-lg hover:bg-white transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
          
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.name;
              const count = productCounts[category.name];
              
              return (
                <button
                  key={category.name}
                  onClick={() => onCategorySelect(category.name)}
                  className={`relative flex-shrink-0 transition-all duration-300 ${
                    isSelected ? 'scale-105' : ''
                  }`}
                >
                  <div className={`
                    px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2
                    ${isSelected 
                      ? 'bg-gradient-to-r ' + category.color + ' shadow-lg' 
                      : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-semibold whitespace-nowrap ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}>
                      {category.name}
                    </span>
                    
                    {count !== undefined && count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Grid - 컴팩트한 디자인 */}
        <div className="md:hidden grid grid-cols-3 gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name;
            const count = productCounts[category.name];
            
            return (
              <button
                key={category.name}
                onClick={() => onCategorySelect(category.name)}
                className="relative"
              >
                <div className={`
                  py-3 px-2 rounded-xl text-xs font-semibold transition-all duration-200
                  ${isSelected 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 shadow-sm'
                  }
                `}>
                  {category.name}
                  {count !== undefined && count > 0 && (
                    <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected 
                        ? 'bg-white text-purple-600' 
                        : 'bg-purple-600 text-white'
                    }`}>
                      {count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
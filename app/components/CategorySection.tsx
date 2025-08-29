'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategorySectionProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  productCounts?: Record<string, number>;
}

const categories = [
  '전체',
  '남성 상의', '남성 하의', '여성 의류',
  '모자', '벨트', '신발',
  '숄/머플러', '가방', '지갑',
  '안경/선글라스', '시계/넥타이', '악세서리',
  '향수', '기타'
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
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow-sm">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">CATEGORY</h2>
        
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`
                py-3 px-4 rounded-lg font-medium transition-all duration-200 relative
                ${selectedCategory === category 
                  ? 'bg-mega-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category}
              {productCounts[category] !== undefined && productCounts[category] > 0 && (
                <span className={`absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full ${
                  selectedCategory === category 
                    ? 'bg-mega-yellow text-black' 
                    : 'bg-mega-red text-white'
                }`}>
                  {productCounts[category]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-1 rounded-full shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className={`
                  flex-shrink-0 py-2 px-4 rounded-lg font-medium transition-all duration-200
                  ${selectedCategory === category 
                    ? 'bg-mega-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
          
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-1 rounded-full shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

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
  return (
    <div className="bg-white py-4 px-4 shadow-sm">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">CATEGORY</h2>
        
        {/* Desktop Grid - 모든 카테고리가 한 번에 보이도록 */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`
                py-2 px-3 text-sm rounded-lg font-medium transition-all duration-200 relative
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

        {/* Mobile Grid - 모바일에서도 그리드로 모든 카테고리 표시 */}
        <div className="md:hidden grid grid-cols-3 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`
                py-2 px-2 text-xs rounded-lg font-medium transition-all duration-200 relative
                ${selectedCategory === category 
                  ? 'bg-mega-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category}
              {productCounts[category] !== undefined && productCounts[category] > 0 && (
                <span className={`absolute -top-1 -right-1 text-xs px-1 py-0.5 rounded-full ${
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
      </div>
    </div>
  );
}
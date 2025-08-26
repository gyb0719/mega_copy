'use client';

interface CategorySectionProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const categories = [
  '전체',
  '남성 상의', '남성 하의', '여성 의류',
  '모자', '벨트', '신발',
  '숄/머플러', '가방', '지갑',
  '안경/선글라스', '시계/넥타이', '악세서리',
  '향수', '기타'
];

export default function CategorySection({ selectedCategory, onCategorySelect }: CategorySectionProps) {
  return (
    <div className="bg-white py-8 px-4 shadow-sm">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">CATEGORY</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`
                py-3 px-4 rounded-lg font-medium transition-all duration-200
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
      </div>
    </div>
  );
}
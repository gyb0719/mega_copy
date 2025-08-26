'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  category: string;
}

interface ProductGridProps {
  category: string;
}

// 임시 샘플 데이터
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Monogram Bag',
    brand: 'LV Style',
    price: 450000,
    images: ['/api/placeholder/300/300'],
    category: '가방'
  },
  {
    id: '2',
    name: 'Vintage Check Shirt',
    brand: 'BB Style',
    price: 180000,
    images: ['/api/placeholder/300/300'],
    category: '남성 상의'
  },
  {
    id: '3',
    name: 'Logo Belt',
    brand: 'GG Style',
    price: 220000,
    images: ['/api/placeholder/300/300'],
    category: '벨트'
  },
];

export default function ProductGrid({ category }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(sampleProducts);

  const filteredProducts = category === '전체' 
    ? products 
    : products.filter(p => p.category === category);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {category} ({filteredProducts.length}개)
        </h3>
        <select className="border rounded px-3 py-1">
          <option>최신순</option>
          <option>인기순</option>
          <option>가격 낮은순</option>
          <option>가격 높은순</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Link 
            key={product.id}
            href={`/product/${product.id}`}
            className="group cursor-pointer"
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">상품 이미지</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">{product.brand}</p>
              <h3 className="font-medium group-hover:text-mega-red transition-colors">
                {product.name}
              </h3>
              <p className="font-bold">₩{product.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">해당 카테고리에 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
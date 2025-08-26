'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  product_images?: ProductImage[];
}

interface ProductGridProps {
  category: string;
}

export default function ProductGrid({ category }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category && category !== '전체') {
        params.append('category', category);
      }
      
      const response = await fetch(`/api/products?${params.toString()}`);
      const result = await response.json();
      
      if (result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {category} ({products.length}개)
        </h3>
        <select className="border rounded px-3 py-1">
          <option>최신순</option>
          <option>인기순</option>
          <option>가격 낮은순</option>
          <option>가격 높은순</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const mainImage = product.product_images?.[0]?.image_url;
          
          return (
            <Link 
              key={product.id}
              href={`/product/${product.id}`}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">상품 이미지</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">{product.brand}</p>
                <h3 className="font-medium group-hover:text-mega-red transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="font-bold">₩{product.price.toLocaleString()}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">해당 카테고리에 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
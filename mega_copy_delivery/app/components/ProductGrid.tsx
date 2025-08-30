'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

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
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [category]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (category && category !== '전체') {
        params.append('category', category);
      }
      params.append('limit', itemsPerPage.toString());
      params.append('offset', ((page - 1) * itemsPerPage).toString());
      
      const response = await fetch(`/api/products?${params.toString()}`);
      
      // API가 아직 구현되지 않았거나 Supabase 연결이 안된 경우를 처리
      if (response.status === 404) {
        // 임시 데이터 사용
        setProducts([]);
        setTotalProducts(0);
        return;
      }
      
      const result = await response.json();
      
      if (result.error) {
        // API 에러 메시지가 있는 경우
        console.warn('API Error:', result.error);
        setProducts([]);
        setTotalProducts(0);
      } else if (result.data) {
        setProducts(result.data);
        // total이 있으면 사용, 없으면 현재 페이지 데이터 개수 사용
        if (result.total !== undefined) {
          setTotalProducts(result.total);
        } else {
          // 첫 페이지이고 limit보다 적은 데이터가 왔다면 그게 전체 개수
          if (page === 1 && result.data.length < itemsPerPage) {
            setTotalProducts(result.data.length);
          } else {
            // 그 외의 경우 최소한 현재 페이지까지의 데이터는 있다고 가정
            setTotalProducts(page * itemsPerPage);
          }
        }
      } else {
        // 데이터가 없는 경우
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // 네트워크 에러나 기타 에러의 경우 빈 배열로 처리
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" message="상품을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          title="상품 로드 실패"
          message={error}
          onRetry={() => fetchProducts(currentPage)}
        />
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalProducts}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
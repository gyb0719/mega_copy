'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';
import { productsAPI } from '../../lib/supabase-rpc-api';

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
  description?: string;
  created_at: string;
  image_url?: string;
  additional_images?: string[];
  product_images?: ProductImage[];
}

interface ProductGridOptimizedProps {
  category: string;
  searchTerm?: string;
}

function ProductCard({ product }: { product: Product }) {
  // 이미지 우선순위: product_images > image_url
  const mainImage = product.product_images?.[0]?.image_url || product.image_url;

  return (
    <Link href={`/product?id=${product.id}`} className="group cursor-pointer block h-full">
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs md:text-sm text-gray-400 font-bold">이미지 준비중</span>
            </div>
          )}
        </div>
        <div className="p-2 md:p-3 space-y-1 flex-grow">
          <h3 className="text-sm md:text-base font-black group-hover:text-mega-red transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm md:text-base font-black">₩{product.price.toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}

export default function ProductGridOptimized({ category, searchTerm = '' }: ProductGridOptimizedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 18; // 6 rows * 3 columns
  const observerTarget = useRef<HTMLDivElement>(null);

  // 상품 데이터 가져오기
  const fetchProducts = useCallback(async () => {
    try {
      console.log('[ProductGrid] Fetching products...');
      const result = await productsAPI.getAll({ limit: 1000 });
      
      console.log('[ProductGrid] API Response:', result);
      console.log('[ProductGrid] Response success:', result.success);
      console.log('[ProductGrid] Response data:', result.data);
      console.log('[ProductGrid] Data length:', result.data?.length);
      
      if (result.data) {
        const allProducts = Array.isArray(result.data) ? result.data : [];
        console.log('[ProductGrid] Products array:', allProducts);
        // 최신순 정렬
        const sortedProducts = allProducts.sort((a: Product, b: Product) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });
        setProducts(sortedProducts);
        console.log('[ProductGrid] Set products:', sortedProducts.length);
      } else {
        console.log('[ProductGrid] No data in response');
        setProducts([]);
      }
    } catch (error) {
      console.error('[ProductGrid] Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 카테고리 및 검색어 필터링, 페이지네이션
  useEffect(() => {
    let filtered = category === '전체' 
      ? products 
      : products.filter(p => p.category === category);
    
    // 검색어 필터링 (제목과 설명에서 검색)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }
    
    const startIndex = 0;
    const endIndex = page * itemsPerPage;
    const paginatedProducts = filtered.slice(startIndex, endIndex);
    
    setDisplayProducts(paginatedProducts);
    setHasMore(filtered.length > endIndex);
  }, [products, category, searchTerm, page]);

  // 더 많은 아이템 로드
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, hasMore]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore]);

  // 카테고리 또는 검색어 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [category, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-gray-500 font-bold">
          {searchTerm ? '검색 결과가 없습니다.' : '해당 카테고리에 상품이 없습니다.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 상품 그리드 - 3개씩 표시 */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 무한 스크롤 트리거 */}
      {hasMore && (
        <div 
          ref={observerTarget}
          className="flex justify-center items-center py-8"
        >
          {isLoadingMore ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mega-yellow"></div>
              <span className="text-sm text-gray-500">상품 불러오는 중...</span>
            </div>
          ) : (
            <div className="h-10" />
          )}
        </div>
      )}

      {!hasMore && displayProducts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">모든 상품을 불러왔습니다.</p>
        </div>
      )}
    </div>
  );
}
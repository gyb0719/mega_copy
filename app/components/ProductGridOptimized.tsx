'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';
import { productsAPI } from '../../lib/supabase-client';
import { Heart, ShoppingCart, Star, TrendingUp, Zap } from 'lucide-react';

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
  original_price?: number;
  discount_percentage?: number;
  category: string;
  created_at: string;
  image_url?: string;
  additional_images?: string[];
  product_images?: ProductImage[];
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
}

interface ProductGridOptimizedProps {
  category: string;
  searchTerm?: string;
}

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const mainImage = product.product_images?.[0]?.image_url || product.image_url;
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  
  return (
    <Link href={`/product?id=${product.id}`} className="group block h-full">
      <div 
        className="relative h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 할인 배지 */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse-glow">
            {product.discount_percentage}% OFF
          </div>
        )}
        
        {/* Featured 배지 */}
        {product.is_featured && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-full shadow-lg">
            <Zap className="w-4 h-4" />
          </div>
        )}
        
        {/* 이미지 컨테이너 */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400 font-medium">이미지 준비중</span>
              </div>
            </div>
          )}
          
          {/* 호버 오버레이 */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
                className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="flex-1 bg-white/90 backdrop-blur-md text-gray-900 px-4 py-2 rounded-full font-semibold text-sm hover:bg-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                장바구니
              </button>
            </div>
          </div>
        </div>
        
        {/* 상품 정보 */}
        <div className="p-4 space-y-2">
          {/* 브랜드 */}
          {product.brand && (
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">
              {product.brand}
            </p>
          )}
          
          {/* 상품명 */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          
          {/* 평점 */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {product.rating} ({product.reviews_count || 0})
              </span>
            </div>
          )}
          
          {/* 가격 */}
          <div className="flex items-baseline gap-2">
            {hasDiscount && product.original_price ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  ₩{product.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₩{product.original_price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ₩{product.price.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* 트렌딩 인디케이터 */}
          {product.reviews_count && product.reviews_count > 100 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">인기 상품</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProductGridOptimized({ category, searchTerm }: ProductGridOptimizedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 18;
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const result = await productsAPI.getAll({ limit: 1000 });
      
      if (result.data) {
        const allProducts = Array.isArray(result.data) ? result.data : [];
        const sortedProducts = allProducts.sort((a: Product, b: Product) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });
        setProducts(sortedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let filtered = category === '전체' 
      ? products 
      : products.filter(p => p.category === category);
    
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const startIndex = 0;
    const endIndex = page * itemsPerPage;
    const paginatedProducts = filtered.slice(startIndex, endIndex);
    
    setDisplayProducts(paginatedProducts);
    setHasMore(filtered.length > endIndex);
  }, [products, category, searchTerm, page]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, hasMore]);

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

  useEffect(() => {
    setPage(1);
  }, [category, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">상품이 없습니다</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `"${searchTerm}"에 대한 검색 결과가 없습니다.`
              : '해당 카테고리에 상품이 없습니다.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 상품 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
        {displayProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both'
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* 무한 스크롤 트리거 */}
      {hasMore && (
        <div 
          ref={observerTarget}
          className="flex justify-center items-center py-12"
        >
          {isLoadingMore ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-500 font-medium">더 많은 상품 불러오는 중...</span>
            </div>
          ) : (
            <div className="h-10" />
          )}
        </div>
      )}

      {!hasMore && displayProducts.length > 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-sm text-gray-600 font-medium">
              총 {displayProducts.length}개의 상품을 모두 불러왔습니다
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
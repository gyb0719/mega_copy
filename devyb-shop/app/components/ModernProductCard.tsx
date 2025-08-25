'use client';

import Link from 'next/link';
import { Star, ShoppingCart, Heart, Zap, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { useState, useEffect } from 'react';

interface ModernProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ModernProductCard({ product, onAddToCart }: ModernProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(product.id));
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isWishlisted) {
      const updated = wishlist.filter((id: string) => id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    } else {
      wishlist.push(product.id);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    setIsWishlisted(!isWishlisted);
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const discountRate = Math.floor(Math.random() * 30) + 10; // 10-40% 랜덤 할인율
  const originalPrice = Math.floor(product.price / (1 - discountRate / 100));

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group border border-gray-100 hover:border-blue-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div 
        className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
        onClick={() => window.location.href = `/products/${product.id}`}
      >
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-110 brightness-110' : 'scale-100'
            }`}
            loading="lazy"
          />
          
          {/* 호버 오버레이 */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discountRate > 25 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Zap className="h-3 w-3" />
                특가
              </span>
            )}
            {product.stock < 10 && product.stock > 0 && (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                {product.stock}개 남음
              </span>
            )}
            {product.rating >= 4.8 && (
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                인기
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
              isWishlisted 
                ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-lg'
            }`}
          >
            <Heart className={`h-4 w-4 md:h-5 md:w-5 transition-transform duration-200 ${
              isWishlisted ? 'fill-current scale-110' : 'hover:scale-110'
            }`} />
          </button>

          {/* Quick Add Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 transition-all duration-500 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}>
            <div className="w-full space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-white text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-sm md:text-base">{product.stock === 0 ? '품절' : '빠른 구매'}</span>
              </button>
              
              {/* 추가 액션 버튼들 */}
              <div className="flex gap-2">
                <Link 
                  href={`/products/${product.id}`}
                  className="flex-1 bg-white/20 backdrop-blur-sm text-white py-2 rounded-lg text-center text-sm font-medium hover:bg-white/30 transition-all duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  상세보기
                </Link>
                <button className="flex-1 bg-white/20 backdrop-blur-sm text-white py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-300">
                  비교하기
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Content */}
      <Link href={`/products/${product.id}`}>
        <div className="p-4 cursor-pointer">
          {/* Category & Brand */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-blue-600 font-semibold">{product.category}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">DevYB</span>
          </div>

          {/* Product Name */}
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 text-sm md:text-base">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {product.rating} ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                {formatPrice(product.price)}
              </span>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold animate-pulse">
                {discountRate}%
              </span>
            </div>
            <div className="text-xs md:text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded group-hover:bg-blue-100 transition-colors duration-300">
              무료배송
            </span>
            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded group-hover:bg-green-100 transition-colors duration-300">
              오늘출발
            </span>
            {product.stock < 5 && product.stock > 0 && (
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded animate-pulse">
                마감임박
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { MessageCircle, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useInventoryStore } from '@/lib/stores/useInventoryStore';

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
  description: string | null;
  stock: number;
  product_images?: ProductImage[];
}

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const { stocks, loadStock, subscribeToStockUpdates } = useInventoryStore();
  const productId = params.id as string;
  const currentStock = stocks.get(productId) || product?.stock || 0;
  
  useEffect(() => {
    fetchProduct();
    loadStock(productId);
    
    // 실시간 재고 업데이트 구독
    const unsubscribe = subscribeToStockUpdates(productId);
    return () => unsubscribe();
  }, [productId]);
  
  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const result = await response.json();
      
      if (result.data) {
        setProduct(result.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (product && product.product_images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.product_images.length);
    }
  };

  const prevImage = () => {
    if (product && product.product_images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.product_images.length) % product.product_images.length);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center text-gray-600 mb-6 hover:text-black">
            <ChevronLeft className="w-5 h-5" />
            뒤로가기
          </Link>
          <div className="text-center py-20">
            <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }
  
  const images = product.product_images || [];
  const currentImage = images[currentImageIndex]?.image_url;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 mb-6 hover:text-black">
          <ChevronLeft className="w-5 h-5" />
          뒤로가기
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 이미지 섹션 */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">상품 이미지</span>
                </div>
              )}
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* 썸네일 */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-mega-black' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              <p className="text-gray-500 mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-mega-red">
                ₩{product.price.toLocaleString()}
              </p>
            </div>

            {product.description && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">상품 설명</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">상품 정보</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 카테고리: {product.category}</li>
                <li>• 브랜드: {product.brand}</li>
                <li className="flex items-center gap-2">
                  • 재고: 
                  {currentStock > 0 ? (
                    <>
                      <span className={`font-semibold ${currentStock <= 5 ? 'text-red-600' : ''}`}>
                        {currentStock}개
                      </span>
                      {currentStock <= 5 && (
                        <span className="text-red-600 text-sm">(품절 임박)</span>
                      )}
                    </>
                  ) : (
                    <span className="text-red-600 font-semibold">품절</span>
                  )}
                </li>
              </ul>
            </div>

            {/* 구매 버튼 */}
            <div className="border-t pt-6">
              {currentStock <= 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-600 font-semibold">현재 품절된 상품입니다</p>
                    <p className="text-red-600 text-sm mt-1">재입고 문의는 카카오톡으로 해주세요</p>
                  </div>
                </div>
              )}
              
              <a
                href="http://pf.kakao.com/_xjxexdG"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-3 w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                  currentStock > 0 
                    ? 'bg-mega-yellow text-black hover:bg-yellow-400' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <MessageCircle className="w-6 h-6" />
                {currentStock > 0 ? '카카오톡으로 구매 상담하기' : '재입고 문의하기'}
              </a>
              <p className="text-sm text-gray-500 text-center mt-3">
                모든 주문 및 상담은 카카오톡을 통해 진행됩니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import { MessageCircle, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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
  image_url?: string;
  additional_images?: string[];
  product_images?: ProductImage[];
}

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const fromUrl = searchParams.get('from') || '/';

  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);
  
  const fetchProduct = async () => {
    try {
      // Supabase에서 직접 상품 정보 가져오기
      const { supabase } = await import('../../lib/supabase');
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (productError) {
        console.error('Product fetch error:', productError);
        throw productError;
      }
      
      // 상품 이미지 가져오기 (최대 21개 - 메인 1개 + 상세 20개)
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order')
        .limit(21);
      
      if (imagesError) {
        console.error('Images fetch error:', imagesError);
      }
      
      
      if (product) {
        setProduct({
          ...product,
          product_images: images || [],
          additional_images: images?.map(img => img.image_url) || []
        });
      } else {
        throw new Error('상품 정보가 없습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError(error instanceof Error ? error.message : '상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 이미지 배열 생성 (product_images + 기본 image_url)
  // 기존 상품: products.image_url에만 이미지가 있을 수 있음
  // 신규 상품: product_images 테이블에 모든 이미지 저장
  let allImages: string[] = [];
  
  if (product) {
    // product_images가 있으면 사용
    if (product.product_images && product.product_images.length > 0) {
      allImages = product.product_images
        .sort((a, b) => a.display_order - b.display_order)
        .map(img => img.image_url);
    } 
    // product_images가 없지만 image_url이 있으면 사용
    else if (product.image_url) {
      allImages = [product.image_url];
      // additional_images가 있으면 추가 (레거시 지원)
      if (product.additional_images && product.additional_images.length > 0) {
        allImages = [...allImages, ...product.additional_images];
      }
    }
  }
  
  
  const nextImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };
  
  const prevImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header hideAdminButton={true} />
        <div className="flex justify-center items-center h-[calc(100vh-60px)]">
          <Loader2 className="w-8 h-8 animate-spin text-mega-yellow" />
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header hideAdminButton={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
            <Link
              href={decodeURIComponent(fromUrl)}
              className="inline-block px-6 py-2 bg-mega-yellow text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              scroll={false}
            >
              뒤로가기
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header hideAdminButton={true} />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* 메인 이미지와 상품 정보 */}
        <div className="bg-white rounded-lg overflow-hidden mb-6">
          {/* 이미지 섹션 */}
          <div className="relative aspect-square bg-gray-100">
            {allImages.length > 0 ? (
              <>
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.slice(0, 10).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-black' : 'bg-gray-400'
                          }`}
                        />
                      ))}
                      {allImages.length > 10 && (
                        <span className="text-xs text-gray-500 ml-1">+{allImages.length - 10}</span>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : product?.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">이미지 준비중</span>
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="p-4 space-y-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold break-words">{product.name}</h1>
              {product.brand && (
                <p className="text-sm md:text-base text-gray-600">{product.brand}</p>
              )}
            </div>
            
            <div>
              <span className="text-2xl md:text-3xl font-bold text-black">
                ₩{Number(product.price || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-sm md:text-base">
                <span className="text-gray-600">카테고리</span>
                <span className="font-medium">{product.category}</span>
              </div>
            </div>
            
            {product.description && (
              <div className="border-t pt-3">
                <h2 className="text-sm md:text-base font-bold mb-2">상품 설명</h2>
                <div className="relative">
                  <div className="text-sm md:text-base text-gray-700 whitespace-pre-line break-words leading-relaxed">
                    {product.description}
                  </div>
                </div>
                
              </div>
            )}
          </div>
        </div>

        {/* 상세 이미지들 - 1열로 표시 (최대 21개, 메인 포함) */}
        {allImages.length > 0 && (
          <div className="space-y-4 mb-20">
            <h2 className="text-lg font-bold text-gray-800 mb-2">상품 상세 이미지</h2>
            {/* 모든 이미지를 표시 (display_order 순서대로) */}
            {allImages.slice(0, 21).map((image, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={image} 
                  alt={`${product.name} 상세 ${index + 1}`}
                  className="w-full h-auto"
                  loading="lazy"
                  onError={(e) => {
                    console.error(`Image ${index + 1} failed to load:`, image);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
            {allImages.length > 21 && (
              <p className="text-center text-gray-500 text-sm">
                + {allImages.length - 21}개의 이미지가 더 있습니다
              </p>
            )}
          </div>
        )}

        {/* 문의 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <a
            href="https://open.kakao.com/o/sR4Po4Xh"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-mega-yellow text-black font-bold py-3 rounded-lg text-center flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            카카오톡 문의하기
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header hideAdminButton={true} />
        <div className="flex justify-center items-center h-[calc(100vh-60px)]">
          <Loader2 className="w-8 h-8 animate-spin text-mega-yellow" />
        </div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}
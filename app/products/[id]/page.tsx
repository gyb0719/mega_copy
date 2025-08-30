'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url?: string;
  additional_images?: string[];
  product_images?: Array<{
    id: string;
    image_url: string;
    display_order: number;
    is_primary?: boolean;
  }>;
  stock: number;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 모든 이미지 배열 (product_images 우선 사용, 없으면 additional_images 사용)
  const allImages = product ? (
    product.product_images && product.product_images.length > 0
      ? product.product_images
          .sort((a, b) => a.display_order - b.display_order)
          .map(img => img.image_url)
      : [
          product.image_url,
          ...(product.additional_images || [])
        ].filter(Boolean)
  ) : [];

  useEffect(() => {
    // Handle both string and array params (Next.js can return either)
    const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    
    if (productId) {
      fetchProduct();
    }
  }, [params?.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Handle both string and array params
      const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;
      
      if (!productId) {
        throw new Error('상품 ID가 없습니다');
      }
      
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('상품을 불러올 수 없습니다');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setProduct(result.data);
      } else if (result.success === false && result.data) {
        setProduct(result.data);
      } else if (!result.success && !result.data && result.id) {
        setProduct(result);
      } else {
        throw new Error('상품 정보가 없습니다');
      }
    } catch (error) {
      console.error('[ProductDetail] Failed to fetch product:', error);
      setError(error instanceof Error ? error.message : '상품을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: product?.name,
        text: `${product?.name} - ₩${product?.price.toLocaleString()}`,
        url: window.location.href,
      }).catch(err => {
        console.log('Share failed:', err);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };
  
  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('링크가 복사되었습니다!');
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mega-yellow"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-bold mb-4">{error}</p>
        <Link href="/" className="text-mega-yellow hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-bold mb-4">상품을 찾을 수 없습니다</p>
        <Link href="/" className="text-mega-yellow hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => router.back()} className="p-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg">상품 상세</h1>
            <button onClick={handleShare} className="p-2">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 상품 정보 섹션 (글이 먼저) */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          {/* 카테고리 */}
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          
          {/* 상품명 */}
          <h1 className="text-2xl font-black mb-4">{product.name}</h1>
          
          {/* 가격 */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-black text-mega-red">
              ₩{Number(product.price || 0).toLocaleString()}
            </span>
          </div>

          {/* 상품 설명 */}
          {product.description && (
            <div className="mb-6">
              <h2 className="font-bold text-lg mb-3">상품 설명</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 이미지 섹션 (무한 스크롤 형태) */}
      <div className="mt-2">
        {allImages.length > 0 ? (
          <div className="space-y-2">
            {allImages.map((imageUrl, index) => (
              <div key={index} className="bg-white">
                <div className="aspect-square md:aspect-[4/3] lg:aspect-[16/9] relative overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`${product.name} - 이미지 ${index + 1}`}
                    className="w-full h-full object-contain bg-gray-50"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.jpg';
                    }}
                  />
                  {/* 이미지 번호 표시 */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {index + 1} / {allImages.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white">
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 font-bold">이미지 없음</span>
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="container mx-auto px-4 py-3">
          <a
            href="https://open.kakao.com/o/smsyINOh"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-mega-yellow text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-center"
          >
            구매하기
          </a>
        </div>
      </div>

      {/* 하단 여백 (고정 버튼 높이만큼) */}
      <div className="h-20"></div>
    </div>
  );
}
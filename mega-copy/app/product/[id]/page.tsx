'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetail() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 임시 데이터
  const product = {
    id: params.id,
    name: 'Classic Monogram Bag',
    brand: 'LV Style',
    price: 450000,
    description: '최고급 레플리카 명품 가방입니다. 정품과 99% 동일한 퀄리티를 자랑합니다.',
    images: Array(5).fill('/api/placeholder/600/600'),
    details: [
      '소재: 최고급 캔버스',
      '사이즈: 30cm x 25cm x 15cm',
      '구성품: 본품, 더스트백, 박스',
      '원산지: Made in France 각인',
    ]
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

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
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">상품 이미지 {currentImageIndex + 1}</span>
              </div>
              
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            {/* 썸네일 */}
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-mega-black' : 'border-gray-200'
                  }`}
                >
                  <div className="w-full h-full bg-gray-200" />
                </button>
              ))}
            </div>
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

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">상품 설명</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">상품 상세</h3>
              <ul className="space-y-2 text-gray-600">
                {product.details.map((detail, index) => (
                  <li key={index}>• {detail}</li>
                ))}
              </ul>
            </div>

            {/* 구매 버튼 */}
            <div className="border-t pt-6">
              <a
                href="http://pf.kakao.com/_xjxexdG"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-mega-yellow text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
                카카오톡으로 구매 상담하기
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
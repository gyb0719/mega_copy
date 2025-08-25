'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';
import Link from 'next/link';

interface TimeDealProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  stock: number;
  soldCount: number;
}

export default function TimeDealSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  // 다음 날 오전 12시까지의 남은 시간 계산
  const calculateTimeLeft = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const difference = tomorrow.getTime() - now.getTime();
    
    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    } else {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
  };

  const timeDealProducts: TimeDealProduct[] = [
    {
      id: '1',
      name: 'AirPods Pro 2세대',
      price: 299000,
      originalPrice: 359000,
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
      stock: 15,
      soldCount: 85
    },
    {
      id: '2',
      name: 'iPad Air 5세대',
      price: 779000,
      originalPrice: 929000,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      stock: 8,
      soldCount: 42
    },
    {
      id: '3',
      name: 'Galaxy Watch 6',
      price: 329000,
      originalPrice: 399000,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
      stock: 20,
      soldCount: 30
    },
    {
      id: '4',
      name: 'Sony WH-1000XM5',
      price: 389000,
      originalPrice: 499000,
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
      stock: 5,
      soldCount: 95
    }
  ];

  useEffect(() => {
    // 초기 시간 설정
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // 시간이 다 되었으면 만료 상태로 설정
      if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsExpired(true);
        // 5초 후 새 딜 시작
        setTimeout(() => {
          setIsExpired(false);
        }, 5000);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <section className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-red-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold">오늘의 타임딜</h2>
          </div>
          
          {isExpired ? (
            <div className="bg-gray-500 text-white px-4 py-2 rounded-lg animate-pulse">
              <span className="font-bold text-sm">딜 종료! 새 딜 준비 중...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  <div className="flex items-center gap-1 font-mono font-bold text-sm sm:text-base">
                    <div className="bg-white/20 px-2 py-1 rounded min-w-[2rem] text-center">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <span>:</span>
                    <div className="bg-white/20 px-2 py-1 rounded min-w-[2rem] text-center">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <span>:</span>
                    <div className="bg-white/20 px-2 py-1 rounded min-w-[2rem] text-center animate-pulse">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 hidden sm:block">
                <div>내일 자정까지</div>
              </div>
            </div>
          )}
        </div>
        <Link href="/deals" className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-all">
          전체보기 →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {timeDealProducts.map((product, index) => {
          const soldPercentage = (product.soldCount / (product.soldCount + product.stock)) * 100;
          const isAlmostSoldOut = soldPercentage > 80;
          
          return (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div 
                className={`bg-white rounded-xl border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group ${
                  isExpired ? 'opacity-60 pointer-events-none' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-36 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-lg text-xs sm:text-sm font-bold shadow-lg animate-pulse">
                    {calculateDiscount(product.originalPrice, product.price)}% OFF
                  </div>
                  {isAlmostSoldOut && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold animate-bounce">
                      마감임박
                    </div>
                  )}
                  {isExpired && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-sm bg-gray-900/80 px-3 py-1 rounded-lg">
                        딜 종료
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-4">
                  <h3 className="font-medium text-xs sm:text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                    <span className="text-base sm:text-lg font-bold text-red-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </div>
                  
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${soldPercentage}%`,
                        animation: 'progressFill 2s ease-out'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span className="font-medium text-green-600">
                      {product.soldCount}개 판매
                    </span>
                    <span className={`font-medium ${
                      product.stock < 10 ? 'text-red-600 animate-pulse' : 'text-gray-600'
                    }`}>
                      {product.stock}개 남음
                    </span>
                  </div>
                  
                  {!isExpired && product.stock < 5 && (
                    <div className="mt-2 text-center">
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold animate-pulse">
                        품절임박!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
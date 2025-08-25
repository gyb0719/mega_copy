'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      title: '새로운 MacBook Pro',
      subtitle: 'M3 칩셋 탑재',
      description: '역대 최고의 성능을 경험하세요',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200',
      buttonText: '자세히 보기',
      bgColor: 'bg-gradient-to-br from-gray-900 to-gray-700'
    },
    {
      id: 2,
      title: 'iPhone 15 Pro',
      subtitle: '티타늄 디자인',
      description: '프로급 카메라 시스템',
      image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200',
      buttonText: '구매하기',
      bgColor: 'bg-gradient-to-br from-blue-900 to-blue-700'
    },
    {
      id: 3,
      title: 'Galaxy Z Fold 5',
      subtitle: '접는 스마트폰의 완성',
      description: '새로운 모바일 경험',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200',
      buttonText: '더 알아보기',
      bgColor: 'bg-gradient-to-br from-purple-900 to-purple-700'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl shadow-2xl">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className={`relative h-full ${slide.bgColor}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 h-[70%] sm:h-[80%] md:h-[85%] object-contain opacity-90"
              loading="lazy"
            />
            <div className="relative z-10 h-full flex items-center">
              <div className="px-4 sm:px-8 md:px-16 max-w-xl">
                <p className="text-white/80 text-xs sm:text-sm md:text-base mb-1 md:mb-2">{slide.subtitle}</p>
                <h2 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight">{slide.title}</h2>
                <p className="text-white/90 text-sm sm:text-base md:text-lg mb-4 md:mb-8 line-clamp-2">{slide.description}</p>
                <button className="bg-white text-gray-900 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base">
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 hidden sm:block"
      >
        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 hidden sm:block"
      >
        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>

      {/* Touch indicators for mobile */}
      <div className="absolute bottom-16 left-4 right-4 flex justify-between sm:hidden">
        <button
          onClick={goToPrevious}
          className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={goToNext}
          className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white w-6 h-2 sm:w-8 sm:h-2' 
                : 'bg-white/50 hover:bg-white/70 w-2 h-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
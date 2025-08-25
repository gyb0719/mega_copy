'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Gift, Percent, Crown, Star, Zap, Trophy, Heart } from 'lucide-react';
import ModernHeader from '../components/ModernHeader';
import CartSidebar from '../components/CartSidebar';
import { CartItem } from '../types';

export default function BenefitsPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const benefits = [
    {
      icon: Crown,
      title: 'VIP 멤버십',
      description: '연간 100만원 이상 구매 시 자동 승급',
      perks: ['추가 10% 할인', '무료 배송', '우선 고객 지원']
    },
    {
      icon: Percent,
      title: '첫 구매 할인',
      description: '신규 회원 첫 구매 시 20% 할인',
      perks: ['최대 10만원 할인', '모든 상품 적용', '30일 내 사용']
    },
    {
      icon: Gift,
      title: '생일 쿠폰',
      description: '생일 달 특별 할인 쿠폰 제공',
      perks: ['30% 할인 쿠폰', '무료 선물 포장', '생일 축하 메시지']
    },
    {
      icon: Star,
      title: '리뷰 포인트',
      description: '상품 리뷰 작성 시 포인트 적립',
      perks: ['텍스트 리뷰 500P', '포토 리뷰 1000P', '동영상 리뷰 2000P']
    },
    {
      icon: Zap,
      title: '플래시 세일',
      description: '매주 목요일 한정 수량 특가',
      perks: ['최대 70% 할인', '회원 전용 알림', '우선 구매 기회']
    },
    {
      icon: Trophy,
      title: '등급별 혜택',
      description: '구매 금액에 따른 등급 혜택',
      perks: ['브론즈: 3% 적립', '실버: 5% 적립', '골드: 7% 적립']
    }
  ];

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      <ModernHeader
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="h-5 w-5" />
          돌아가기
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">회원 혜택</h1>
          <p className="text-lg text-gray-600">DevYB 회원만을 위한 특별한 혜택을 만나보세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{benefit.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{benefit.description}</p>
                <ul className="space-y-2">
                  {benefit.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <Heart className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">지금 회원가입하고 혜택을 받으세요!</h2>
          <p className="mb-6">신규 회원 가입 시 5,000원 적립금 즉시 지급</p>
          <Link href="/signup" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            회원가입 하기
          </Link>
        </div>
      </main>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        totalPrice={totalPrice}
      />
    </div>
  );
}
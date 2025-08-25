'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock, Zap, TrendingUp } from 'lucide-react';
import ModernHeader from '../components/ModernHeader';
import ModernProductCard from '../components/ModernProductCard';
import CartSidebar from '../components/CartSidebar';
import Toast from '../components/Toast';
import { Product, CartItem } from '../types';

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    fetchDeals();
    loadCart();
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    window.addEventListener('cartUpdated', loadCart);
    return () => {
      clearInterval(timer);
      window.removeEventListener('cartUpdated', loadCart);
    };
  }, []);

  const fetchDeals = () => {
    // 할인율이 높은 상품들만 표시
    const dealProducts = [
      {
        id: '1',
        name: 'MacBook Pro 14" M3',
        price: 1673000, // 30% 할인
        description: 'Apple M3 칩, 8GB RAM, 512GB SSD',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        category: '노트북',
        stock: 3,
        rating: 4.8,
        reviews: 125
      },
      {
        id: '3',
        name: 'AirPods Pro 2세대',
        price: 251300, // 30% 할인
        description: '액티브 노이즈 캔슬링, MagSafe 충전',
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500',
        category: '오디오',
        stock: 5,
        rating: 4.7,
        reviews: 203
      },
      {
        id: '6',
        name: 'Sony WH-1000XM5',
        price: 349300, // 30% 할인
        description: '업계 최고 노이즈 캔슬링 헤드폰',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
        category: '오디오',
        stock: 2,
        rating: 4.8,
        reviews: 156
      }
    ];
    setProducts(dealProducts);
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    let newCart: CartItem[];
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setToast({ message: '장바구니에 추가되었습니다!', type: 'success' });
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
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
    window.dispatchEvent(new Event('cartUpdated'));
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

        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-8 w-8" />
                <h1 className="text-3xl font-bold">오늘의 딜</h1>
              </div>
              <p className="text-lg opacity-90">최대 70% 할인! 한정 수량 특가</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <div className="flex gap-1 font-mono text-2xl font-bold">
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span>:</span>
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span>:</span>
                  <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
              <p className="text-xs opacity-90 mt-1">남은 시간</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ModernProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ModernHeader from './components/ModernHeader';
import ModernProductCard from './components/ModernProductCard';
import Toast from './components/Toast';
import { Product, CartItem } from './types';

// 동적 로딩으로 초기 로딩 성능 향상
const CartSidebar = dynamic(() => import('./components/CartSidebar'), { ssr: false });
const HeroCarousel = dynamic(() => import('./components/HeroCarousel'), { 
  ssr: false,
  loading: () => (
    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="skeleton w-64 h-8 mx-auto rounded"></div>
        <div className="skeleton w-48 h-6 mx-auto rounded"></div>
        <div className="skeleton w-32 h-10 mx-auto rounded"></div>
      </div>
    </div>
  )
});
const TimeDealSection = dynamic(() => import('./components/TimeDealSection'), { 
  ssr: false,
  loading: () => (
    <div className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="skeleton w-8 h-8 rounded"></div>
        <div className="skeleton w-40 h-8 rounded"></div>
        <div className="skeleton w-32 h-8 rounded"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-72 rounded-lg"></div>
        ))}
      </div>
    </div>
  )
});

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await fetchProducts();
      loadCart();
      setIsInitialized(true);
    };
    
    initializeApp();
    
    window.addEventListener('cartUpdated', loadCart);
    window.addEventListener('beforeunload', () => {
      // 페이지 떠나기 전 데이터 저장
      localStorage.setItem('cart', JSON.stringify(cart));
    });
    
    return () => {
      window.removeEventListener('cartUpdated', loadCart);
      window.removeEventListener('beforeunload', () => {});
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      // API 요청 시간 제한 추가
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:5000/api/products', {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.warn('API 요청 실패, 기본 데이터 사용:', error);
      // 성능 개선을 위한 기본 데이터
      setProducts([
        {
          id: '1',
          name: 'MacBook Pro 14" M3',
          price: 2390000,
          description: 'Apple M3 칩, 8GB RAM, 512GB SSD',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
          category: '노트북',
          stock: 10,
          rating: 4.8,
          reviews: 125
        },
        {
          id: '2',
          name: 'iPhone 15 Pro',
          price: 1550000,
          description: 'A17 Pro 칩, 256GB, 티타늄 디자인',
          image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500',
          category: '스마트폰',
          stock: 15,
          rating: 4.9,
          reviews: 89
        },
        {
          id: '3',
          name: 'AirPods Pro 2세대',
          price: 359000,
          description: '액티브 노이즈 캔슬링, MagSafe 충전',
          image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500',
          category: '오디오',
          stock: 25,
          rating: 4.7,
          reviews: 203
        },
        {
          id: '4',
          name: 'iPad Air 5세대',
          price: 929000,
          description: 'M1 칩, 10.9인치, Wi-Fi, 64GB',
          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
          category: '태블릿',
          stock: 8,
          rating: 4.6,
          reviews: 67
        },
        {
          id: '5',
          name: 'Galaxy Z Fold 5',
          price: 2097700,
          description: '7.6인치 폴더블 디스플레이, 512GB',
          image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
          category: '스마트폰',
          stock: 5,
          rating: 4.5,
          reviews: 45
        },
        {
          id: '6',
          name: 'Sony WH-1000XM5',
          price: 499000,
          description: '업계 최고 노이즈 캔슬링 헤드폰',
          image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
          category: '오디오',
          stock: 12,
          rating: 4.8,
          reviews: 156
        },
        {
          id: '7',
          name: 'Apple Watch Series 9',
          price: 599000,
          description: '45mm GPS + Cellular, 알루미늄',
          image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500',
          category: '웨어러블',
          stock: 18,
          rating: 4.7,
          reviews: 92
        },
        {
          id: '8',
          name: 'Dell XPS 15',
          price: 2890000,
          description: 'Intel i7, 16GB RAM, 1TB SSD, RTX 4060',
          image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500',
          category: '노트북',
          stock: 6,
          rating: 4.6,
          reviews: 78
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // 데이터 무결성 검사
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart.filter(item => 
            item.product && item.product.id && item.quantity > 0
          ));
        }
      }
    } catch (error) {
      console.error('장바구니 데이터 로드 실패:', error);
      setCart([]);
    }
  }, []);

  const addToCart = useCallback((product: Product) => {
    if (!product || !product.id) {
      setToast({ message: '상품 정보가 올바르지 않습니다.', type: 'error' });
      return;
    }
    
    if (product.stock <= 0) {
      setToast({ message: '품절된 상품입니다.', type: 'error' });
      return;
    }
    
    const existingItem = cart.find(item => item.product.id === product.id);
    let newCart: CartItem[];
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        setToast({ message: '재고가 부족합니다.', type: 'error' });
        return;
      }
      newCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setToast({ 
      message: `${product.name}이(가) 장바구니에 추가되었습니다!`, 
      type: 'success' 
    });
  }, [cart]);

  const removeFromCart = useCallback((productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
    setToast({ message: '상품이 장바구니에서 제거되었습니다.', type: 'info' });
  }, [cart]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = cart.find(item => item.product.id === productId)?.product;
    if (product && quantity > product.stock) {
      setToast({ message: '재고가 부족합니다.', type: 'error' });
      return;
    }
    
    const newCart = cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart, removeFromCart]);

  // 메모이제이션으로 성능 최적화
  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    const searchLower = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  }, [products, searchTerm]);
  
  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // 로딩 스켈레턴 컴포넌트
  const ProductSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="skeleton aspect-square"></div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="skeleton w-16 h-4 rounded"></div>
          <div className="skeleton w-12 h-4 rounded"></div>
        </div>
        <div className="skeleton w-full h-5 rounded"></div>
        <div className="skeleton w-3/4 h-5 rounded"></div>
        <div className="flex items-center gap-2">
          <div className="skeleton w-24 h-6 rounded"></div>
          <div className="skeleton w-12 h-5 rounded"></div>
        </div>
        <div className="skeleton w-20 h-4 rounded"></div>
      </div>
    </div>
  );

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="skeleton w-full h-20"></div>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="skeleton w-full h-[400px] rounded-2xl mb-8"></div>
          <div className="skeleton w-full h-64 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 transition-all duration-300">
        <ModernHeader
          cartCount={cartItemsCount}
          onCartClick={() => setIsCartOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
          <HeroCarousel />
          
          <TimeDealSection />

          <section className="py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text-primary mb-4 sm:mb-0">
                상품 목록
                {searchTerm && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    '{searchTerm}' 검색 결과
                  </span>
                )}
              </h2>
              <div className="text-sm text-gray-600">
                총 {filteredProducts.length}개 상품
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  '다른 검색어로 다시 시도해보세요
                </p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  전체 상품 보기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ModernProductCard
                      product={product}
                      onAddToCart={addToCart}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
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

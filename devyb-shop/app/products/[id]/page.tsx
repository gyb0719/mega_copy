'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, ChevronLeft, Truck, Shield, RefreshCw, Package } from 'lucide-react';
import ModernHeader from '../../components/ModernHeader';
import CartSidebar from '../../components/CartSidebar';
import Toast from '../../components/Toast';
import { Product, CartItem } from '../../types';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
    loadCart();
    checkWishlist();
    
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        // Fallback to local data
        const products = [
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
        ];
        const foundProduct = products.find(p => p.id === params.id);
        if (foundProduct) {
          setProduct(foundProduct);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const checkWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(params.id));
  };

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isWishlisted) {
      const updated = wishlist.filter((id: string) => id !== params.id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    } else {
      wishlist.push(params.id);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    setIsWishlisted(!isWishlisted);
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const addToCart = () => {
    if (!product) return;
    
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cartItems.find((item: CartItem) => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({ product, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setCart(cartItems);
    window.dispatchEvent(new Event('cartUpdated'));
    
    setToast({ message: '장바구니에 추가되었습니다!', type: 'success' });
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.product.id === productId ? { ...item, quantity: qty } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <ModernHeader
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountRate = Math.floor(Math.random() * 30) + 10;
  const originalPrice = Math.floor(product.price / (1 - discountRate / 100));

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-blue-600 font-semibold">{product.category}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">DevYB</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviews}개 리뷰)
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-bold">
                  {discountRate}% 할인
                </span>
              </div>
              <div className="text-lg text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </div>
            </div>

            <p className="text-gray-600">{product.description}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-gray-400" />
                <span>무료배송 (3만원 이상)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Package className="h-5 w-5 text-gray-400" />
                <span>오늘 출발 (오후 2시 이전 주문 시)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-gray-400" />
                <span>정품 보증</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RefreshCw className="h-5 w-5 text-gray-400" />
                <span>7일 이내 교환/반품 가능</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-6 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">
                재고: {product.stock}개
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock === 0 ? '품절' : '장바구니 담기'}
              </button>
              <button
                onClick={toggleWishlist}
                className={`p-3 rounded-lg transition-colors ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
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
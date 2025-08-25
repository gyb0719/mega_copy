'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ModernHeader from '../../components/ModernHeader';
import ModernProductCard from '../../components/ModernProductCard';
import CartSidebar from '../../components/CartSidebar';
import Toast from '../../components/Toast';
import { Product, CartItem } from '../../types';

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    loadCart();
    
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, [categoryName]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products?category=${categoryName}`);
      const data = await response.json();
      const filtered = data.filter((p: Product) => p.category === categoryName);
      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback products
      const allProducts = [
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
      setProducts(allProducts.filter(p => p.category === categoryName));
    } finally {
      setLoading(false);
    }
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <section className="py-8">
          <h1 className="text-3xl font-bold mb-6">{categoryName}</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">이 카테고리에 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ModernProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
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
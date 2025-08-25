'use client';

import { X, Plus, Minus, ShoppingBag, Trash2, CreditCard, Gift, Truck } from 'lucide-react';
import { CartItem } from '../types';
import { useState } from 'react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  totalPrice: number;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onRemove,
  onUpdateQuantity,
  totalPrice
}: CartSidebarProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(price);
  };

  const shippingFee = totalPrice >= 30000 ? 0 : 3000;
  const couponDiscount = appliedCoupon ? Math.floor(totalPrice * appliedCoupon.discount) : 0;
  const finalTotal = totalPrice + shippingFee - couponDiscount;
  
  const handleApplyCoupon = () => {
    const validCoupons = {
      'WELCOME10': 0.1,
      'SAVE20': 0.2,
      'NEWUSER': 0.15
    };
    
    const discount = validCoupons[couponCode as keyof typeof validCoupons];
    if (discount) {
      setAppliedCoupon({ code: couponCode, discount });
      setCouponCode('');
    } else {
      alert('유효하지 않은 쿠폰코드입니다.');
    }
  };
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    // 결제 로직 시뮤레이션
    setTimeout(() => {
      setIsCheckingOut(false);
      alert('결제가 완료되었습니다!');
      // 장바구니 초기화
      cart.forEach(item => onRemove(item.product.id));
      onClose();
    }, 2000);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                장바구니
              </h2>
              <p className="text-sm text-gray-600">{cart.length}개 상품 • {cart.reduce((sum, item) => sum + item.quantity, 0)}개</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:shadow-lg rounded-full transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">장바구니가 비어있습니다</h3>
                <p className="text-gray-500 text-sm mb-4">원하는 상품을 담아보세요</p>
                <button 
                  onClick={onClose}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  쇼핑 계속하기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-blue-600">
                          {formatPrice(item.product.price)}
                        </p>
                        <span className="text-xs text-gray-500">
                          {item.product.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium bg-gray-50 rounded px-2 py-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => onRemove(item.product.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t bg-gray-50 p-4 space-y-4">
              {/* 쿠폰 입력 */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="쿠폰코드 입력"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    적용
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Gift className="h-4 w-4" />
                    <span>쿠폰 '{appliedCoupon.code}' 적용됨</span>
                  </div>
                )}
              </div>
              
              {/* 가격 세부사항 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span>배송비</span>
                  </div>
                  <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingFee === 0 ? '무료' : formatPrice(shippingFee)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>쿠폰 할인</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between items-center font-bold text-base">
                  <span>총 결제금액</span>
                  <span className="text-xl text-blue-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
                {totalPrice < 30000 && (
                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    {formatPrice(30000 - totalPrice)} 더 구매하시면 배송비가 무료입니다!
                  </p>
                )}
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    결제 중...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    결제하기
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
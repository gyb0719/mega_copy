import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  // 수량 변경 처리
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      if (window.confirm('장바구니에서 삭제하시겠습니까?')) {
        removeFromCart(productId);
      }
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // 결제하기 처리
  const handleCheckout = () => {
    alert('결제 기능은 준비 중입니다.');
  };

  // 장바구니가 비어있을 때
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">장바구니</h1>
        <div className="bg-white rounded-lg shadow-lg p-16 text-center">
          <svg
            className="w-24 h-24 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">장바구니가 비어있습니다</h2>
          <p className="text-gray-500 mb-6">원하는 상품을 장바구니에 담아보세요!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            쇼핑 계속하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">장바구니</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 장바구니 아이템 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {cartItems.map((item) => (
              <div key={item.id} className="border-b last:border-b-0">
                <div className="p-6 flex items-center space-x-4">
                  {/* 상품 이미지 */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/product/${item.id}`)}
                  />

                  {/* 상품 정보 */}
                  <div className="flex-grow">
                    <h3
                      className="text-lg font-semibold text-gray-800 hover:text-primary cursor-pointer transition-colors"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{item.category}</p>
                    <p className="text-primary font-semibold mt-1">
                      ₩{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* 수량 조절 */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* 소계 */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 주문 요약 */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">주문 요약</h2>
            
            {/* 금액 정보 */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>상품 금액</span>
                <span>₩{getTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>배송비</span>
                <span className="text-green-600">무료</span>
              </div>
              <hr />
              <div className="flex justify-between text-xl font-bold">
                <span>총 결제 금액</span>
                <span className="text-primary">₩{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>

            {/* 결제 버튼 */}
            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors mb-3"
            >
              결제하기
            </button>

            {/* 계속 쇼핑하기 버튼 */}
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white text-primary border-2 border-primary py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              계속 쇼핑하기
            </button>

            {/* 안내 문구 */}
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>안전한 결제 시스템</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>3만원 이상 무료배송</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>30일 이내 반품 가능</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
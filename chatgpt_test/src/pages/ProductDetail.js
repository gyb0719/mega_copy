import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // 상품 정보 가져오기
  const product = getProductById(id);

  // 상품이 없는 경우
  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">상품을 찾을 수 없습니다</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  // 수량 변경 처리
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // 장바구니 담기 처리
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    alert(`${product.name} ${quantity}개가 장바구니에 추가되었습니다!`);
  };

  // 바로 구매 처리
  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/cart');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        뒤로가기
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* 상품 이미지 */}
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
            {/* 재고 부족 표시 */}
            {product.stock < 5 && product.stock > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded">
                재고 {product.stock}개 남음
              </span>
            )}
            {/* 품절 표시 */}
            {product.stock === 0 && (
              <span className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded">
                품절
              </span>
            )}
          </div>

          {/* 상품 정보 */}
          <div>
            {/* 카테고리 */}
            <span className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded mb-4">
              {product.category}
            </span>

            {/* 상품명 */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

            {/* 가격 */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">
                ₩{product.price.toLocaleString()}
              </span>
            </div>

            {/* 구분선 */}
            <hr className="my-6" />

            {/* 상품 설명 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">상품 설명</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* 수량 선택 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">수량</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 총 금액 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 상품 금액</span>
                <span className="text-2xl font-bold text-primary">
                  ₩{(product.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 구매 버튼 */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white'
                }`}
              >
                장바구니 담기
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-blue-600'
                }`}
              >
                바로 구매하기
              </button>
            </div>

            {/* 추가 정보 */}
            <div className="mt-8 space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                무료 배송
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                정품 보증
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                30일 이내 반품 가능
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// 상품 카드 컴포넌트
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // 장바구니에 담기 처리
  const handleAddToCart = (e) => {
    e.preventDefault(); // Link 클릭 방지
    addToCart(product);
    alert(`${product.name}이(가) 장바구니에 추가되었습니다!`);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* 상품 이미지 */}
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* 재고 부족 표시 */}
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            재고 {product.stock}개 남음
          </span>
        )}
        {/* 품절 표시 */}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
            품절
          </span>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="p-4">
        {/* 카테고리 */}
        <span className="text-xs text-gray-500">{product.category}</span>
        
        {/* 상품명 */}
        <h3 className="text-lg font-semibold text-gray-800 mt-1 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* 가격 */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-2xl font-bold text-primary">
            ₩{product.price.toLocaleString()}
          </span>
        </div>

        {/* 구매하기 버튼 */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold transition-colors ${
            product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-blue-600'
          }`}
        >
          {product.stock === 0 ? '품절' : '구매하기'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
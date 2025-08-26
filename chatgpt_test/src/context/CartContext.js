import React, { createContext, useState, useContext } from 'react';

// 장바구니 Context 생성
const CartContext = createContext();

// 장바구니 Context Provider 컴포넌트
export const CartProvider = ({ children }) => {
  // 장바구니 아이템 상태
  const [cartItems, setCartItems] = useState([]);

  // 장바구니에 아이템 추가 함수
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // 이미 장바구니에 있는 상품인지 확인
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // 이미 있으면 수량 증가
        return prevItems.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 없으면 새로 추가 (수량 1로 시작)
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // 장바구니에서 아이템 제거 함수
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // 장바구니 아이템 수량 업데이트 함수
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  // 장바구니 전체 금액 계산
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // 장바구니 아이템 총 개수
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Context 값 객체
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// 커스텀 Hook - 장바구니 Context 사용
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
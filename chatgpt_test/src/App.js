import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';

function App() {
  return (
    // CartProvider로 전체 앱을 감싸서 장바구니 상태 관리
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            {/* 홈페이지 라우트 */}
            <Route path="/" element={<HomePage />} />
            {/* 상품 상세 페이지 라우트 */}
            <Route path="/product/:id" element={<ProductDetail />} />
            {/* 장바구니 페이지 라우트 */}
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
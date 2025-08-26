import React from 'react';
import Header from './Header';
import Footer from './Footer';

// 레이아웃 컴포넌트 - 헤더와 푸터를 포함한 전체 레이아웃 구조
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <Header />
      
      {/* 메인 콘텐츠 영역 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* 푸터 */}
      <Footer />
    </div>
  );
};

export default Layout;
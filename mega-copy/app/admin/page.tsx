'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Users } from 'lucide-react';
import Link from 'next/link';
import ProductManagementMobile from '../components/ProductManagementMobile';
import AdminManagement from '../components/AdminManagement';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminRole, setAdminRole] = useState('');

  // 간단한 인증 체크 (실제로는 서버 인증 필요)
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    const role = localStorage.getItem('adminRole');
    if (isAdmin === 'true') {
      setIsAuthenticated(true);
      setAdminRole(role || '');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 관리자 계정 목록 (DB와 동기화)
    const adminAccounts = [
      // Supabase DB의 실제 계정들
      { username: 'admin', password: 'admin123', role: 'main' },
      { username: 'manager', password: 'manager123', role: 'main' },
      { username: 'test', password: 'test123', role: 'sub' },
      // 기존 계정 (호환성 유지)
      { username: 'martin18', password: '0601', role: 'main' },
      { username: 'mega', password: '0601', role: 'main' },
    ];
    
    // 계정 확인
    const account = adminAccounts.find(
      acc => acc.username === username && acc.password === password
    );
    
    if (account) {
      setIsAuthenticated(true);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminRole', account.role);
      localStorage.setItem('adminUsername', account.username);
    } else {
      alert('로그인 정보가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUsername');
  };

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-3xl font-black text-mega-yellow">MEGA</span>
            <span className="text-3xl font-black text-black">COPY</span>
          </div>
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">관리자 로그인</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                아이디
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-mega-yellow transition-colors"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-mega-yellow transition-colors"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-mega-yellow text-black rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors font-black text-base"
            >
              로그인
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-700 hover:text-black font-bold hover:underline">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 관리자 대시보드
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold">관리자 페이지</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors text-sm"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 탭 메뉴 */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors font-bold ${
                activeTab === 'products'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              상품 관리
            </button>
            {(adminRole === 'main' || true) && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors font-bold ${
                  activeTab === 'admins'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                관리자 관리
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'products' && (
          <ProductManagementMobile />
        )}

        {activeTab === 'admins' && (
          <AdminManagement />
        )}
      </div>
    </div>
  );
}
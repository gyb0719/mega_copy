'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Users } from 'lucide-react';
import Link from 'next/link';
import ProductManagementMobile from '../components/ProductManagementMobile';
import AdminManagement from '../components/AdminManagement';
import { authenticateAdmin, validateSession, logout } from '../../lib/auth';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 세션 체크
  useEffect(() => {
    const session = validateSession();
    if (session) {
      setIsAuthenticated(true);
      setAdminRole(session.role);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    try {
      const result = await authenticateAdmin(username, password);
      
      if (result.success && result.data) {
        setIsAuthenticated(true);
        setAdminRole(result.data.role);
        setUsername('');
        setPassword('');
      } else {
        setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      setLoginError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setAdminRole('');
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
          
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {loginError}
            </div>
          )}
          
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
                disabled={isLoading}
                autoComplete="username"
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
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-mega-yellow text-black rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors font-black text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
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
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'products' && <ProductManagementMobile />}
        {activeTab === 'admins' && <AdminManagement currentUserRole={adminRole} />}
      </div>
    </div>
  );
}
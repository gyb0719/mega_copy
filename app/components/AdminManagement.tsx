'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User, Edit2, Check, X, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { hashPassword } from '../../lib/auth';

interface Admin {
  id: string;
  username: string;
  role: 'main' | 'sub';
  created_at: string;
}

interface AdminManagementProps {
  currentUserRole?: string;
}

export default function AdminManagement({ currentUserRole = 'main' }: AdminManagementProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'main' | 'sub'>('sub');
  const [changePassword, setChangePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Supabase에서 관리자 목록 불러오기
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id, username, role, created_at')
        .order('created_at', { ascending: false });
      
      if (data) {
        setAdmins(data);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  // 관리자 추가
  const handleAddAdmin = async () => {
    if (!newUsername || !newPassword) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 4) {
      alert('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    
    try {
      const hashedPassword = await hashPassword(newPassword);
      
      const { data, error } = await supabase
        .from('admins')
        .insert({
          username: newUsername,
          password_hash: hashedPassword,
          role: newRole
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          alert('이미 존재하는 아이디입니다.');
        } else {
          alert('관리자 추가에 실패했습니다.');
        }
      } else if (data) {
        alert('관리자가 추가되었습니다.');
        setNewUsername('');
        setNewPassword('');
        setNewRole('sub');
        setShowAddModal(false);
        fetchAdmins();
      }
    } catch (error) {
      console.error('Failed to add admin:', error);
      alert('관리자 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (!selectedAdmin) return;
    
    if (!changePassword || !confirmPassword) {
      alert('새 비밀번호를 입력해주세요.');
      return;
    }

    if (changePassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (changePassword.length < 4) {
      alert('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    
    try {
      const hashedPassword = await hashPassword(changePassword);
      
      const { error } = await supabase
        .from('admins')
        .update({ password_hash: hashedPassword })
        .eq('id', selectedAdmin.id);
      
      if (error) {
        alert('비밀번호 변경에 실패했습니다.');
      } else {
        alert(`${selectedAdmin.username}의 비밀번호가 변경되었습니다.`);
        setShowPasswordModal(false);
        setSelectedAdmin(null);
        setChangePassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 관리자 삭제
  const handleDeleteAdmin = async (admin: Admin) => {
    // 서브 관리자는 다른 관리자 삭제 불가
    if (currentUserRole === 'sub') {
      alert('서브 관리자는 다른 관리자를 삭제할 수 없습니다.');
      return;
    }
    
    // 메인 관리자는 삭제 불가
    if (admin.role === 'main') {
      alert('메인 관리자는 삭제할 수 없습니다.');
      return;
    }

    if (!confirm(`정말 ${admin.username} 계정을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', admin.id);
      
      if (error) {
        alert('관리자 삭제에 실패했습니다.');
      } else {
        alert('관리자가 삭제되었습니다.');
        fetchAdmins();
      }
    } catch (error) {
      console.error('Failed to delete admin:', error);
      alert('관리자 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">관리자 계정 관리</h2>
        {currentUserRole === 'main' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            관리자 추가
          </button>
        )}
      </div>

      {/* 관리자 목록 */}
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold">역할</th>
              <th className="px-4 py-3 text-left text-sm font-bold">아이디</th>
              <th className="px-4 py-3 text-left text-sm font-bold">생성일</th>
              <th className="px-4 py-3 text-right text-sm font-bold">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                    admin.role === 'main' 
                      ? 'bg-mega-yellow text-black' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {admin.role === 'main' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {admin.role === 'main' ? '메인' : '서브'}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{admin.username}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(admin.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {/* 서브 관리자는 자신의 비밀번호만 변경 가능, 메인 관리자는 모든 비밀번호 변경 가능 */}
                  {(currentUserRole === 'main' || 
                    (currentUserRole === 'sub' && sessionStorage.getItem('adminSession') && 
                     JSON.parse(sessionStorage.getItem('adminSession') || '{}').username === admin.username)) && (
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowPasswordModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                      title="비밀번호 변경"
                    >
                      <Key className="w-4 h-4 inline" />
                    </button>
                  )}
                  {/* 메인 관리자만 서브 관리자 삭제 가능 */}
                  {currentUserRole === 'main' && admin.role === 'sub' && (
                    <button
                      onClick={() => handleDeleteAdmin(admin)}
                      className="text-red-600 hover:text-red-700"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 관리자 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">새 관리자 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">아이디</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-mega-yellow"
                  placeholder="관리자 아이디"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">비밀번호</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-mega-yellow"
                  placeholder="비밀번호 (최소 4자)"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">권한</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'main' | 'sub')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-mega-yellow"
                >
                  <option value="sub">서브 관리자</option>
                  <option value="main">메인 관리자</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddAdmin}
                disabled={loading}
                className="flex-1 py-2 bg-mega-yellow text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold disabled:opacity-50"
              >
                {loading ? '추가 중...' : '추가'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewUsername('');
                  setNewPassword('');
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-bold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {selectedAdmin.username} 비밀번호 변경
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">새 비밀번호</label>
                <input
                  type="password"
                  value={changePassword}
                  onChange={(e) => setChangePassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-mega-yellow"
                  placeholder="새 비밀번호 (최소 4자)"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-mega-yellow"
                  placeholder="비밀번호 재입력"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 py-2 bg-mega-yellow text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold disabled:opacity-50"
              >
                {loading ? '변경 중...' : '변경'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedAdmin(null);
                  setChangePassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-bold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 참고사항</strong><br/>
          • 메인 관리자: 모든 권한 (관리자 관리 포함)<br/>
          • 서브 관리자: 상품 관리만 가능<br/>
          • 기본 서브 관리자 계정: sub1, sub2, sub3 (초기 비밀번호: sub123)<br/>
          • 보안을 위해 기본 비밀번호는 반드시 변경해주세요.
        </p>
      </div>
    </div>
  );
}
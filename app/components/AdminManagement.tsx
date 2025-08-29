'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User, Edit2, Check, X } from 'lucide-react';

interface AdminAccount {
  id: string;
  username: string;
  password: string;
  role: 'main' | 'sub';
  createdAt: string;
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // 로컬 스토리지에서 관리자 목록 불러오기
  useEffect(() => {
    const storedAdmins = localStorage.getItem('adminAccounts');
    if (storedAdmins) {
      setAdmins(JSON.parse(storedAdmins));
    } else {
      // 초기 관리자 설정
      const initialAdmins: AdminAccount[] = [
        { id: '1', username: 'martin18', password: '0601', role: 'main', createdAt: new Date().toISOString() },
        { id: '2', username: 'mega', password: '0601', role: 'main', createdAt: new Date().toISOString() },
        { id: '3', username: 'subadmin1', password: 'subadmin123', role: 'sub', createdAt: new Date().toISOString() },
        { id: '4', username: 'subadmin2', password: 'subadmin123', role: 'sub', createdAt: new Date().toISOString() },
        { id: '5', username: 'subadmin3', password: 'subadmin123', role: 'sub', createdAt: new Date().toISOString() },
      ];
      setAdmins(initialAdmins);
      localStorage.setItem('adminAccounts', JSON.stringify(initialAdmins));
    }
  }, []);

  // 관리자 추가
  const handleAddAdmin = () => {
    if (!newUsername || !newPassword) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    // 중복 확인
    if (admins.some(admin => admin.username === newUsername)) {
      alert('이미 존재하는 아이디입니다.');
      return;
    }

    const newAdmin: AdminAccount = {
      id: Date.now().toString(),
      username: newUsername,
      password: newPassword,
      role: 'sub',
      createdAt: new Date().toISOString()
    };

    const updatedAdmins = [...admins, newAdmin];
    setAdmins(updatedAdmins);
    localStorage.setItem('adminAccounts', JSON.stringify(updatedAdmins));

    setNewUsername('');
    setNewPassword('');
    setShowAddModal(false);
    alert('서브 관리자가 추가되었습니다.');
  };

  // 관리자 삭제
  const handleDeleteAdmin = (id: string) => {
    const admin = admins.find(a => a.id === id);
    if (admin?.role === 'main') {
      alert('메인 관리자는 삭제할 수 없습니다.');
      return;
    }

    if (!confirm('정말 이 관리자 계정을 삭제하시겠습니까?')) return;

    const updatedAdmins = admins.filter(a => a.id !== id);
    setAdmins(updatedAdmins);
    localStorage.setItem('adminAccounts', JSON.stringify(updatedAdmins));
    alert('관리자 계정이 삭제되었습니다.');
  };

  // 관리자 수정 시작
  const startEdit = (admin: AdminAccount) => {
    if (admin.role === 'main') {
      alert('메인 관리자는 수정할 수 없습니다.');
      return;
    }
    setEditingId(admin.id);
    setEditUsername(admin.username);
    setEditPassword(admin.password);
  };

  // 관리자 수정 저장
  const saveEdit = () => {
    if (!editUsername || !editPassword) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    const updatedAdmins = admins.map(admin => 
      admin.id === editingId 
        ? { ...admin, username: editUsername, password: editPassword }
        : admin
    );

    setAdmins(updatedAdmins);
    localStorage.setItem('adminAccounts', JSON.stringify(updatedAdmins));
    setEditingId(null);
    alert('관리자 정보가 수정되었습니다.');
  };

  // 관리자 수정 취소
  const cancelEdit = () => {
    setEditingId(null);
    setEditUsername('');
    setEditPassword('');
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-bold">관리자 계정</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 md:px-4 py-2 bg-mega-yellow text-black rounded-lg hover:bg-yellow-400 font-bold flex items-center gap-2 text-sm md:text-base"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">서브 관리자</span> 추가
          </button>
        </div>

        {/* 관리자 목록 */}
        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin.id} className="p-4 bg-gray-50 rounded-lg border">
              {editingId === admin.id ? (
                // 수정 모드
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="아이디"
                  />
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="비밀번호"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 모드
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${admin.role === 'main' ? 'bg-mega-yellow' : 'bg-gray-200'}`}>
                      {admin.role === 'main' ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{admin.username}</p>
                      <p className="text-sm text-gray-600">
                        {admin.role === 'main' ? '메인 관리자' : '서브 관리자'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {admin.role === 'sub' && (
                      <>
                        <button
                          onClick={() => startEdit(admin)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 서브 관리자 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">서브 관리자 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  아이디
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mega-yellow"
                  placeholder="새 관리자 아이디"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mega-yellow"
                  placeholder="새 관리자 비밀번호"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddAdmin}
                  className="flex-1 py-2 bg-mega-yellow text-black rounded-lg hover:bg-yellow-400 font-bold"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUsername('');
                    setNewPassword('');
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
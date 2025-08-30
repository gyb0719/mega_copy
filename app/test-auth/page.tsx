'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function TestAuthPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hash, setHash] = useState('');
  const [dbResult, setDbResult] = useState<any>(null);
  const [error, setError] = useState('');

  // 해시 생성 함수
  async function generateHash() {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setHash(hashHex);
    return hashHex;
  }

  // 데이터베이스에서 직접 조회
  async function checkDatabase() {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        setError(`DB Error: ${error.message}`);
        setDbResult(null);
      } else {
        setError('');
        setDbResult(data);
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`);
    }
  }

  // 비밀번호 비교
  async function comparePassword() {
    const generatedHash = await generateHash();
    if (dbResult && dbResult.password_hash) {
      const match = dbResult.password_hash === generatedHash;
      alert(`비밀번호 일치: ${match}\n\n생성된 해시: ${generatedHash}\n\nDB 해시: ${dbResult.password_hash}`);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">인증 디버깅 페이지</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full"
            placeholder="martin18"
          />
        </div>

        <div>
          <label className="block mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
            placeholder="0601"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={generateHash}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            해시 생성
          </button>
          
          <button
            onClick={checkDatabase}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            DB 조회
          </button>

          <button
            onClick={comparePassword}
            className="bg-purple-500 text-white px-4 py-2 rounded"
            disabled={!dbResult}
          >
            비밀번호 비교
          </button>
        </div>

        {hash && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold">생성된 해시:</h3>
            <p className="break-all font-mono text-sm">{hash}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 rounded">
            <h3 className="font-bold text-red-600">에러:</h3>
            <p>{error}</p>
          </div>
        )}

        {dbResult && (
          <div className="mt-4 p-4 bg-green-100 rounded">
            <h3 className="font-bold">DB 결과:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(dbResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold mb-2">테스트 해시값:</h3>
        <p className="font-mono text-sm">0601: 2636389909f27aa15afff120fce0ae534aa4d22a2723812966a731550564f0f7</p>
        <p className="font-mono text-sm">sub123: e06c09f26c56332fb6a93e5efe538042ac1f90488153a041eed048e3d3fc6f96</p>
      </div>
    </div>
  );
}
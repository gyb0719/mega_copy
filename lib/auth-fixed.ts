import { supabase } from './supabase';

// 브라우저에서 SHA256 해싱 함수
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// 관리자 인증 함수 - RPC 함수 사용
export async function authenticateAdmin(username: string, password: string) {
  try {
    console.log('인증 시도:', username);
    
    // 비밀번호 해시 생성
    const hashedPassword = await hashPassword(password);
    console.log('생성된 해시:', hashedPassword);
    
    // RPC 함수 호출로 인증
    const { data, error } = await supabase.rpc('verify_admin_login', {
      input_username: username,
      input_password_hash: hashedPassword
    });

    console.log('RPC 결과:', data, error);

    if (error) {
      console.error('RPC 오류:', error);
      return { success: false, message: '인증 실패' };
    }

    // 결과 확인
    if (!data || data.length === 0 || !data[0].is_valid) {
      console.error('인증 실패: 잘못된 자격 증명');
      return { success: false, message: '인증 실패' };
    }

    const adminData = data[0];

    // 세션 토큰 생성 (브라우저용)
    const tokenString = `${username}-${Date.now()}-${Math.random()}`;
    const sessionToken = await hashPassword(tokenString);

    // 세션 정보 저장
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('adminSession', JSON.stringify({
        token: sessionToken,
        username: adminData.username,
        role: adminData.role || 'admin',
        expiresAt: Date.now() + (4 * 60 * 60 * 1000) // 4시간
      }));
    }

    return { 
      success: true, 
      data: {
        username: adminData.username,
        role: adminData.role || 'admin',
        token: sessionToken
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: '인증 처리 중 오류 발생' };
  }
}

// 세션 검증 함수
export function validateSession() {
  if (typeof window === 'undefined') return false;
  
  const sessionStr = sessionStorage.getItem('adminSession');
  if (!sessionStr) return false;
  
  try {
    const session = JSON.parse(sessionStr);
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem('adminSession');
      return false;
    }
    return session;
  } catch {
    return false;
  }
}

// 로그아웃 함수
export function logout() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('adminSession');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUsername');
  }
}
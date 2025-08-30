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

// 관리자 인증 함수
export async function authenticateAdmin(username: string, password: string) {
  try {
    console.log('인증 시도:', username);
    
    // 세션 캐시 정리 (이전 세션이 남아있을 수 있음)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminSession');
    }
    
    // Supabase에서 관리자 정보 조회
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    console.log('DB 조회 결과:', data, error);

    if (error || !data) {
      console.error('DB 조회 실패:', error);
      return { success: false, message: '인증 실패' };
    }

    // 비밀번호 검증
    const hashedPassword = await hashPassword(password);
    console.log('입력된 비밀번호 해시:', hashedPassword);
    console.log('DB 비밀번호 해시:', data.password_hash);
    console.log('일치 여부:', data.password_hash === hashedPassword);
    
    if (data.password_hash !== hashedPassword) {
      console.error('비밀번호 불일치');
      return { success: false, message: '인증 실패' };
    }

    const adminData = data;

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
export async function logout() {
  if (typeof window !== 'undefined') {
    // 모든 세션 및 로컬 스토리지 정리
    sessionStorage.clear();
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUsername');
    
    // Supabase 세션도 정리 (혹시 있다면)
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // 무시 - Supabase Auth를 사용하지 않을 수도 있음
    }
    
    // 페이지 새로고침으로 메모리 정리
    window.location.reload();
  }
}
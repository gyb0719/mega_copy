import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthDebugScreen extends StatefulWidget {
  const AuthDebugScreen({super.key});

  @override
  State<AuthDebugScreen> createState() => _AuthDebugScreenState();
}

class _AuthDebugScreenState extends State<AuthDebugScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _logController = ScrollController();
  String _logs = '';
  bool _isLoading = false;

  void _addLog(String message) {
    setState(() {
      _logs += '[${DateTime.now().toString().substring(11, 19)}] $message\n';
    });
    // 자동 스크롤
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_logController.hasClients) {
        _logController.animateTo(
          _logController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _clearLogs() {
    setState(() {
      _logs = '';
    });
  }

  Future<void> _testConnection() async {
    _clearLogs();
    _addLog('=== 연결 테스트 시작 ===');
    
    try {
      final supabase = Supabase.instance.client;
      _addLog('Supabase 연결 확인 중...');
      _addLog('현재 세션: ${supabase.auth.currentSession != null ? "존재" : "없음"}');
      _addLog('현재 사용자: ${supabase.auth.currentUser?.email ?? "없음"}');
      
      // Health check
      final response = await supabase.from('profiles').select('id').limit(1);
      _addLog('프로필 테이블 접근: 성공');
      _addLog('연결 상태: ✅ 정상');
      _addLog('Supabase 서버와 통신 가능');
    } catch (e) {
      _addLog('❌ 오류: $e');
      _addLog('연결 상태: ⚠️ 실패');
    }
  }

  Future<void> _testSignIn() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _addLog('❌ 이메일과 비밀번호를 입력하세요');
      return;
    }

    setState(() => _isLoading = true);
    _clearLogs();
    _addLog('=== 로그인 테스트 시작 ===');
    _addLog('이메일: ${_emailController.text}');
    _addLog('비밀번호 길이: ${_passwordController.text.length}');

    try {
      final supabase = Supabase.instance.client;
      
      // 기존 세션 제거
      if (supabase.auth.currentSession != null) {
        _addLog('기존 세션 제거 중...');
        await supabase.auth.signOut();
        _addLog('로그아웃 완료');
      }

      _addLog('\n로그인 시도 중...');
      final response = await supabase.auth.signInWithPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      _addLog('✅ 로그인 성공!');
      _addLog('User ID: ${response.user?.id}');
      _addLog('Email: ${response.user?.email}');
      _addLog('Session: ${response.session != null ? "생성됨" : "없음"}');
      
      // 프로필 조회
      try {
        _addLog('\n프로필 조회 중...');
        final profile = await supabase
            .from('profiles')
            .select()
            .eq('id', response.user!.id)
            .single();
        
        _addLog('✅ 프로필 발견!');
        _addLog('Username: ${profile['username']}');
        _addLog('Full Name: ${profile['full_name']}');
      } catch (e) {
        _addLog('⚠️ 프로필 없음: $e');
      }

    } catch (e) {
      _addLog('\n❌ 로그인 실패');
      _addLog('오류 타입: ${e.runtimeType}');
      _addLog('오류 메시지: $e');
      
      if (e is AuthException) {
        _addLog('상태 코드: ${e.statusCode}');
        _addLog('Auth 메시지: ${e.message}');
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testSignUp() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _addLog('❌ 이메일과 비밀번호를 입력하세요');
      return;
    }

    setState(() => _isLoading = true);
    _clearLogs();
    _addLog('=== 회원가입 테스트 시작 ===');

    try {
      final supabase = Supabase.instance.client;
      
      _addLog('회원가입 시도 중...');
      final response = await supabase.auth.signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        data: {
          'username': 'test_${DateTime.now().millisecondsSinceEpoch}',
          'full_name': 'Test User',
        },
      );

      _addLog('✅ 회원가입 요청 성공!');
      _addLog('User ID: ${response.user?.id}');
      _addLog('Email: ${response.user?.email}');
      _addLog('확인 필요: ${response.user?.emailConfirmedAt == null ? "예" : "아니오"}');
      
      if (response.user?.emailConfirmedAt == null) {
        _addLog('\n⚠️ 이메일 확인이 필요합니다!');
        _addLog('이메일을 확인하여 계정을 활성화하세요.');
      }

    } catch (e) {
      _addLog('\n❌ 회원가입 실패');
      _addLog('오류: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testPasswordReset() async {
    if (_emailController.text.isEmpty) {
      _addLog('❌ 이메일을 입력하세요');
      return;
    }

    setState(() => _isLoading = true);
    _clearLogs();
    _addLog('=== 비밀번호 재설정 테스트 ===');

    try {
      final supabase = Supabase.instance.client;
      
      _addLog('재설정 이메일 전송 중...');
      await supabase.auth.resetPasswordForEmail(
        _emailController.text.trim(),
        redirectTo: 'com.devyb.billage://reset-password',
      );

      _addLog('✅ 재설정 이메일 전송 완료!');
      _addLog('이메일을 확인하세요: ${_emailController.text}');

    } catch (e) {
      _addLog('\n❌ 비밀번호 재설정 실패');
      _addLog('오류: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testSignOut() async {
    _clearLogs();
    _addLog('=== 로그아웃 테스트 ===');
    
    try {
      final supabase = Supabase.instance.client;
      
      if (supabase.auth.currentSession == null) {
        _addLog('현재 로그인 상태가 아닙니다');
        return;
      }
      
      _addLog('로그아웃 중...');
      await supabase.auth.signOut();
      _addLog('✅ 로그아웃 완료!');
      
    } catch (e) {
      _addLog('❌ 로그아웃 실패: $e');
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _logController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Auth 디버그'),
        backgroundColor: Colors.orange,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // 입력 필드
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: '이메일',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(
                labelText: '비밀번호',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.lock),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 16),
            
            // 버튼들
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ElevatedButton(
                  onPressed: _isLoading ? null : _testConnection,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('연결 테스트'),
                ),
                ElevatedButton(
                  onPressed: _isLoading ? null : _testSignIn,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('로그인'),
                ),
                ElevatedButton(
                  onPressed: _isLoading ? null : _testSignUp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('회원가입'),
                ),
                ElevatedButton(
                  onPressed: _isLoading ? null : _testPasswordReset,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('비번 재설정'),
                ),
                ElevatedButton(
                  onPressed: _isLoading ? null : _testSignOut,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('로그아웃'),
                ),
                IconButton(
                  onPressed: _clearLogs,
                  icon: const Icon(Icons.clear_all),
                  tooltip: '로그 지우기',
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // 로딩 표시
            if (_isLoading)
              const LinearProgressIndicator(),
            
            // 로그 출력
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.all(12),
                child: SingleChildScrollView(
                  controller: _logController,
                  child: SizedBox(
                    width: double.infinity,
                    child: Text(
                      _logs.isEmpty ? '여기에 로그가 표시됩니다...' : _logs,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: Colors.green,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
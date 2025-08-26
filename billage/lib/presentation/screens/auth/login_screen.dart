import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _signInWithEmail() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      print('\n=== 로그인 시도 ===');
      print('Email: ${_emailController.text.trim()}');
      print('Password Length: ${_passwordController.text.length}');
      
      // 직접 Supabase 호출 테스트
      print('\n1단계: 직접 Supabase 호출 테스트');
      try {
        final directResponse = await Supabase.instance.client.auth.signInWithPassword(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
        print('직접 호출 성공!');
        print('- User ID: ${directResponse.user?.id}');
        print('- Session 존재: ${directResponse.session != null}');
      } catch (directError) {
        print('직접 호출 실패: $directError');
        print('에러 타입: ${directError.runtimeType}');
      }
      
      // AuthRepository를 통한 호출
      print('\n2단계: AuthRepository를 통한 호출');
      final authRepository = ref.read(authRepositoryProvider);
      final user = await authRepository.signInWithEmail(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      
      print('\n로그인 결과:');
      print('- User 반환: ${user != null}');
      if (user != null) {
        print('- Email: ${user.email}');
        print('- Username: ${user.username}');
        print('- Full Name: ${user.fullName}');
      }
      
      if (user != null && mounted) {
        print('\n로그인 성공! 홈으로 이동 시도...');
        
        // 세션 확인
        final session = Supabase.instance.client.auth.currentSession;
        print('현재 세션 존재: ${session != null}');
        
        // 라우팅
        context.go('/');
        print('라우팅 완료');
      } else {
        throw Exception('로그인 실패: 사용자 정보를 가져올 수 없습니다');
      }
    } on AuthException catch (e) {
      print('\nAuth 에러 발생:');
      print('- 에러 코드: ${e.statusCode}');
      print('- 에러 메시지: ${e.message}');
      
      if (!mounted) return;
      
      String errorMessage = '로그인 실패';
      if (e.message.contains('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다';
      } else if (e.message.contains('Email not confirmed')) {
        errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요';
      } else {
        errorMessage = e.message;
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    } catch (e, stackTrace) {
      print('\n일반 에러 발생:');
      print('- 에러: $e');
      print('- 스택: $stackTrace');
      
      if (!mounted) return;
      
      // 에러 메시지 파싱
      String errorMessage = e.toString();
      if (errorMessage.startsWith('Exception: ')) {
        errorMessage = errorMessage.replaceAll('Exception: ', '');
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Theme.of(context).colorScheme.error,
          duration: const Duration(seconds: 5),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _resetPassword() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('비밀번호를 재설정할 이메일을 입력해주세요'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    
    // 이메일 형식 검증
    if (!email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('올바른 이메일 형식을 입력해주세요'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    
    setState(() => _isLoading = true);
    
    try {
      print('\n=== 비밀번호 재설정 시도 ===');
      print('이메일: $email');
      
      // 직접 Supabase 호출 테스트
      print('직접 Supabase 호출 중...');
      try {
        await Supabase.instance.client.auth.resetPasswordForEmail(
          email,
          redirectTo: 'com.devyb.billage://reset-password',
        );
        print('직접 호출 성공!');
      } catch (directError) {
        print('직접 호출 실패: $directError');
      }
      
      // AuthRepository를 통한 호출
      print('\nAuthRepository를 통한 호출...');
      final authRepository = ref.read(authRepositoryProvider);
      await authRepository.resetPassword(email);
      
      print('비밀번호 재설정 이메일 전송 성공!');
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$email로 비밀번호 재설정 링크를 전송했습니다\n이메일을 확인해주세요'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } catch (e) {
      print('\n비밀번호 재설정 오류:');
      print('- 에러: $e');
      print('- 에러 타입: ${e.runtimeType}');
      
      if (mounted) {
        String errorMessage = e.toString().replaceAll('Exception: ', '');
        
        // 에러 메시지 개선
        if (errorMessage.contains('User not found') || errorMessage.contains('등록되지 않은')) {
          errorMessage = '등록되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요';
        } else if (errorMessage.contains('Rate limit')) {
          errorMessage = '너무 많은 요청입니다. 잠시 후 다시 시도해주세요';
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);

    try {
      print('구글 로그인 시도');
      await Supabase.instance.client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'com.billage.billage://login-callback',
        authScreenLaunchMode: LaunchMode.externalApplication,
      );
    } catch (e) {
      print('구글 로그인 오류: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('구글 로그인 실패: ${e.toString()}'),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _signInWithKakao() async {
    // TODO: Kakao SDK 설정 후 구현
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('카카오 로그인 준비 중입니다')),
    );
  }

  Future<void> _signInWithNaver() async {
    // TODO: Naver SDK 설정 후 구현
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('네이버 로그인 준비 중입니다')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                
                // Logo & Title
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Theme.of(context).primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Icon(
                          Icons.share_rounded,
                          size: 48,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '빌리지',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '로그인하고 테크 제품을 공유해보세요',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.grey.shade600,
                            ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
                
                // Email Input
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: '이메일',
                    hintText: 'example@email.com',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return '이메일을 입력해주세요';
                    }
                    if (!value.contains('@')) {
                      return '올바른 이메일 형식이 아닙니다';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                
                // Password Input
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _signInWithEmail(),
                  decoration: InputDecoration(
                    labelText: '비밀번호',
                    hintText: '비밀번호를 입력하세요',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return '비밀번호를 입력해주세요';
                    }
                    if (value.length < 6) {
                      return '비밀번호는 6자 이상이어야 합니다';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                
                // Forgot Password
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: _isLoading ? null : _resetPassword,
                    child: const Text('비밀번호를 잊으셨나요?'),
                  ),
                ),
                const SizedBox(height: 24),
                
                // Login Button
                SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _signInWithEmail,
                    child: _isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('로그인'),
                  ),
                ),
                const SizedBox(height: 16),
                
                // Sign Up Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '아직 계정이 없으신가요?',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    TextButton(
                      onPressed: () => context.go('/auth/signup'),
                      child: const Text('회원가입'),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                
                // Divider
                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        '또는',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey.shade600,
                            ),
                      ),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Social Login Buttons
                Column(
                  children: [
                    // Kakao Login
                    _SocialLoginButton(
                      onPressed: _isLoading ? null : _signInWithKakao,
                      backgroundColor: const Color(0xFFFEE500),
                      icon: Icons.chat_bubble,
                      text: '카카오로 시작하기',
                      textColor: Colors.black87,
                    ),
                    const SizedBox(height: 12),
                    
                    // Naver Login
                    _SocialLoginButton(
                      onPressed: _isLoading ? null : _signInWithNaver,
                      backgroundColor: const Color(0xFF03C75A),
                      icon: Icons.square,
                      text: '네이버로 시작하기',
                      textColor: Colors.white,
                    ),
                    const SizedBox(height: 12),
                    
                    // Google Login
                    _SocialLoginButton(
                      onPressed: _isLoading ? null : _signInWithGoogle,
                      backgroundColor: Colors.white,
                      icon: Icons.g_mobiledata,
                      text: 'Google로 시작하기',
                      textColor: Colors.black87,
                      hasBorder: true,
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                
                // 디버그 버튼 (개발용)
                if (true) // 필요시 false로 변경
                  TextButton(
                    onPressed: () => context.go('/debug/auth'),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.orange,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.bug_report, size: 16),
                        SizedBox(width: 4),
                        Text('로그인 문제 디버그', style: TextStyle(fontSize: 12)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SocialLoginButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final Color backgroundColor;
  final IconData icon;
  final String text;
  final Color textColor;
  final bool hasBorder;

  const _SocialLoginButton({
    required this.onPressed,
    required this.backgroundColor,
    required this.icon,
    required this.text,
    required this.textColor,
    this.hasBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56,
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: backgroundColor,
          side: hasBorder
              ? BorderSide(color: Colors.grey.shade300)
              : BorderSide.none,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 20, color: textColor),
            const SizedBox(width: 12),
            Text(
              text,
              style: TextStyle(
                color: textColor,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
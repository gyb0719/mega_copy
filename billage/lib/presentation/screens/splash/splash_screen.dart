import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    await Future.delayed(const Duration(seconds: 2));
    
    if (!mounted) return;
    
    // 세션 체크
    final session = Supabase.instance.client.auth.currentSession;
    final hasSeenOnboarding = false; // TODO: SharedPreferences로 관리
    
    debugPrint('=== Splash Screen ===');
    debugPrint('Session exists: ${session != null}');
    debugPrint('User email: ${session?.user.email}');
    
    if (session != null) {
      // 로그인된 경우 홈으로
      debugPrint('User logged in, going to home');
      context.go('/');
    } else if (!hasSeenOnboarding) {
      // 온보딩을 안 본 경우
      debugPrint('No session, going to onboarding');
      context.go('/onboarding');
    } else {
      // 온보딩을 봤지만 로그인 안 한 경우
      debugPrint('No session, going to login');
      context.go('/auth/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).primaryColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.share_rounded,
              size: 80,
              color: Colors.white,
            ),
            const SizedBox(height: 24),
            const Text(
              '빌리지',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '동네 이웃과 함께하는 공유 플랫폼',
              style: TextStyle(
                fontSize: 14,
                color: Colors.white70,
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
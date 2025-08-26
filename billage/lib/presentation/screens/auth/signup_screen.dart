import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('회원가입')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('회원가입 화면'),
            ElevatedButton(
              onPressed: () => context.go('/auth/login'),
              child: const Text('로그인으로'),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Screens
import '../../presentation/screens/splash/splash_screen.dart';
import '../../presentation/screens/onboarding/onboarding_screen.dart';
import '../../presentation/screens/auth/login_screen.dart';
import '../../presentation/screens/auth/signup_screen.dart';
import '../../presentation/screens/main/main_screen.dart';
import '../../presentation/screens/home/home_screen.dart';
import '../../presentation/screens/products/product_list_screen.dart';
import '../../presentation/screens/products/product_detail_screen.dart';
import '../../presentation/screens/products/product_create_screen.dart';
import '../../presentation/screens/chat/chat_list_screen.dart';
import '../../presentation/screens/chat/chat_room_screen.dart';
import '../../presentation/screens/search/search_screen.dart';
import '../../presentation/screens/profile/profile_screen.dart';
import '../../presentation/screens/profile/my_items_screen.dart';
import '../../presentation/screens/profile/rental_history_screen.dart';
import '../../presentation/screens/debug/auth_debug_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Error: ${state.error}'),
      ),
    ),
    redirect: (context, state) {
      final isLoggedIn = Supabase.instance.client.auth.currentUser != null;
      final location = state.matchedLocation;
      
      // 디버그 로그
      debugPrint('=== Router Redirect ===');
      debugPrint('Current location: $location');
      debugPrint('Is logged in: $isLoggedIn');
      
      // 항상 접근 가능한 경로들
      final publicRoutes = [
        '/splash',
        '/onboarding', 
        '/auth/login',
        '/auth/signup',
        '/debug/auth',  // 디버그 화면
      ];
      
      // 현재 경로가 public route인지 확인
      final isPublicRoute = publicRoutes.any((route) => location == route);
      
      // Public route는 항상 접근 가능
      if (isPublicRoute) {
        debugPrint('Allowing access to public route: $location');
        return null;
      }
      
      // /auth 경로 자체로 접근 시 login으로 리다이렉트
      if (location == '/auth') {
        return '/auth/login';
      }
      
      // 로그인하지 않은 경우 보호된 경로 접근 시 로그인으로
      if (!isLoggedIn) {
        debugPrint('Not logged in, redirecting to login');
        return '/auth/login';
      }
      
      // 로그인한 상태는 모든 경로 접근 가능
      debugPrint('Access granted to: $location');
      return null;
    },
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      
      // Onboarding
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      
      // Auth Routes - 별도 그룹으로 분리
      GoRoute(
        path: '/auth/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/signup',
        name: 'signup',
        builder: (context, state) => const SignupScreen(),
      ),
      
      // Debug Route
      GoRoute(
        path: '/debug/auth',
        name: 'auth-debug',
        builder: (context, state) => const AuthDebugScreen(),
      ),
      
      // Main App Routes (Protected)
      ShellRoute(
        builder: (context, state, child) => MainScreen(child: child),
        routes: [
          // Home
          GoRoute(
            path: '/',
            name: 'home',
            builder: (context, state) => const HomeScreen(),
          ),
          
          // Products
          GoRoute(
            path: '/products',
            name: 'products',
            builder: (context, state) => const ProductListScreen(),
            routes: [
              GoRoute(
                path: ':id',
                name: 'product-detail',
                builder: (context, state) {
                  final productId = state.pathParameters['id']!;
                  return ProductDetailScreen(productId: productId);
                },
              ),
            ],
          ),
          
          // Create Product
          GoRoute(
            path: '/create',
            name: 'create',
            builder: (context, state) => const ProductCreateScreen(),
          ),
          
          // Chat
          GoRoute(
            path: '/chat',
            name: 'chat',
            builder: (context, state) => const ChatListScreen(),
            routes: [
              GoRoute(
                path: ':id',
                name: 'chat-room',
                builder: (context, state) {
                  final roomId = state.pathParameters['id']!;
                  return ChatRoomScreen(roomId: roomId);
                },
              ),
            ],
          ),
          
          // Search
          GoRoute(
            path: '/search',
            name: 'search',
            builder: (context, state) => const SearchScreen(),
          ),
          
          // Profile
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
            routes: [
              GoRoute(
                path: 'items',
                name: 'my-items',
                builder: (context, state) => const MyItemsScreen(),
              ),
              GoRoute(
                path: 'history',
                name: 'rental-history',
                builder: (context, state) => const RentalHistoryScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/models/user_model.dart';

// Supabase Client Provider
final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

// Auth Repository Provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return AuthRepository(supabase: supabase);
});

// Auth State Provider
final authStateProvider = StreamProvider<AuthState>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return authRepository.authStateChanges;
});

// Current User Provider
final currentUserProvider = StateNotifierProvider<CurrentUserNotifier, AsyncValue<UserModel?>>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return CurrentUserNotifier(authRepository, ref);
});

class CurrentUserNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final AuthRepository _authRepository;
  final Ref _ref;
  
  CurrentUserNotifier(this._authRepository, this._ref) : super(const AsyncValue.loading()) {
    _init();
  }
  
  Future<void> _init() async {
    // Auth state 변경 감지
    _ref.listen<AsyncValue<AuthState>>(authStateProvider, (previous, next) {
      next.whenData((authState) {
        if (authState.session != null) {
          loadUserProfile();
        } else {
          state = const AsyncValue.data(null);
        }
      });
    });
    
    // 초기 사용자 로드
    if (_authRepository.currentUser != null) {
      await loadUserProfile();
    } else {
      state = const AsyncValue.data(null);
    }
  }
  
  Future<void> loadUserProfile() async {
    try {
      state = const AsyncValue.loading();
      final user = _authRepository.currentUser;
      if (user != null) {
        final profile = await _authRepository.getProfile(user.id);
        state = AsyncValue.data(profile);
      } else {
        state = const AsyncValue.data(null);
      }
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
  
  Future<void> signUpWithEmail({
    required String email,
    required String password,
    required String username,
    required String fullName,
  }) async {
    try {
      state = const AsyncValue.loading();
      final user = await _authRepository.signUpWithEmail(
        email: email,
        password: password,
        username: username,
        fullName: fullName,
      );
      state = AsyncValue.data(user);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
  
  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      state = const AsyncValue.loading();
      final user = await _authRepository.signInWithEmail(
        email: email,
        password: password,
      );
      state = AsyncValue.data(user);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
  
  Future<void> signInWithOAuth(OAuthProvider provider) async {
    try {
      state = const AsyncValue.loading();
      await _authRepository.signInWithOAuth(provider);
      // OAuth 로그인 후 프로필은 authStateChanges를 통해 자동 로드됨
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
  
  Future<void> signOut() async {
    try {
      await _authRepository.signOut();
      state = const AsyncValue.data(null);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
  
  Future<void> updateProfile({
    String? fullName,
    String? phone,
    String? bio,
    String? avatarUrl,
    String? address,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final currentUser = state.value;
      if (currentUser == null) throw Exception('사용자 정보가 없습니다');
      
      state = const AsyncValue.loading();
      final updatedUser = await _authRepository.updateProfile(
        userId: currentUser.id,
        fullName: fullName,
        phone: phone,
        bio: bio,
        avatarUrl: avatarUrl,
        address: address,
        latitude: latitude,
        longitude: longitude,
      );
      state = AsyncValue.data(updatedUser);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
}

// Auth Loading Provider (로그인/회원가입 중 로딩 상태)
final authLoadingProvider = StateProvider<bool>((ref) => false);

// Username Availability Provider
final usernameAvailabilityProvider = FutureProvider.family<bool, String>((ref, username) async {
  if (username.isEmpty || username.length < 3) {
    return false;
  }
  
  final authRepository = ref.watch(authRepositoryProvider);
  return authRepository.checkUsernameAvailability(username);
});
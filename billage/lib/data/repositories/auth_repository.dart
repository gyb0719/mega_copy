import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart';

class AuthRepository {
  final SupabaseClient _supabase;
  
  AuthRepository({required SupabaseClient supabase}) : _supabase = supabase;
  
  // 현재 사용자 가져오기
  User? get currentUser => _supabase.auth.currentUser;
  
  // 현재 세션 가져오기
  Session? get currentSession => _supabase.auth.currentSession;
  
  // Auth 상태 변경 스트림
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;
  
  // 이메일로 회원가입
  Future<UserModel?> signUpWithEmail({
    required String email,
    required String password,
    required String username,
    required String fullName,
  }) async {
    try {
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {
          'username': username,
          'full_name': fullName,
        },
      );
      
      if (response.user != null) {
        // 프로필 생성
        final profile = await _createProfile(
          id: response.user!.id,
          email: email,
          username: username,
          fullName: fullName,
        );
        return profile;
      }
      return null;
    } catch (e) {
      throw Exception('회원가입 실패: $e');
    }
  }
  
  // 이메일로 로그인
  Future<UserModel?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        return await getProfile(response.user!.id);
      }
      return null;
    } catch (e) {
      throw Exception('로그인 실패: $e');
    }
  }
  
  // OAuth 로그인 (카카오, 구글 등)
  Future<bool> signInWithOAuth(OAuthProvider provider) async {
    try {
      final response = await _supabase.auth.signInWithOAuth(
        provider,
        redirectTo: 'com.devyb.billage://login-callback',
      );
      return response;
    } catch (e) {
      throw Exception('OAuth 로그인 실패: $e');
    }
  }
  
  // 로그아웃
  Future<void> signOut() async {
    try {
      await _supabase.auth.signOut();
    } catch (e) {
      throw Exception('로그아웃 실패: $e');
    }
  }
  
  // 비밀번호 재설정 이메일 전송
  Future<void> resetPassword(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(
        email,
        redirectTo: 'com.devyb.billage://reset-password',
      );
    } catch (e) {
      throw Exception('비밀번호 재설정 이메일 전송 실패: $e');
    }
  }
  
  // 비밀번호 업데이트
  Future<void> updatePassword(String newPassword) async {
    try {
      await _supabase.auth.updateUser(
        UserAttributes(password: newPassword),
      );
    } catch (e) {
      throw Exception('비밀번호 업데이트 실패: $e');
    }
  }
  
  // 프로필 가져오기
  Future<UserModel?> getProfile(String userId) async {
    try {
      final response = await _supabase
          .from('profiles')
          .select()
          .eq('id', userId)
          .single();
          
      return UserModel.fromJson(response);
    } catch (e) {
      return null;
    }
  }
  
  // 프로필 생성
  Future<UserModel> _createProfile({
    required String id,
    required String email,
    required String username,
    required String fullName,
  }) async {
    try {
      final now = DateTime.now();
      final profileData = {
        'id': id,
        'email': email,
        'username': username,
        'full_name': fullName,
        'created_at': now.toIso8601String(),
        'updated_at': now.toIso8601String(),
      };
      
      await _supabase
          .from('profiles')
          .insert(profileData);
          
      return UserModel.fromJson(profileData);
    } catch (e) {
      throw Exception('프로필 생성 실패: $e');
    }
  }
  
  // 프로필 업데이트
  Future<UserModel> updateProfile({
    required String userId,
    String? fullName,
    String? phone,
    String? bio,
    String? avatarUrl,
    String? address,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final updates = <String, dynamic>{
        'updated_at': DateTime.now().toIso8601String(),
      };
      
      if (fullName != null) updates['full_name'] = fullName;
      if (phone != null) updates['phone'] = phone;
      if (bio != null) updates['bio'] = bio;
      if (avatarUrl != null) updates['avatar_url'] = avatarUrl;
      if (address != null) updates['address'] = address;
      if (latitude != null) updates['latitude'] = latitude;
      if (longitude != null) updates['longitude'] = longitude;
      
      final response = await _supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
          
      return UserModel.fromJson(response);
    } catch (e) {
      throw Exception('프로필 업데이트 실패: $e');
    }
  }
  
  // 사용자명 중복 확인
  Future<bool> checkUsernameAvailability(String username) async {
    try {
      final response = await _supabase
          .from('profiles')
          .select('id')
          .eq('username', username);
          
      return response.isEmpty;
    } catch (e) {
      return false;
    }
  }
}
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
      print('=== 회원가입 시작 ===');
      print('Email: $email');
      print('Username: $username');
      print('Full Name: $fullName');
      
      // 사용자명 중복 체크
      final isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        throw Exception('이미 사용 중인 사용자명입니다');
      }
      
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {
          'username': username,
          'full_name': fullName,
        },
      );
      
      print('Supabase 회원가입 응답: ${response.user?.id}');
      
      if (response.user != null) {
        // 트리거가 프로필을 자동 생성하므로, 잠시 대기 후 프로필 조회
        await Future.delayed(const Duration(seconds: 2));
        
        try {
          final profile = await getProfile(response.user!.id);
          if (profile != null) {
            print('프로필 자동 생성 성공');
            return profile;
          }
        } catch (e) {
          print('프로필 자동 생성 실패, 수동 생성 시도: $e');
        }
        
        // 프로필이 없으면 수동 생성
        return await _createProfile(
          id: response.user!.id,
          email: email,
          username: username,
          fullName: fullName,
        );
      }
      return null;
    } catch (e) {
      print('회원가입 오류: $e');
      throw Exception('회원가입 실패: ${e.toString()}');
    }
  }
  
  // 이메일로 로그인
  Future<UserModel?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      print('\n=== 로그인 시도 상세 로그 ===');
      print('이메일: $email');
      print('비밀번호 길이: ${password.length}');
      print('Supabase 서버 연결 상태 확인');
      print('현재 세션 존재 여부: ${_supabase.auth.currentSession != null}');
      
      // 로그인 전 기존 세션 확인
      if (_supabase.auth.currentSession != null) {
        print('기존 세션이 존재합니다. 로그아웃 후 재시도...');
        await _supabase.auth.signOut();
      }
      
      print('\n로그인 API 호출 중...');
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      print('\n로그인 응답 받음:');
      print('- User ID: ${response.user?.id}');
      print('- User Email: ${response.user?.email}');
      print('- Session 존재: ${response.session != null}');
      print('- Access Token 존재: ${response.session?.accessToken != null}');
      
      if (response.user != null) {
        print('\n프로필 조회 시작...');
        final profile = await getProfile(response.user!.id);
        
        if (profile != null) {
          print('프로필 조회 성공:');
          print('- Username: ${profile.username}');
          print('- Full Name: ${profile.fullName}');
          print('로그인 완전 성공!');
          return profile;
        } else {
          print('경고: 프로필을 찾을 수 없습니다!');
          print('프로필 테이블이 존재하는지 확인 필요');
          
          // 프로필이 없어도 Auth 사용자는 존재하므로 기본 UserModel 반환
          return UserModel(
            id: response.user!.id,
            email: response.user!.email ?? email,
            username: response.user!.userMetadata?['username'] ?? 'user_${response.user!.id.substring(0, 8)}',
            fullName: response.user!.userMetadata?['full_name'] ?? '사용자',
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          );
        }
      } else {
        print('오류: 로그인 응답에 사용자 정보가 없습니다');
        return null;
      }
    } on AuthException catch (e) {
      print('\n=== Auth 예외 발생 ===');
      print('에러 코드: ${e.statusCode}');
      print('에러 메시지: ${e.message}');
      
      if (e.message.contains('Invalid login credentials')) {
        throw Exception('이메일 또는 비밀번호가 올바르지 않습니다');
      } else if (e.message.contains('Email not confirmed')) {
        throw Exception('이메일 인증이 필요합니다. 이메일을 확인해주세요');
      } else if (e.message.contains('User not found')) {
        throw Exception('등록되지 않은 사용자입니다');
      } else {
        throw Exception('로그인 실패: ${e.message}');
      }
    } catch (e, stackTrace) {
      print('\n=== 일반 예외 발생 ===');
      print('에러 타입: ${e.runtimeType}');
      print('에러 메시지: $e');
      print('스택 트레이스: $stackTrace');
      throw Exception('로그인 처리 중 오류 발생: $e');
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
      print('\n=== 비밀번호 재설정 시도 ===');
      print('이메일: $email');
      print('Redirect URL: com.devyb.billage://reset-password');
      
      await _supabase.auth.resetPasswordForEmail(
        email,
        redirectTo: 'com.devyb.billage://reset-password',
      );
      
      print('비밀번호 재설정 이메일 전송 성공!');
      print('사용자는 이메일을 확인해야 합니다');
    } on AuthException catch (e) {
      print('\n=== Auth 예외 (비밀번호 재설정) ===');
      print('에러 코드: ${e.statusCode}');
      print('에러 메시지: ${e.message}');
      
      if (e.message.contains('User not found')) {
        throw Exception('등록되지 않은 이메일입니다');
      } else if (e.message.contains('Rate limit')) {
        throw Exception('너무 많은 요청입니다. 잠시 후 다시 시도해주세요');
      } else {
        throw Exception('비밀번호 재설정 실패: ${e.message}');
      }
    } catch (e) {
      print('\n=== 일반 예외 (비밀번호 재설정) ===');
      print('에러: $e');
      throw Exception('비밀번호 재설정 이메일 전송 중 오류: $e');
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
      print('프로필 조회 중: $userId');
      
      final response = await _supabase
          .from('profiles')
          .select()
          .eq('id', userId)
          .single();
      
      print('프로필 데이터: $response');
      return UserModel.fromJson(response);
    } catch (e) {
      print('프로필 조회 실패: $e');
      
      // 프로필 테이블이 없거나 데이터가 없는 경우 처리
      if (e.toString().contains('table') || e.toString().contains('row')) {
        print('프로필 테이블 또는 데이터 문제 감지');
      }
      
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
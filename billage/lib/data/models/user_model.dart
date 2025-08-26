import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String username,
    required String fullName,
    required String email,
    String? phone,
    String? avatarUrl,
    String? bio,
    @Default('user') String role,
    @Default('active') String status,
    
    // 위치 정보
    String? address,
    double? latitude,
    double? longitude,
    
    // 신뢰도 정보
    @Default(0.0) double trustScore,
    @Default({}) Map<String, dynamic> verificationStatus,
    
    // 통계
    @Default(0) int totalRentals,
    @Default(0) int totalListings,
    @Default(0) int rentalCount,
    
    // 메타데이터
    @Default({}) Map<String, dynamic> settings,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
      
  // Helper methods
  const UserModel._();
  
  bool get isVerified => verificationStatus['phone'] == true && 
                         verificationStatus['email'] == true;
                         
  String get displayName => fullName.isNotEmpty ? fullName : username;
  
  String get trustLevel {
    if (trustScore >= 4.5) return '최고';
    if (trustScore >= 4.0) return '우수';
    if (trustScore >= 3.5) return '양호';
    if (trustScore >= 3.0) return '보통';
    return '신규';
  }
}
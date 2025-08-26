import 'package:freezed_annotation/freezed_annotation.dart';
import 'user_model.dart';

part 'product_model.freezed.dart';
part 'product_model.g.dart';

@freezed
class ProductModel with _$ProductModel {
  const factory ProductModel({
    required String id,
    required String ownerId,
    required String categoryId,
    
    // 기본 정보
    required String title,
    required String description,
    String? brand,
    String? model,
    String? serialNumber,
    required String condition,
    @Default('available') String status,
    
    // 가격 정보
    required double dailyPrice,
    double? weeklyPrice,
    double? monthlyPrice,
    required double depositAmount,
    
    // 위치 정보
    String? address,
    double? latitude,
    double? longitude,
    @Default(5) int maxDistance,
    
    // 미디어
    @Default([]) List<String> images,
    String? videoUrl,
    
    // 통계
    @Default(0) int viewCount,
    @Default(0) int rentalCount,
    @Default(0) int favoriteCount,
    @Default(0.0) double averageRating,
    
    // 메타데이터
    @Default({}) Map<String, dynamic> specifications,
    @Default({}) Map<String, dynamic> availableDates,
    @Default(false) bool isFeatured,
    required DateTime createdAt,
    required DateTime updatedAt,
    
    // Relations (populated when needed)
    UserModel? owner,
    CategoryModel? category,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);
      
  // Helper methods
  const ProductModel._();
  
  bool get isAvailable => status == 'available';
  
  String get displayPrice => '₩${dailyPrice.toStringAsFixed(0)}/일';
  
  String get conditionText {
    switch (condition) {
      case 'new': return '새 제품';
      case 'like_new': return '거의 새 것';
      case 'good': return '사용감 있음';
      case 'fair': return '많이 사용함';
      default: return condition;
    }
  }
  
  // Getter for compatibility
  String get location => address ?? '위치 정보 없음';
  double get ownerRating => owner?.trustScore ?? 0.0;
  int get likeCount => favoriteCount;
  String get categoryName => category?.name ?? '기타';
  double? get distance => null; // TODO: Calculate from user location
  String? get ownerName => owner?.username;
  String? get ownerAvatarUrl => owner?.avatarUrl;
  double? get ownerTrustScore => owner?.trustScore;
  int? get ownerRentalCount => owner?.rentalCount;
  
  double getPrice(int days) {
    if (days >= 30 && monthlyPrice != null) {
      return monthlyPrice! * (days / 30).ceil();
    } else if (days >= 7 && weeklyPrice != null) {
      return weeklyPrice! * (days / 7).ceil();
    }
    return dailyPrice * days;
  }
}

@freezed
class CategoryModel with _$CategoryModel {
  const factory CategoryModel({
    required String id,
    required String name,
    required String slug,
    String? icon,
    String? parentId,
    @Default(0) int sortOrder,
    @Default(true) bool isActive,
    required DateTime createdAt,
  }) = _CategoryModel;

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);
}
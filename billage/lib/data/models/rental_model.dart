import 'package:flutter/material.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'product_model.dart';
import 'user_model.dart';

part 'rental_model.freezed.dart';
part 'rental_model.g.dart';

@freezed
class RentalModel with _$RentalModel {
  const factory RentalModel({
    required String id,
    required String productId,
    required String ownerId,
    required String renterId,
    
    // 대여 정보
    required DateTime startDate,
    required DateTime endDate,
    int? rentalDays,
    
    // 가격 정보
    required double dailyRate,
    required double totalPrice,
    required double depositAmount,
    required double platformFee,
    double? insuranceFee,
    
    // 상태
    @Default('requested') String status,
    
    // 픽업/반납 정보
    String? pickupLocation,
    DateTime? pickupTime,
    DateTime? returnTime,
    
    // 메타데이터
    String? notes,
    String? contractUrl,
    required DateTime createdAt,
    required DateTime updatedAt,
    
    // Relations
    ProductModel? product,
    UserModel? owner,
    UserModel? renter,
  }) = _RentalModel;

  factory RentalModel.fromJson(Map<String, dynamic> json) =>
      _$RentalModelFromJson(json);
      
  // Helper methods
  const RentalModel._();
  
  int get calculatedRentalDays => 
      endDate.difference(startDate).inDays + 1;
      
  bool get isActive => status == 'ongoing';
  bool get isPending => status == 'requested';
  bool get isCompleted => status == 'completed';
  
  String get statusText {
    switch (status) {
      case 'requested': return '요청됨';
      case 'approved': return '승인됨';
      case 'ongoing': return '진행중';
      case 'completed': return '완료됨';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  }
  
  Color getStatusColor() {
    switch (status) {
      case 'requested': return const Color(0xFFFFA500);
      case 'approved': return const Color(0xFF4CAF50);
      case 'ongoing': return const Color(0xFF2196F3);
      case 'completed': return const Color(0xFF9E9E9E);
      case 'cancelled': return const Color(0xFFF44336);
      default: return const Color(0xFF9E9E9E);
    }
  }
}
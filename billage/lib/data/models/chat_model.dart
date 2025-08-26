import 'package:freezed_annotation/freezed_annotation.dart';
import 'user_model.dart';
import 'product_model.dart';

part 'chat_model.freezed.dart';
part 'chat_model.g.dart';

@freezed
class ChatRoomModel with _$ChatRoomModel {
  const factory ChatRoomModel({
    required String id,
    String? productId,
    String? rentalId,
    
    // 참여자
    required String participant1Id,
    required String participant2Id,
    
    // 상태
    @Default(true) bool isActive,
    DateTime? lastMessageAt,
    required DateTime createdAt,
    
    // Relations
    UserModel? participant1,
    UserModel? participant2,
    ProductModel? product,
    MessageModel? lastMessage,
    @Default(0) int unreadCount,
  }) = _ChatRoomModel;

  factory ChatRoomModel.fromJson(Map<String, dynamic> json) =>
      _$ChatRoomModelFromJson(json);
      
  // Helper methods
  const ChatRoomModel._();
  
  UserModel? getOtherParticipant(String currentUserId) {
    if (participant1Id == currentUserId) return participant2;
    if (participant2Id == currentUserId) return participant1;
    return null;
  }
  
  String getChatTitle(String currentUserId) {
    final other = getOtherParticipant(currentUserId);
    if (other != null) return other.displayName;
    return '채팅';
  }
}

@freezed
class MessageModel with _$MessageModel {
  const factory MessageModel({
    required String id,
    required String chatRoomId,
    required String senderId,
    
    // 메시지 내용
    required String content,
    @Default('text') String messageType,
    @Default([]) List<Map<String, dynamic>> attachments,
    
    // 상태
    @Default(false) bool isRead,
    DateTime? readAt,
    required DateTime createdAt,
    
    // Relations
    UserModel? sender,
  }) = _MessageModel;

  factory MessageModel.fromJson(Map<String, dynamic> json) =>
      _$MessageModelFromJson(json);
      
  // Helper methods
  const MessageModel._();
  
  bool get isText => messageType == 'text';
  bool get isImage => messageType == 'image';
  bool get isFile => messageType == 'file';
  bool get isSystem => messageType == 'system';
  
  String get displayTime {
    final now = DateTime.now();
    final diff = now.difference(createdAt);
    
    if (diff.inMinutes < 1) return '방금';
    if (diff.inMinutes < 60) return '${diff.inMinutes}분 전';
    if (diff.inHours < 24) return '${diff.inHours}시간 전';
    if (diff.inDays < 7) return '${diff.inDays}일 전';
    
    return '${createdAt.month}/${createdAt.day}';
  }
}
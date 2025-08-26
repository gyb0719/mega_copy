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
    ChatMessage? lastMessage,
    @Default(0) int unreadCount,
  }) = _ChatRoomModel;

  factory ChatRoomModel.fromJson(Map<String, dynamic> json, String currentUserId) {
    // Supabase에서 받은 데이터 처리
    final isParticipant1 = json['participant1_id'] == currentUserId;
    
    UserModel? p1, p2;
    if (json['participant1'] != null) {
      p1 = UserModel.fromJson(json['participant1'] as Map<String, dynamic>);
    }
    if (json['participant2'] != null) {
      p2 = UserModel.fromJson(json['participant2'] as Map<String, dynamic>);
    }
    
    ProductModel? prod;
    if (json['product'] != null) {
      prod = ProductModel.fromJson(json['product'] as Map<String, dynamic>);
    }
    
    // 마지막 메시지 처리
    ChatMessage? lastMsg;
    final messages = json['messages'] as List<dynamic>?;
    if (messages != null && messages.isNotEmpty) {
      final lastMsgData = messages.last as Map<String, dynamic>;
      lastMsg = ChatMessage.fromJson(lastMsgData);
    }
    
    // 읽지 않은 메시지 수
    int unread = 0;
    if (messages != null) {
      unread = messages.where((msg) {
        final m = msg as Map<String, dynamic>;
        return m['sender_id'] != currentUserId && 
               (m['is_read'] == false || m['is_read'] == null);
      }).length;
    }
    
    return ChatRoomModel(
      id: json['id'] as String,
      productId: json['product_id'] as String?,
      rentalId: json['rental_id'] as String?,
      participant1Id: json['participant1_id'] as String,
      participant2Id: json['participant2_id'] as String,
      isActive: json['is_active'] as bool? ?? true,
      lastMessageAt: json['last_message_at'] != null
          ? DateTime.parse(json['last_message_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      participant1: p1,
      participant2: p2,
      product: prod,
      lastMessage: lastMsg,
      unreadCount: unread,
    );
  }
      
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
class ChatMessage with _$ChatMessage {
  const factory ChatMessage({
    required String id,
    required String roomId,
    required String senderId,
    
    // 메시지 내용
    required String content,
    String? imageUrl,
    Map<String, dynamic>? metadata,
    
    // 상태
    @Default(false) bool isRead,
    DateTime? readAt,
    required DateTime createdAt,
    
    // Relations
    UserModel? sender,
  }) = _ChatMessage;

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    UserModel? senderUser;
    if (json['sender'] != null) {
      senderUser = UserModel.fromJson(json['sender'] as Map<String, dynamic>);
    }
    
    return ChatMessage(
      id: json['id'] as String,
      roomId: json['room_id'] as String,
      senderId: json['sender_id'] as String,
      content: json['content'] as String,
      imageUrl: json['image_url'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      isRead: json['is_read'] as bool? ?? false,
      readAt: json['read_at'] != null 
          ? DateTime.parse(json['read_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      sender: senderUser,
    );
  }
      
  // Helper methods
  const ChatMessage._();
  
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
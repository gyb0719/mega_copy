import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/chat_model.dart';

class ChatRepository {
  final SupabaseClient _supabase;
  
  ChatRepository({required SupabaseClient supabase}) : _supabase = supabase;
  
  // 채팅방 목록 가져오기
  Future<List<ChatRoomModel>> getChatRooms(String userId) async {
    try {
      final response = await _supabase
          .from('chat_rooms')
          .select('''
            *,
            product:products(id, title, images),
            participant1:profiles!chat_rooms_participant1_id_fkey(id, username, avatar_url),
            participant2:profiles!chat_rooms_participant2_id_fkey(id, username, avatar_url),
            messages:chat_messages(
              id,
              content,
              created_at,
              sender_id
            )
          ''')
          .or('participant1_id.eq.$userId,participant2_id.eq.$userId')
          .eq('is_active', true)
          .order('last_message_at', ascending: false);

      return (response as List)
          .map((room) => ChatRoomModel.fromJson(room, userId))
          .toList();
    } catch (e) {
      throw Exception('채팅방 목록을 불러올 수 없습니다: $e');
    }
  }

  // 특정 채팅방 가져오기
  Future<ChatRoomModel?> getChatRoom(String roomId, String userId) async {
    try {
      final response = await _supabase
          .from('chat_rooms')
          .select('''
            *,
            product:products(id, title, images, daily_price),
            participant1:profiles!chat_rooms_participant1_id_fkey(id, username, avatar_url),
            participant2:profiles!chat_rooms_participant2_id_fkey(id, username, avatar_url)
          ''')
          .eq('id', roomId)
          .single();

      return ChatRoomModel.fromJson(response, userId);
    } catch (e) {
      return null;
    }
  }

  // 채팅방 생성
  Future<ChatRoomModel> createChatRoom({
    required String productId,
    required String participant1Id,
    required String participant2Id,
  }) async {
    try {
      // 이미 존재하는 채팅방인지 확인
      final existing = await _supabase
          .from('chat_rooms')
          .select()
          .eq('product_id', productId)
          .or('participant1_id.eq.$participant1Id,participant2_id.eq.$participant1Id')
          .or('participant1_id.eq.$participant2Id,participant2_id.eq.$participant2Id')
          .maybeSingle();

      if (existing != null) {
        final room = await getChatRoom(existing['id'], participant1Id);
        if (room == null) {
          throw Exception('채팅방을 불러올 수 없습니다');
        }
        return room;
      }

      // 새 채팅방 생성
      final response = await _supabase
          .from('chat_rooms')
          .insert({
            'product_id': productId,
            'participant1_id': participant1Id,
            'participant2_id': participant2Id,
          })
          .select()
          .single();

      final newRoom = await getChatRoom(response['id'], participant1Id);
      if (newRoom == null) {
        throw Exception('채팅방을 생성할 수 없습니다');
      }
      return newRoom;
    } catch (e) {
      throw Exception('채팅방 생성 실패: $e');
    }
  }

  // 메시지 목록 가져오기
  Future<List<ChatMessage>> getMessages({
    required String roomId,
    int limit = 50,
    String? before,
  }) async {
    try {
      var query = _supabase
          .from('chat_messages')
          .select('''
            *,
            sender:profiles(id, username, avatar_url)
          ''')
          .eq('room_id', roomId)
          .order('created_at', ascending: false)
          .limit(limit);

      // TODO: Implement pagination with before parameter
      final response = await query;
      
      return (response as List)
          .map((msg) => ChatMessage.fromJson(msg))
          .toList()
          .reversed
          .toList(); // 시간 순서대로 정렬
    } catch (e) {
      throw Exception('메시지를 불러올 수 없습니다: $e');
    }
  }

  // 메시지 전송
  Future<ChatMessage> sendMessage({
    required String roomId,
    required String senderId,
    required String content,
    String? imageUrl,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final response = await _supabase
          .from('chat_messages')
          .insert({
            'room_id': roomId,
            'sender_id': senderId,
            'content': content,
            'image_url': imageUrl,
            'metadata': metadata,
          })
          .select('''
            *,
            sender:profiles(id, username, avatar_url)
          ''')
          .single();

      // 채팅방의 last_message_at 업데이트
      await _supabase
          .from('chat_rooms')
          .update({'last_message_at': response['created_at']})
          .eq('id', roomId);

      return ChatMessage.fromJson(response);
    } catch (e) {
      throw Exception('메시지 전송 실패: $e');
    }
  }

  // 메시지 읽음 처리
  Future<void> markMessagesAsRead({
    required String roomId,
    required String userId,
  }) async {
    try {
      await _supabase
          .from('chat_messages')
          .update({'is_read': true})
          .eq('room_id', roomId)
          .neq('sender_id', userId)
          .eq('is_read', false);
    } catch (e) {
      throw Exception('읽음 처리 실패: $e');
    }
  }

  // 읽지 않은 메시지 수 가져오기
  Future<int> getUnreadCount(String roomId, String userId) async {
    try {
      final response = await _supabase
          .from('chat_messages')
          .select('id')
          .eq('room_id', roomId)
          .neq('sender_id', userId)
          .eq('is_read', false);

      return (response as List).length;
    } catch (e) {
      return 0;
    }
  }

  // 실시간 메시지 구독
  Stream<ChatMessage> subscribeToMessages(String roomId) {
    return _supabase
        .from('chat_messages:room_id=eq.$roomId')
        .stream(primaryKey: ['id'])
        .map((data) {
          if (data.isNotEmpty) {
            return ChatMessage.fromJson(data.first);
          }
          throw Exception('No message data');
        });
  }

  // 채팅방 삭제 (soft delete)
  Future<void> deleteChatRoom(String roomId) async {
    try {
      await _supabase
          .from('chat_rooms')
          .update({'is_active': false})
          .eq('id', roomId);
    } catch (e) {
      throw Exception('채팅방 삭제 실패: $e');
    }
  }
}
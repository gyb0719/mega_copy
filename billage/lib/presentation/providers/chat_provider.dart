import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/chat_repository.dart';
import '../../data/models/chat_model.dart';
import 'auth_provider.dart';

// Chat Repository Provider
final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return ChatRepository(supabase: supabase);
});

// Chat Rooms List Provider
final chatRoomsProvider = StreamProvider<List<ChatRoomModel>>((ref) async* {
  final currentUser = await ref.watch(currentUserProvider.future);
  if (currentUser == null) {
    yield [];
    return;
  }

  final repository = ref.watch(chatRepositoryProvider);
  
  // 초기 데이터 로드
  yield await repository.getChatRooms(currentUser.id);
  
  // 실시간 업데이트 구독
  final supabase = ref.watch(supabaseClientProvider);
  await for (final _ in supabase
      .from('chat_rooms')
      .stream(primaryKey: ['id'])
      .or('participant1_id.eq.${currentUser.id},participant2_id.eq.${currentUser.id}')) {
    yield await repository.getChatRooms(currentUser.id);
  }
});

// Specific Chat Room Provider
final chatRoomProvider = FutureProvider.family<ChatRoomModel?, String>((ref, roomId) async {
  final currentUser = await ref.watch(currentUserProvider.future);
  if (currentUser == null) return null;

  final repository = ref.watch(chatRepositoryProvider);
  return repository.getChatRoom(roomId, currentUser.id);
});

// Chat Messages Provider
final chatMessagesProvider = StateNotifierProvider.family<ChatMessagesNotifier, AsyncValue<List<ChatMessage>>, String>(
  (ref, roomId) {
    final repository = ref.watch(chatRepositoryProvider);
    final currentUser = ref.watch(currentUserProvider).value;
    return ChatMessagesNotifier(repository, roomId, currentUser?.id);
  },
);

class ChatMessagesNotifier extends StateNotifier<AsyncValue<List<ChatMessage>>> {
  final ChatRepository _repository;
  final String _roomId;
  final String? _userId;
  
  ChatMessagesNotifier(this._repository, this._roomId, this._userId) 
      : super(const AsyncValue.loading()) {
    loadMessages();
    _subscribeToMessages();
  }

  Future<void> loadMessages() async {
    try {
      final messages = await _repository.getMessages(roomId: _roomId);
      state = AsyncValue.data(messages);
      
      // 메시지 읽음 처리
      if (_userId != null) {
        _repository.markMessagesAsRead(roomId: _roomId, userId: _userId!);
      }
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> loadMoreMessages() async {
    final currentMessages = state.value ?? [];
    if (currentMessages.isEmpty) return;

    try {
      final oldestMessage = currentMessages.first;
      final moreMessages = await _repository.getMessages(
        roomId: _roomId,
        before: oldestMessage.createdAt.toIso8601String(),
      );
      
      state = AsyncValue.data([...moreMessages, ...currentMessages]);
    } catch (e) {
      // 더 불러오기 실패는 무시
    }
  }

  void _subscribeToMessages() {
    _repository.subscribeToMessages(_roomId).listen(
      (message) {
        final currentMessages = state.value ?? [];
        // 중복 체크
        if (!currentMessages.any((m) => m.id == message.id)) {
          state = AsyncValue.data([...currentMessages, message]);
          
          // 다른 사용자의 메시지인 경우 읽음 처리
          if (_userId != null && message.senderId != _userId) {
            _repository.markMessagesAsRead(roomId: _roomId, userId: _userId!);
          }
        }
      },
      onError: (error) {
        // 실시간 업데이트 에러는 무시
      },
    );
  }

  Future<void> sendMessage(String content, {String? imageUrl}) async {
    if (_userId == null) {
      state = AsyncValue.error(Exception('로그인이 필요합니다'), StackTrace.current);
      return;
    }

    try {
      final message = await _repository.sendMessage(
        roomId: _roomId,
        senderId: _userId!,
        content: content,
        imageUrl: imageUrl,
      );
      
      final currentMessages = state.value ?? [];
      state = AsyncValue.data([...currentMessages, message]);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}

// Unread Messages Count Provider
final unreadMessagesCountProvider = StreamProvider.family<int, String>((ref, roomId) async* {
  final currentUser = await ref.watch(currentUserProvider.future);
  if (currentUser == null) {
    yield 0;
    return;
  }

  final repository = ref.watch(chatRepositoryProvider);
  
  // 초기 카운트
  yield await repository.getUnreadCount(roomId, currentUser.id);
  
  // 실시간 업데이트
  final supabase = ref.watch(supabaseClientProvider);
  await for (final _ in supabase
      .from('chat_messages:room_id=eq.$roomId')
      .stream(primaryKey: ['id'])) {
    yield await repository.getUnreadCount(roomId, currentUser.id);
  }
});

// Total Unread Count Provider
final totalUnreadCountProvider = StreamProvider<int>((ref) async* {
  final chatRooms = await ref.watch(chatRoomsProvider.future);
  final currentUser = await ref.watch(currentUserProvider.future);
  
  if (currentUser == null) {
    yield 0;
    return;
  }

  int total = 0;
  for (final room in chatRooms) {
    final count = await ref.watch(unreadMessagesCountProvider(room.id).future);
    total += count;
  }
  
  yield total;
});

// Create or Get Chat Room Provider
final createChatRoomProvider = Provider((ref) {
  return ({
    required String productId,
    required String otherUserId,
  }) async {
    final currentUser = ref.read(currentUserProvider).value;
    if (currentUser == null) throw Exception('로그인이 필요합니다');
    
    final repository = ref.read(chatRepositoryProvider);
    return repository.createChatRoom(
      productId: productId,
      participant1Id: currentUser.id,
      participant2Id: otherUserId,
    );
  };
});
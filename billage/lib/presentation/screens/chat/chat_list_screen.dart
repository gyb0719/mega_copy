import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';

import '../../../data/models/chat_model.dart';

class ChatListScreen extends ConsumerStatefulWidget {
  const ChatListScreen({super.key});

  @override
  ConsumerState<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends ConsumerState<ChatListScreen> {
  // Demo chat rooms
  final List<ChatRoomModel> _chatRooms = [
    ChatRoomModel(
      id: '1',
      productId: 'prod1',
      productTitle: 'Sony A7 III',
      productImage: 'https://via.placeholder.com/100',
      participant1Id: 'user1',
      participant2Id: 'user2',
      otherParticipantName: '김민수',
      otherParticipantAvatar: null,
      lastMessage: '안녕하세요! 제품 상태가 어떤가요?',
      lastMessageAt: DateTime.now().subtract(const Duration(minutes: 5)),
      unreadCount: 2,
      isActive: true,
    ),
    ChatRoomModel(
      id: '2',
      productId: 'prod2',
      productTitle: 'MacBook Pro M3',
      productImage: 'https://via.placeholder.com/100',
      participant1Id: 'user1',
      participant2Id: 'user3',
      otherParticipantName: '이지은',
      otherParticipantAvatar: null,
      lastMessage: '네, 내일 오후 2시에 만나요',
      lastMessageAt: DateTime.now().subtract(const Duration(hours: 1)),
      unreadCount: 0,
      isActive: true,
    ),
    ChatRoomModel(
      id: '3',
      productId: 'prod3',
      productTitle: 'PlayStation 5',
      productImage: 'https://via.placeholder.com/100',
      participant1Id: 'user1',
      participant2Id: 'user4',
      otherParticipantName: '박준호',
      otherParticipantAvatar: null,
      lastMessage: '감사합니다! 잘 사용할게요',
      lastMessageAt: DateTime.now().subtract(const Duration(days: 1)),
      unreadCount: 0,
      isActive: true,
    ),
  ];

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inDays >= 1) {
      if (difference.inDays == 1) {
        return '어제';
      } else if (difference.inDays < 7) {
        return '${difference.inDays}일 전';
      } else {
        return DateFormat('MM/dd').format(dateTime);
      }
    } else if (difference.inHours >= 1) {
      return '${difference.inHours}시간 전';
    } else if (difference.inMinutes >= 1) {
      return '${difference.inMinutes}분 전';
    } else {
      return '방금';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('채팅'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Implement chat search
            },
          ),
        ],
      ),
      body: _chatRooms.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.chat_bubble_outline,
                    size: 80,
                    color: Colors.grey.shade400,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '진행 중인 채팅이 없습니다',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '제품을 대여하거나 문의하면\n채팅이 시작됩니다',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            )
          : ListView.separated(
              itemCount: _chatRooms.length,
              separatorBuilder: (context, index) => const Divider(
                height: 1,
                indent: 88,
              ),
              itemBuilder: (context, index) {
                final chatRoom = _chatRooms[index];
                return InkWell(
                  onTap: () {
                    context.push('/chat/${chatRoom.id}');
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    child: Row(
                      children: [
                        // Product Image
                        Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: CachedNetworkImage(
                                imageUrl: chatRoom.productImage,
                                width: 56,
                                height: 56,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(
                                  color: Colors.grey.shade200,
                                ),
                                errorWidget: (context, url, error) => Container(
                                  color: Colors.grey.shade200,
                                  child: const Icon(Icons.image_not_supported),
                                ),
                              ),
                            ),
                            // User Avatar
                            Positioned(
                              right: -4,
                              bottom: -4,
                              child: Container(
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 2,
                                  ),
                                ),
                                child: CircleAvatar(
                                  radius: 12,
                                  backgroundColor: Theme.of(context).primaryColor,
                                  backgroundImage:
                                      chatRoom.otherParticipantAvatar != null
                                          ? CachedNetworkImageProvider(
                                              chatRoom.otherParticipantAvatar!)
                                          : null,
                                  child: chatRoom.otherParticipantAvatar == null
                                      ? Text(
                                          chatRoom.otherParticipantName
                                              .substring(0, 1),
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        )
                                      : null,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 16),
                        // Chat Info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      chatRoom.otherParticipantName,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 15,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    _formatTime(chatRoom.lastMessageAt),
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                chatRoom.productTitle,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      chatRoom.lastMessage,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: chatRoom.unreadCount > 0
                                            ? Colors.black
                                            : Colors.grey.shade600,
                                        fontWeight: chatRoom.unreadCount > 0
                                            ? FontWeight.w500
                                            : FontWeight.normal,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (chatRoom.unreadCount > 0)
                                    Container(
                                      margin: const EdgeInsets.only(left: 8),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 6,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Theme.of(context).primaryColor,
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        chatRoom.unreadCount.toString(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

// Temporary ChatRoom Model
class ChatRoomModel {
  final String id;
  final String productId;
  final String productTitle;
  final String productImage;
  final String participant1Id;
  final String participant2Id;
  final String otherParticipantName;
  final String? otherParticipantAvatar;
  final String lastMessage;
  final DateTime lastMessageAt;
  final int unreadCount;
  final bool isActive;

  ChatRoomModel({
    required this.id,
    required this.productId,
    required this.productTitle,
    required this.productImage,
    required this.participant1Id,
    required this.participant2Id,
    required this.otherParticipantName,
    this.otherParticipantAvatar,
    required this.lastMessage,
    required this.lastMessageAt,
    required this.unreadCount,
    required this.isActive,
  });
}
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';

class ChatRoomScreen extends ConsumerStatefulWidget {
  final String chatId;
  const ChatRoomScreen({super.key, required this.chatId});

  @override
  ConsumerState<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends ConsumerState<ChatRoomScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  bool _isTyping = false;

  // Demo messages
  final List<ChatMessage> _messages = [];

  // Demo product info
  final productInfo = {
    'title': 'Sony A7 III',
    'image': 'https://via.placeholder.com/60',
    'price': '50,000원/일',
  };

  // Demo other user info
  final otherUser = {
    'name': '김민수',
    'avatar': null,
  };

  @override
  void initState() {
    super.initState();
    _loadInitialMessages();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }

  void _loadInitialMessages() {
    _messages.addAll([
      ChatMessage(
        id: '1',
        text: '안녕하세요! 제품 상태가 어떤가요?',
        senderId: 'other',
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        isRead: true,
      ),
      ChatMessage(
        id: '2',
        text: '안녕하세요! A7 III 상태 아주 좋습니다. 박스풀셋이고 기스 하나 없어요.',
        senderId: 'me',
        timestamp: DateTime.now().subtract(const Duration(hours: 1, minutes: 45)),
        isRead: true,
      ),
      ChatMessage(
        id: '3',
        text: '셔터카운트는 얼마나 되나요?',
        senderId: 'other',
        timestamp: DateTime.now().subtract(const Duration(hours: 1, minutes: 30)),
        isRead: true,
      ),
      ChatMessage(
        id: '4',
        text: '약 5,000컷 정도 됩니다. 거의 사용 안 한 상태예요.',
        senderId: 'me',
        timestamp: DateTime.now().subtract(const Duration(hours: 1, minutes: 15)),
        isRead: true,
      ),
      ChatMessage(
        id: '5',
        text: '렌즈는 포함인가요?',
        senderId: 'other',
        timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
        isRead: true,
      ),
      ChatMessage(
        id: '6',
        text: '기본 키트렌즈 28-70mm 포함입니다.',
        senderId: 'me',
        timestamp: DateTime.now().subtract(const Duration(minutes: 25)),
        isRead: true,
      ),
      ChatMessage(
        id: '7',
        text: '3일간 대여하고 싶은데 가능할까요?',
        senderId: 'other',
        timestamp: DateTime.now().subtract(const Duration(minutes: 10)),
        isRead: true,
      ),
      ChatMessage(
        id: '8',
        text: '네, 가능합니다! 3일이면 135,000원입니다.',
        senderId: 'me',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        isRead: false,
      ),
    ]);
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(
        ChatMessage(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          text: text,
          senderId: 'me',
          timestamp: DateTime.now(),
          isRead: false,
        ),
      );
      _messageController.clear();
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });

    // Simulate receiving a response after 2 seconds
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _messages.add(
            ChatMessage(
              id: DateTime.now().millisecondsSinceEpoch.toString(),
              text: '네, 알겠습니다. 언제 픽업 가능하신가요?',
              senderId: 'other',
              timestamp: DateTime.now(),
              isRead: true,
            ),
          );
        });
        _scrollToBottom();
      }
    });
  }

  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      return DateFormat('MM/dd HH:mm').format(timestamp);
    } else {
      return DateFormat('HH:mm').format(timestamp);
    }
  }

  Widget _buildProductCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: productInfo['image']!,
              width: 48,
              height: 48,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                color: Colors.grey.shade200,
              ),
              errorWidget: (context, url, error) => Container(
                color: Colors.grey.shade200,
                child: const Icon(Icons.image_not_supported, size: 20),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  productInfo['title']!,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  productInfo['price']!,
                  style: TextStyle(
                    fontSize: 13,
                    color: Theme.of(context).primaryColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              // Navigate to product detail
            },
            child: const Text(
              '상품 보기',
              style: TextStyle(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final isMe = message.senderId == 'me';
    
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.only(
          left: isMe ? 80 : 16,
          right: isMe ? 16 : 80,
          top: 4,
          bottom: 4,
        ),
        child: Column(
          crossAxisAlignment:
              isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (!isMe)
              Padding(
                padding: const EdgeInsets.only(left: 4, bottom: 4),
                child: Text(
                  otherUser['name']!,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (isMe) ...[  
                  Text(
                    _formatTime(message.timestamp),
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade500,
                    ),
                  ),
                  const SizedBox(width: 6),
                  if (!message.isRead)
                    const Text(
                      '1',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.orange,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  else
                    Icon(
                      Icons.done_all,
                      size: 14,
                      color: Colors.blue.shade400,
                    ),
                  const SizedBox(width: 4),
                ],
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: isMe
                          ? Theme.of(context).primaryColor
                          : Colors.grey.shade100,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isMe ? 16 : 4),
                        bottomRight: Radius.circular(isMe ? 4 : 16),
                      ),
                    ),
                    child: Text(
                      message.text,
                      style: TextStyle(
                        fontSize: 14,
                        color: isMe ? Colors.white : Colors.black87,
                      ),
                    ),
                  ),
                ),
                if (!isMe) ...[  
                  const SizedBox(width: 6),
                  Text(
                    _formatTime(message.timestamp),
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade500,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateSeparator(DateTime date) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          Expanded(
            child: Divider(color: Colors.grey.shade300),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              DateFormat('yyyy년 MM월 dd일').format(date),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade500,
              ),
            ),
          ),
          Expanded(
            child: Divider(color: Colors.grey.shade300),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Row(
        children: [
          Text(
            '${otherUser['name']}님이 입력 중',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade600,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(width: 4),
          SizedBox(
            width: 20,
            height: 10,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(3, (index) {
                return AnimatedContainer(
                  duration: Duration(milliseconds: 300 + (index * 100)),
                  width: 4,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade600,
                    shape: BoxShape.circle,
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: Theme.of(context).primaryColor,
              child: Text(
                otherUser['name']!.substring(0, 1),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    otherUser['name']!,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    '일반적으로 5분 내 응답',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {
              _showChatOptions(context);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildProductCard(),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (_isTyping && index == _messages.length) {
                  return _buildTypingIndicator();
                }

                final message = _messages[index];
                
                // Show date separator for first message or date change
                bool showDateSeparator = false;
                if (index == 0) {
                  showDateSeparator = true;
                } else {
                  final prevMessage = _messages[index - 1];
                  if (message.timestamp.day != prevMessage.timestamp.day) {
                    showDateSeparator = true;
                  }
                }

                return Column(
                  children: [
                    if (showDateSeparator) _buildDateSeparator(message.timestamp),
                    _buildMessageBubble(message),
                  ],
                );
              },
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.add_circle_outline),
                      color: Colors.grey.shade600,
                      onPressed: () {
                        _showAttachmentOptions(context);
                      },
                    ),
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _messageController,
                                focusNode: _focusNode,
                                maxLines: null,
                                textInputAction: TextInputAction.send,
                                onSubmitted: (_) => _sendMessage(),
                                onChanged: (text) {
                                  // Simulate typing indicator
                                },
                                decoration: const InputDecoration(
                                  hintText: '메시지를 입력하세요',
                                  hintStyle: TextStyle(fontSize: 14),
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 10,
                                  ),
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.emoji_emotions_outlined),
                              color: Colors.grey.shade600,
                              onPressed: () {
                                // Show emoji picker
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Container(
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.send),
                        color: Colors.white,
                        onPressed: _sendMessage,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showChatOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.notifications_off_outlined),
                title: const Text('알림 끄기'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.report_outlined),
                title: const Text('신고하기'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.block_outlined),
                title: const Text('차단하기'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.exit_to_app),
                title: const Text('채팅방 나가기'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              const Divider(),
              ListTile(
                title: const Text('취소'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAttachmentOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildAttachmentOption(
                      icon: Icons.camera_alt,
                      label: '카메라',
                      onTap: () {
                        Navigator.pop(context);
                      },
                    ),
                    _buildAttachmentOption(
                      icon: Icons.photo,
                      label: '갤러리',
                      onTap: () {
                        Navigator.pop(context);
                      },
                    ),
                    _buildAttachmentOption(
                      icon: Icons.location_on,
                      label: '위치',
                      onTap: () {
                        Navigator.pop(context);
                      },
                    ),
                    _buildAttachmentOption(
                      icon: Icons.calendar_today,
                      label: '약속 잡기',
                      onTap: () {
                        Navigator.pop(context);
                      },
                    ),
                  ],
                ),
              ),
              const Divider(),
              ListTile(
                title: const Text('취소'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAttachmentOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 24,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade700,
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }
}

class ChatMessage {
  final String id;
  final String text;
  final String senderId;
  final DateTime timestamp;
  final bool isRead;

  ChatMessage({
    required this.id,
    required this.text,
    required this.senderId,
    required this.timestamp,
    required this.isRead,
  });
}

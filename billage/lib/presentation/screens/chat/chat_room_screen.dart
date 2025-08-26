import 'package:flutter/material.dart';

class ChatRoomScreen extends StatelessWidget {
  final String chatId;
  const ChatRoomScreen({super.key, required this.chatId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('ChatRoomScreen')),
      body: const Center(child: Text('Coming Soon')),
    );
  }
}

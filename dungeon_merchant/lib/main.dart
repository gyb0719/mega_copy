import 'package:flutter/material.dart';
import 'screens/main_game_screen.dart';

void main() {
  runApp(const DungeonMerchantApp());
}

class DungeonMerchantApp extends StatelessWidget {
  const DungeonMerchantApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dungeon Merchant',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.amber,
        scaffoldBackgroundColor: const Color(0xFF1A0E0A),
        fontFamily: 'Roboto',
      ),
      home: const MainGameScreen(),
    );
  }
}
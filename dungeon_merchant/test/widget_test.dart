import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dungeon_merchant/main.dart';

void main() {
  testWidgets('App startup test', (WidgetTester tester) async {
    await tester.pumpWidget(const DungeonMerchantApp());
    
    expect(find.text('Day 1'), findsOneWidget);
    expect(find.text('500 Gold'), findsOneWidget);
  });
}
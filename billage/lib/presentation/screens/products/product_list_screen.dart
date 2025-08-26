import 'package:flutter/material.dart';

class ProductListScreen extends StatelessWidget {
  const ProductListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('제품 목록'),
      ),
      body: const Center(
        child: Text('제품 목록 화면'),
      ),
    );
  }
}
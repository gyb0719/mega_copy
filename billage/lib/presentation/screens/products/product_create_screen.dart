import 'package:flutter/material.dart';

class ProductCreateScreen extends StatelessWidget {
  const ProductCreateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('제품 등록'),
      ),
      body: const Center(
        child: Text('제품 등록 화면'),
      ),
    );
  }
}
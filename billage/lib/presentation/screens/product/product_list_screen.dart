import 'package:flutter/material.dart';

class ProductListScreen extends StatelessWidget {
  final String? category;
  const ProductListScreen({super.key, this.category});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('ProductListScreen')),
      body: const Center(child: Text('Coming Soon')),
    );
  }
}

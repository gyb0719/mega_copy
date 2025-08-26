import 'package:flutter/material.dart';

class SearchScreen extends StatelessWidget {
  final String? initialQuery;
  const SearchScreen({super.key, this.initialQuery});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('SearchScreen')),
      body: const Center(child: Text('Coming Soon')),
    );
  }
}

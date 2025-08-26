import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

import '../../../core/constants/app_constants.dart';
import '../../providers/product_provider.dart';
import '../../providers/auth_provider.dart';

class ProductCreateScreen extends ConsumerStatefulWidget {
  const ProductCreateScreen({super.key});

  @override
  ConsumerState<ProductCreateScreen> createState() =>
      _ProductCreateScreenState();
}

class _ProductCreateScreenState extends ConsumerState<ProductCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _brandController = TextEditingController();
  final _modelController = TextEditingController();
  final _dailyPriceController = TextEditingController();
  final _weeklyPriceController = TextEditingController();
  final _monthlyPriceController = TextEditingController();
  final _depositController = TextEditingController();
  final _addressController = TextEditingController();
  
  String? _selectedCategory;
  String _selectedCondition = 'good';
  final List<File> _selectedImages = [];
  final Map<String, String> _specifications = {};
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _brandController.dispose();
    _modelController.dispose();
    _dailyPriceController.dispose();
    _weeklyPriceController.dispose();
    _monthlyPriceController.dispose();
    _depositController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final ImagePicker picker = ImagePicker();
    final List<XFile> images = await picker.pickMultiImage();
    
    if (images.isNotEmpty) {
      setState(() {
        for (final image in images) {
          if (_selectedImages.length < 10) {
            _selectedImages.add(File(image.path));
          }
        }
      });
    }
  }

  Future<void> _takePhoto() async {
    final ImagePicker picker = ImagePicker();
    final XFile? photo = await picker.pickImage(source: ImageSource.camera);
    
    if (photo != null) {
      setState(() {
        if (_selectedImages.length < 10) {
          _selectedImages.add(File(photo.path));
        }
      });
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  void _addSpecification() {
    showDialog(
      context: context,
      builder: (context) {
        final keyController = TextEditingController();
        final valueController = TextEditingController();
        
        return AlertDialog(
          title: const Text('스펙 추가'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: keyController,
                decoration: const InputDecoration(
                  labelText: '항목명',
                  hintText: '예: 화면 크기',
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: valueController,
                decoration: const InputDecoration(
                  labelText: '값',
                  hintText: '예: 15.6인치',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('취소'),
            ),
            ElevatedButton(
              onPressed: () {
                if (keyController.text.isNotEmpty &&
                    valueController.text.isNotEmpty) {
                  setState(() {
                    _specifications[keyController.text] = valueController.text;
                  });
                  Navigator.pop(context);
                }
              },
              child: const Text('추가'),
            ),
          ],
        );
      },
    );
  }

  void _removeSpecification(String key) {
    setState(() {
      _specifications.remove(key);
    });
  }

  Future<void> _submitProduct() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('카테고리를 선택해주세요')),
      );
      return;
    }
    if (_selectedImages.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('최소 1장의 이미지를 추가해주세요')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      // TODO: Upload images to storage and get URLs
      final List<String> imageUrls = _selectedImages
          .map((file) => 'https://placeholder.com/image.jpg')
          .toList();

      await ref.read(productFormProvider.notifier).createProduct(
        categoryId: _selectedCategory!,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        condition: _selectedCondition,
        dailyPrice: double.parse(_dailyPriceController.text),
        depositAmount: double.parse(_depositController.text),
        brand: _brandController.text.trim().isEmpty
            ? null
            : _brandController.text.trim(),
        model: _modelController.text.trim().isEmpty
            ? null
            : _modelController.text.trim(),
        weeklyPrice: _weeklyPriceController.text.trim().isEmpty
            ? null
            : double.parse(_weeklyPriceController.text),
        monthlyPrice: _monthlyPriceController.text.trim().isEmpty
            ? null
            : double.parse(_monthlyPriceController.text),
        address: _addressController.text.trim().isEmpty
            ? null
            : _addressController.text.trim(),
        images: imageUrls,
        specifications: _specifications.isEmpty ? null : _specifications,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('제품이 등록되었습니다')),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('오류: $e')),
        );
      }
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('제품 등록'),
        actions: [
          TextButton(
            onPressed: _isSubmitting ? null : _submitProduct,
            child: Text(
              '완료',
              style: TextStyle(
                color: _isSubmitting ? Colors.grey : null,
              ),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Images Section
              Text(
                '사진 (최대 10장)',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 120,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    // Add Photo Button
                    InkWell(
                      onTap: () {
                        showModalBottomSheet(
                          context: context,
                          builder: (context) => SafeArea(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                ListTile(
                                  leading: const Icon(Icons.photo_library),
                                  title: const Text('갤러리에서 선택'),
                                  onTap: () {
                                    Navigator.pop(context);
                                    _pickImages();
                                  },
                                ),
                                ListTile(
                                  leading: const Icon(Icons.camera_alt),
                                  title: const Text('카메라로 촬영'),
                                  onTap: () {
                                    Navigator.pop(context);
                                    _takePhoto();
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.add_a_photo, size: 32),
                            const SizedBox(height: 4),
                            Text(
                              '${_selectedImages.length}/10',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Selected Images
                    ..._selectedImages.asMap().entries.map((entry) {
                      final index = entry.key;
                      final file = entry.value;
                      
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.file(
                                file,
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: GestureDetector(
                                onTap: () => _removeImage(index),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.5),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.close,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                ),
                              ),
                            ),
                            if (index == 0)
                              Positioned(
                                bottom: 4,
                                left: 4,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).primaryColor,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    '대표',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Category
              Text(
                '카테고리',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              categoriesAsync.when(
                loading: () => const CircularProgressIndicator(),
                error: (error, stack) => Text('오류: $error'),
                data: (categories) => DropdownButtonFormField<String>(
                  value: _selectedCategory,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: '카테고리 선택',
                  ),
                  items: categories.map((category) {
                    return DropdownMenuItem(
                      value: category.id,
                      child: Text(category.name),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedCategory = value;
                    });
                  },
                ),
              ),
              const SizedBox(height: 16),

              // Title
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: '제목',
                  border: OutlineInputBorder(),
                ),
                maxLength: 50,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return '제목을 입력해주세요';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Brand & Model
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _brandController,
                      decoration: const InputDecoration(
                        labelText: '브랜드 (선택)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _modelController,
                      decoration: const InputDecoration(
                        labelText: '모델명 (선택)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Condition
              Text(
                '제품 상태',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: 'new',
                    label: Text('새 제품'),
                  ),
                  ButtonSegment(
                    value: 'like_new',
                    label: Text('거의 새것'),
                  ),
                  ButtonSegment(
                    value: 'good',
                    label: Text('양호'),
                  ),
                  ButtonSegment(
                    value: 'fair',
                    label: Text('보통'),
                  ),
                ],
                selected: {_selectedCondition},
                onSelectionChanged: (Set<String> selected) {
                  setState(() {
                    _selectedCondition = selected.first;
                  });
                },
              ),
              const SizedBox(height: 24),

              // Description
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: '상품 설명',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                maxLines: 5,
                maxLength: 500,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return '상품 설명을 입력해주세요';
                  }
                  if (value.trim().length < 10) {
                    return '최소 10자 이상 입력해주세요';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Pricing
              Text(
                '가격 설정',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _dailyPriceController,
                decoration: const InputDecoration(
                  labelText: '일일 대여료',
                  border: OutlineInputBorder(),
                  suffixText: '원',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '일일 대여료를 입력해주세요';
                  }
                  if (int.tryParse(value) == null || int.parse(value) <= 0) {
                    return '올바른 금액을 입력해주세요';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _weeklyPriceController,
                      decoration: const InputDecoration(
                        labelText: '주간 대여료 (선택)',
                        border: OutlineInputBorder(),
                        suffixText: '원',
                      ),
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _monthlyPriceController,
                      decoration: const InputDecoration(
                        labelText: '월간 대여료 (선택)',
                        border: OutlineInputBorder(),
                        suffixText: '원',
                      ),
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _depositController,
                decoration: const InputDecoration(
                  labelText: '보증금',
                  border: OutlineInputBorder(),
                  suffixText: '원',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '보증금을 입력해주세요';
                  }
                  if (int.tryParse(value) == null || int.parse(value) <= 0) {
                    return '올바른 금액을 입력해주세요';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Location
              Text(
                '거래 위치',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _addressController,
                decoration: InputDecoration(
                  labelText: '주소',
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.location_on),
                    onPressed: () {
                      // TODO: Implement location search
                    },
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Specifications
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '상세 스펙 (선택)',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  TextButton.icon(
                    onPressed: _addSpecification,
                    icon: const Icon(Icons.add),
                    label: const Text('추가'),
                  ),
                ],
              ),
              if (_specifications.isNotEmpty) ...[
                const SizedBox(height: 8),
                ..._specifications.entries.map((entry) {
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      title: Text(entry.key),
                      subtitle: Text(entry.value),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete),
                        onPressed: () => _removeSpecification(entry.key),
                      ),
                    ),
                  );
                }).toList(),
              ],
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
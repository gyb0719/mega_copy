import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';

import '../../../data/models/product_model.dart';

class SearchScreen extends ConsumerStatefulWidget {
  final String? initialQuery;
  const SearchScreen({super.key, this.initialQuery});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  
  String _selectedCategory = '전체';
  String _selectedSort = '최신순';
  RangeValues _priceRange = const RangeValues(0, 500000);
  Set<String> _selectedConditions = {};
  
  final List<String> _categories = [
    '전체',
    '카메라',
    '렌즈',
    '노트북',
    '태블릿',
    '스마트폰',
    '게임기',
    '드론',
    '액션캠',
    '기타',
  ];
  
  final List<String> _sortOptions = [
    '최신순',
    '가격 낮은순',
    '가격 높은순',
    '인기순',
    '평점순',
  ];
  
  final List<String> _conditions = [
    'S급',
    'A급',
    'B급',
  ];

  // Recent searches
  final List<String> _recentSearches = [
    'Sony A7',
    'MacBook Pro',
    '아이패드',
    'PS5',
    '캐논 렌즈',
  ];

  // Popular searches
  final List<String> _popularSearches = [
    'GoPro',
    '닌텐도 스위치',
    'DJI 드론',
    '갤럭시탭',
    '에어팟',
    'Canon R5',
    'Sony FX3',
    'iPad Pro',
  ];

  // Demo search results
  List<ProductModel> _searchResults = [];
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialQuery != null) {
      _searchController.text = widget.initialQuery!;
      _performSearch();
    }
    _focusNode.requestFocus();
  }

  void _performSearch() {
    if (_searchController.text.isEmpty) return;
    
    setState(() {
      _isSearching = true;
    });

    // Simulate search delay
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        setState(() {
          _searchResults = _getDemoSearchResults();
          _isSearching = false;
        });
      }
    });
  }

  List<ProductModel> _getDemoSearchResults() {
    // TODO: Fix mock data structure
    return [];
    /*
    return [
      ProductModel(
        id: '1',
        title: 'Sony A7 III 미러리스 카메라',
        description: '풀프레임 센서, 4K 동영상, 5축 손떨림 보정',
        category: '카메라',
        brand: 'Sony',
        model: 'A7 III',
        condition: 'S급',
        images: [
          'https://via.placeholder.com/400x300',
          'https://via.placeholder.com/400x300',
        ],
        dailyPrice: 50000,
        weeklyPrice: 280000,
        monthlyPrice: 900000,
        depositAmount: 200000,
        ownerId: 'owner1',
        ownerName: '김민수',
        ownerAvatar: null,
        ownerRating: 4.8,
        location: '서울 강남구',
        latitude: 37.5172,
        longitude: 127.0473,
        specifications: {
          '센서': '35mm 풀프레임',
          '화소': '2420만 화소',
          '동영상': '4K 30fps',
          'ISO': '100-51200',
        },
        accessories: ['배터리 2개', '충전기', '스트랩'],
        rules: ['금연 환경에서만 사용', '우천시 사용 금지'],
        isAvailable: true,
        viewCount: 234,
        likeCount: 45,
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        updatedAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      ProductModel(
        id: '2',
        title: 'MacBook Pro 14" M3 Pro',
        description: '최신 M3 Pro 칩셋, 18GB RAM, 512GB SSD',
        category: '노트북',
        brand: 'Apple',
        model: 'MacBook Pro 14"',
        condition: 'A급',
        images: [
          'https://via.placeholder.com/400x300',
        ],
        dailyPrice: 70000,
        weeklyPrice: 400000,
        monthlyPrice: 1200000,
        depositAmount: 300000,
        ownerId: 'owner2',
        ownerName: '이지은',
        ownerAvatar: null,
        ownerRating: 4.9,
        location: '서울 서초구',
        latitude: 37.4837,
        longitude: 127.0324,
        specifications: {
          'CPU': 'M3 Pro',
          'RAM': '18GB',
          'SSD': '512GB',
          '디스플레이': '14.2" Liquid Retina XDR',
        },
        accessories: ['충전기', '케이스', 'USB-C 허브'],
        rules: ['개발 용도로만 사용 가능'],
        isAvailable: true,
        viewCount: 567,
        likeCount: 89,
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ];
    */
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
            height: MediaQuery.of(context).size.height * 0.8,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: Colors.grey.shade200),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        '필터',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),
                // Filter Options
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Category
                        const Text(
                          '카테고리',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _categories.map((category) {
                            final isSelected = _selectedCategory == category;
                            return ChoiceChip(
                              label: Text(category),
                              selected: isSelected,
                              onSelected: (selected) {
                                setModalState(() {
                                  _selectedCategory = category;
                                });
                              },
                              selectedColor: Theme.of(context).primaryColor,
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : Colors.black,
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 24),
                        
                        // Price Range
                        const Text(
                          '가격대 (일일 대여료)',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        RangeSlider(
                          values: _priceRange,
                          min: 0,
                          max: 500000,
                          divisions: 50,
                          labels: RangeLabels(
                            '₩${NumberFormat('#,###').format(_priceRange.start.round())}',
                            '₩${NumberFormat('#,###').format(_priceRange.end.round())}',
                          ),
                          onChanged: (values) {
                            setModalState(() {
                              _priceRange = values;
                            });
                          },
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '₩${NumberFormat('#,###').format(_priceRange.start.round())}',
                              style: TextStyle(color: Colors.grey.shade600),
                            ),
                            Text(
                              '₩${NumberFormat('#,###').format(_priceRange.end.round())}',
                              style: TextStyle(color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        
                        // Condition
                        const Text(
                          '제품 상태',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _conditions.map((condition) {
                            final isSelected = _selectedConditions.contains(condition);
                            return FilterChip(
                              label: Text(condition),
                              selected: isSelected,
                              onSelected: (selected) {
                                setModalState(() {
                                  if (selected) {
                                    _selectedConditions.add(condition);
                                  } else {
                                    _selectedConditions.remove(condition);
                                  }
                                });
                              },
                              selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
                              checkmarkColor: Theme.of(context).primaryColor,
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                ),
                // Apply Button
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(color: Colors.grey.shade200),
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            setModalState(() {
                              _selectedCategory = '전체';
                              _priceRange = const RangeValues(0, 500000);
                              _selectedConditions.clear();
                            });
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text('초기화'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pop(context);
                            setState(() {
                              // Apply filters
                              _performSearch();
                            });
                          },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text('적용하기'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 0,
        title: Container(
          height: 40,
          margin: const EdgeInsets.only(right: 16),
          child: TextField(
            controller: _searchController,
            focusNode: _focusNode,
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => _performSearch(),
            decoration: InputDecoration(
              hintText: '제품명, 브랜드 검색',
              hintStyle: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade500,
              ),
              filled: true,
              fillColor: Colors.grey.shade100,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              suffixIcon: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_searchController.text.isNotEmpty)
                    IconButton(
                      icon: const Icon(Icons.clear, size: 20),
                      onPressed: () {
                        setState(() {
                          _searchController.clear();
                          _searchResults.clear();
                        });
                      },
                    ),
                  IconButton(
                    icon: const Icon(Icons.search),
                    onPressed: _performSearch,
                  ),
                ],
              ),
            ),
            onChanged: (value) {
              setState(() {});
            },
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Bar
          if (_searchController.text.isNotEmpty || _searchResults.isNotEmpty)
            Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(
                  bottom: BorderSide(color: Colors.grey.shade200),
                ),
              ),
              child: Row(
                children: [
                  // Filter Button
                  OutlinedButton.icon(
                    onPressed: _showFilterBottomSheet,
                    icon: const Icon(Icons.filter_list, size: 18),
                    label: const Text('필터'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Sort Dropdown
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: DropdownButton<String>(
                      value: _selectedSort,
                      underline: const SizedBox(),
                      isDense: true,
                      icon: const Icon(Icons.arrow_drop_down, size: 20),
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.black,
                      ),
                      items: _sortOptions.map((option) {
                        return DropdownMenuItem(
                          value: option,
                          child: Text(option),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedSort = value!;
                          // Re-sort results
                        });
                      },
                    ),
                  ),
                  const Spacer(),
                  // Results Count
                  if (_searchResults.isNotEmpty)
                    Text(
                      '${_searchResults.length}개 결과',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                ],
              ),
            ),
          
          // Content
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_isSearching) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_searchController.text.isEmpty && _searchResults.isEmpty) {
      return _buildInitialView();
    }

    if (_searchResults.isEmpty) {
      return _buildNoResults();
    }

    return _buildSearchResults();
  }

  Widget _buildInitialView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Recent Searches
          if (_recentSearches.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '최근 검색',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _recentSearches.clear();
                    });
                  },
                  child: const Text(
                    '전체 삭제',
                    style: TextStyle(fontSize: 14),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _recentSearches.map((search) {
                return Chip(
                  label: Text(search),
                  avatar: const Icon(Icons.history, size: 16),
                  deleteIcon: const Icon(Icons.close, size: 16),
                  onDeleted: () {
                    setState(() {
                      _recentSearches.remove(search);
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 32),
          ],
          
          // Popular Searches
          const Text(
            '인기 검색어',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _popularSearches.asMap().entries.map((entry) {
              final index = entry.key;
              final search = entry.value;
              return ActionChip(
                label: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (index < 3)
                      Container(
                        width: 20,
                        height: 20,
                        margin: const EdgeInsets.only(right: 4),
                        decoration: BoxDecoration(
                          color: index == 0
                              ? Colors.red
                              : index == 1
                                  ? Colors.orange
                                  : Colors.yellow.shade700,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            '${index + 1}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    Text(search),
                  ],
                ),
                onPressed: () {
                  _searchController.text = search;
                  _performSearch();
                },
              );
            }).toList(),
          ),
          
          const SizedBox(height: 32),
          
          // Category Grid
          const Text(
            '카테고리',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              childAspectRatio: 1,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: _categories.length - 1, // Exclude '전체'
            itemBuilder: (context, index) {
              final category = _categories[index + 1];
              final icons = {
                '카메라': Icons.camera_alt,
                '렌즈': Icons.camera,
                '노트북': Icons.laptop_mac,
                '태블릿': Icons.tablet_mac,
                '스마트폰': Icons.smartphone,
                '게임기': Icons.sports_esports,
                '드론': Icons.flight,
                '액션캠': Icons.videocam,
                '기타': Icons.devices_other,
              };
              
              return InkWell(
                onTap: () {
                  setState(() {
                    _selectedCategory = category;
                    _searchController.text = category;
                    _performSearch();
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        icons[category],
                        size: 28,
                        color: Theme.of(context).primaryColor,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        category,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildNoResults() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 80,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            "'${_searchController.text}' 검색 결과가 없습니다",
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '다른 검색어를 입력해보세요',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _searchResults.length,
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final product = _searchResults[index];
        return InkWell(
          onTap: () {
            context.push('/product/${product.id}');
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                // Product Image
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: CachedNetworkImage(
                    imageUrl: product.images.first,
                    width: 100,
                    height: 100,
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
                const SizedBox(width: 12),
                // Product Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title
                      Text(
                        product.title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      // Location
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_outlined,
                            size: 14,
                            color: Colors.grey.shade600,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            product.location,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // Price
                      Text(
                        '${NumberFormat('#,###').format(product.dailyPrice)}원/일',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                      const SizedBox(height: 4),
                      // Stats
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green.shade50,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              product.condition,
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.green.shade700,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            Icons.star,
                            size: 14,
                            color: Colors.amber.shade600,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            product.ownerRating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            Icons.favorite,
                            size: 14,
                            color: Colors.red.shade400,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${product.likeCount}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
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
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }
}
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:intl/intl.dart';

import '../../../data/models/product_model.dart';
import '../../providers/product_provider.dart';
import '../../providers/auth_provider.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;

  const ProductDetailScreen({
    super.key,
    required this.productId,
  });

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  final PageController _pageController = PageController();
  DateTime? _startDate;
  DateTime? _endDate;
  bool _isFavorite = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  int _calculateDays() {
    if (_startDate != null && _endDate != null) {
      return _endDate!.difference(_startDate!).inDays + 1;
    }
    return 0;
  }

  double _calculateTotalPrice(ProductModel product) {
    final days = _calculateDays();
    if (days == 0) return 0;
    
    // 장기 할인 적용
    if (days >= 30 && product.monthlyPrice != null) {
      return product.monthlyPrice!;
    } else if (days >= 7 && product.weeklyPrice != null) {
      return product.weeklyPrice! * (days ~/ 7) + 
             product.dailyPrice * (days % 7);
    } else {
      return product.dailyPrice * days;
    }
  }

  Future<void> _toggleFavorite() async {
    try {
      final toggleFavorite = ref.read(toggleFavoriteProvider);
      await toggleFavorite(widget.productId);
      setState(() {
        _isFavorite = !_isFavorite;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('오류: $e')),
        );
      }
    }
  }

  Future<void> _selectDateRange(BuildContext context) async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : null,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: Theme.of(context).primaryColor,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.productId));
    final currentUser = ref.watch(currentUserProvider).value;

    return productAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (error, stack) => Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('오류: $error'),
              ElevatedButton(
                onPressed: () => context.pop(),
                child: const Text('돌아가기'),
              ),
            ],
          ),
        ),
      ),
      data: (product) {
        if (product == null) {
          return const Scaffold(
            body: Center(child: Text('제품을 찾을 수 없습니다')),
          );
        }

        final isOwner = currentUser?.id == product.ownerId;
        final totalPrice = _calculateTotalPrice(product);
        final days = _calculateDays();

        return Scaffold(
          body: Stack(
            children: [
              CustomScrollView(
                slivers: [
                  // Image Carousel
                  SliverToBoxAdapter(
                    child: Stack(
                      children: [
                        SizedBox(
                          height: 400,
                          child: product.images.isNotEmpty
                              ? PageView.builder(
                                  controller: _pageController,
                                  itemCount: product.images.length,
                                  itemBuilder: (context, index) {
                                    return CachedNetworkImage(
                                      imageUrl: product.images[index],
                                      fit: BoxFit.cover,
                                      placeholder: (context, url) => Container(
                                        color: Colors.grey.shade200,
                                        child: const Center(
                                          child: CircularProgressIndicator(),
                                        ),
                                      ),
                                      errorWidget: (context, url, error) =>
                                          Container(
                                        color: Colors.grey.shade200,
                                        child: const Icon(
                                          Icons.image_not_supported,
                                          size: 50,
                                        ),
                                      ),
                                    );
                                  },
                                )
                              : Container(
                                  color: Colors.grey.shade200,
                                  child: const Icon(
                                    Icons.image_not_supported,
                                    size: 50,
                                  ),
                                ),
                        ),
                        
                        // Top Buttons
                        Positioned(
                          top: MediaQuery.of(context).padding.top,
                          left: 0,
                          right: 0,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                IconButton(
                                  onPressed: () => context.pop(),
                                  icon: const Icon(Icons.arrow_back),
                                  style: IconButton.styleFrom(
                                    backgroundColor:
                                        Colors.white.withOpacity(0.9),
                                  ),
                                ),
                                Row(
                                  children: [
                                    if (!isOwner)
                                      IconButton(
                                        onPressed: _toggleFavorite,
                                        icon: Icon(
                                          _isFavorite
                                              ? Icons.favorite
                                              : Icons.favorite_border,
                                          color: _isFavorite
                                              ? Colors.red
                                              : Colors.black,
                                        ),
                                        style: IconButton.styleFrom(
                                          backgroundColor:
                                              Colors.white.withOpacity(0.9),
                                        ),
                                      ),
                                    const SizedBox(width: 8),
                                    IconButton(
                                      onPressed: () {
                                        // TODO: Share functionality
                                      },
                                      icon: const Icon(Icons.share),
                                      style: IconButton.styleFrom(
                                        backgroundColor:
                                            Colors.white.withOpacity(0.9),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        
                        // Page Indicator
                        if (product.images.length > 1)
                          Positioned(
                            bottom: 16,
                            left: 0,
                            right: 0,
                            child: Center(
                              child: SmoothPageIndicator(
                                controller: _pageController,
                                count: product.images.length,
                                effect: const WormEffect(
                                  dotHeight: 8,
                                  dotWidth: 8,
                                  activeDotColor: Colors.white,
                                  dotColor: Colors.white54,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  // Product Info
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Category & Condition
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: Theme.of(context)
                                      .primaryColor
                                      .withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  product.categoryName ?? '기타',
                                  style: TextStyle(
                                    color: Theme.of(context).primaryColor,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade200,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  _getConditionText(product.condition),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Title
                          Text(
                            product.title,
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          const SizedBox(height: 8),

                          // Brand & Model
                          if (product.brand != null || product.model != null)
                            Text(
                              '${product.brand ?? ''} ${product.model ?? ''}'
                                  .trim(),
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 14,
                              ),
                            ),
                          const SizedBox(height: 16),

                          // Price
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                '${NumberFormat('#,###').format(product.dailyPrice.toInt())}원',
                                style: Theme.of(context)
                                    .textTheme
                                    .headlineSmall
                                    ?.copyWith(
                                      color: Theme.of(context).primaryColor,
                                      fontWeight: FontWeight.w700,
                                    ),
                              ),
                              const Text(
                                ' / 일',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),

                          // Weekly & Monthly Price
                          if (product.weeklyPrice != null ||
                              product.monthlyPrice != null) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                if (product.weeklyPrice != null) ...[
                                  Text(
                                    '주 ${NumberFormat('#,###').format(product.weeklyPrice!.toInt())}원',
                                    style: TextStyle(
                                      color: Colors.grey.shade700,
                                    ),
                                  ),
                                  if (product.monthlyPrice != null)
                                    const Text(' · '),
                                ],
                                if (product.monthlyPrice != null)
                                  Text(
                                    '월 ${NumberFormat('#,###').format(product.monthlyPrice!.toInt())}원',
                                    style: TextStyle(
                                      color: Colors.grey.shade700,
                                    ),
                                  ),
                              ],
                            ),
                          ],

                          const SizedBox(height: 16),
                          const Divider(),
                          const SizedBox(height: 16),

                          // Owner Info
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: CircleAvatar(
                              radius: 24,
                              backgroundImage: product.ownerAvatarUrl != null
                                  ? CachedNetworkImageProvider(
                                      product.ownerAvatarUrl!)
                                  : null,
                              child: product.ownerAvatarUrl == null
                                  ? Text(
                                      product.ownerName
                                              ?.substring(0, 1)
                                              .toUpperCase() ??
                                          'U',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    )
                                  : null,
                            ),
                            title: Text(
                              product.ownerName ?? 'Unknown',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            subtitle: Row(
                              children: [
                                const Icon(
                                  Icons.star,
                                  size: 16,
                                  color: Colors.amber,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${product.ownerTrustScore?.toStringAsFixed(1) ?? '0.0'}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '거래 ${product.ownerRentalCount ?? 0}회',
                                  style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                            trailing: isOwner
                                ? null
                                : OutlinedButton(
                                    onPressed: () {
                                      // TODO: Navigate to chat
                                    },
                                    child: const Text('채팅하기'),
                                  ),
                          ),

                          const SizedBox(height: 16),
                          const Divider(),
                          const SizedBox(height: 16),

                          // Description
                          Text(
                            '상품 설명',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            product.description,
                            style: const TextStyle(
                              fontSize: 15,
                              height: 1.5,
                            ),
                          ),

                          // Specifications
                          if (product.specifications.isNotEmpty) ...[
                            const SizedBox(height: 24),
                            Text(
                              '상세 스펙',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 12),
                            ...product.specifications.entries.map((entry) {
                              return Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8,
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    SizedBox(
                                      width: 120,
                                      child: Text(
                                        entry.key,
                                        style: TextStyle(
                                          color: Colors.grey.shade700,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Text(
                                        entry.value.toString(),
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ],

                          // Location
                          const SizedBox(height: 24),
                          Text(
                            '거래 위치',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.location_on,
                                  color: Theme.of(context).primaryColor,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    product.address ?? '위치 정보 없음',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Deposit
                          const SizedBox(height: 24),
                          Text(
                            '보증금',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            '${NumberFormat('#,###').format(product.depositAmount.toInt())}원',
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '제품 파손 시 보증금에서 차감될 수 있습니다',
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 13,
                            ),
                          ),

                          const SizedBox(height: 100),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              // Bottom Action Bar
              if (!isOwner)
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: EdgeInsets.only(
                      left: 16,
                      right: 16,
                      top: 16,
                      bottom: MediaQuery.of(context).padding.bottom + 16,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, -5),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Date Selection
                        InkWell(
                          onTap: () => _selectDateRange(context),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey.shade300),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.calendar_today,
                                  color: Theme.of(context).primaryColor,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    _startDate != null && _endDate != null
                                        ? '${DateFormat('MM/dd').format(_startDate!)} - ${DateFormat('MM/dd').format(_endDate!)} (${_calculateDays()}일)'
                                        : '대여 기간을 선택하세요',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      color: _startDate != null
                                          ? Colors.black
                                          : Colors.grey,
                                    ),
                                  ),
                                ),
                                const Icon(
                                  Icons.keyboard_arrow_down,
                                  color: Colors.grey,
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Price & Action Button
                        Row(
                          children: [
                            // Total Price
                            if (days > 0) ...[
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    '총 대여료',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey,
                                    ),
                                  ),
                                  Text(
                                    '${NumberFormat('#,###').format(totalPrice.toInt())}원',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 16),
                            ],

                            // Rental Button
                            Expanded(
                              child: ElevatedButton(
                                onPressed: days > 0
                                    ? () {
                                        // TODO: Navigate to rental request
                                      }
                                    : null,
                                style: ElevatedButton.styleFrom(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: Text(
                                  days > 0 ? '대여 신청하기' : '기간을 선택하세요',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  String _getConditionText(String condition) {
    switch (condition) {
      case 'new':
        return '새 제품';
      case 'like_new':
        return '거의 새것';
      case 'good':
        return '양호';
      case 'fair':
        return '보통';
      default:
        return condition;
    }
  }
}
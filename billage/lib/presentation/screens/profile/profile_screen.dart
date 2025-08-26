import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  // Demo user data
  final Map<String, dynamic> _userData = {
    'name': '김준호',
    'email': 'junho.kim@example.com',
    'phone': '010-1234-5678',
    'avatar': null,
    'rating': 4.8,
    'reviewCount': 23,
    'rentCount': 15,
    'lendCount': 8,
    'joinDate': DateTime(2024, 1, 15),
    'isVerified': true,
    'trustScore': 95,
  };

  // Demo stats
  final Map<String, int> _stats = {
    'totalTransactions': 23,
    'activeRentals': 2,
    'savedItems': 12,
    'reviews': 23,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: CustomScrollView(
        slivers: [
          // App Bar with Profile Header
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: Theme.of(context).primaryColor,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Theme.of(context).primaryColor,
                      Theme.of(context).primaryColor.withOpacity(0.8),
                    ],
                  ),
                ),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Profile Avatar
                      Stack(
                        children: [
                          CircleAvatar(
                            radius: 50,
                            backgroundColor: Colors.white,
                            backgroundImage: _userData['avatar'] != null
                                ? CachedNetworkImageProvider(_userData['avatar'])
                                : null,
                            child: _userData['avatar'] == null
                                ? Text(
                                    _userData['name'].substring(0, 1),
                                    style: TextStyle(
                                      fontSize: 36,
                                      fontWeight: FontWeight.bold,
                                      color: Theme.of(context).primaryColor,
                                    ),
                                  )
                                : null,
                          ),
                          if (_userData['isVerified'])
                            Positioned(
                              right: 0,
                              bottom: 0,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.verified,
                                  color: Colors.blue.shade600,
                                  size: 24,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // User Name
                      Text(
                        _userData['name'],
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      // Rating and Trust Score
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.star,
                            size: 16,
                            color: Colors.yellow.shade600,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${_userData['rating']} (${_userData['reviewCount']})',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '신뢰도 ${_userData['trustScore']}%',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.white,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.settings, color: Colors.white),
                onPressed: () {
                  context.push('/settings');
                },
              ),
            ],
          ),

          // Stats Section
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
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
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem(
                    icon: Icons.handshake_outlined,
                    label: '총 거래',
                    value: _stats['totalTransactions'].toString(),
                  ),
                  _buildStatItem(
                    icon: Icons.inventory_2_outlined,
                    label: '대여 중',
                    value: _stats['activeRentals'].toString(),
                    color: Colors.green,
                  ),
                  _buildStatItem(
                    icon: Icons.bookmark_outline,
                    label: '찜',
                    value: _stats['savedItems'].toString(),
                    color: Colors.red,
                  ),
                  _buildStatItem(
                    icon: Icons.rate_review_outlined,
                    label: '후기',
                    value: _stats['reviews'].toString(),
                    color: Colors.blue,
                  ),
                ],
              ),
            ),
          ),

          // Menu Items
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // My Activity Section
                  const Padding(
                    padding: EdgeInsets.only(left: 4, bottom: 8),
                    child: Text(
                      '나의 활동',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        _buildMenuItem(
                          icon: Icons.shopping_bag_outlined,
                          title: '대여 내역',
                          subtitle: '내가 빌린 제품들',
                          onTap: () {
                            context.push('/my-rentals');
                          },
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.inventory_outlined,
                          title: '등록한 제품',
                          subtitle: '내가 등록한 제품들',
                          onTap: () {
                            context.push('/my-products');
                          },
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.favorite_outline,
                          title: '찜 목록',
                          subtitle: '관심있는 제품들',
                          onTap: () {
                            context.push('/saved-items');
                          },
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.star_outline,
                          title: '받은 후기',
                          subtitle: '${_userData['reviewCount']}개의 후기',
                          onTap: () {
                            context.push('/reviews');
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Account Section
                  const Padding(
                    padding: EdgeInsets.only(left: 4, bottom: 8),
                    child: Text(
                      '계정 관리',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        _buildMenuItem(
                          icon: Icons.person_outline,
                          title: '프로필 수정',
                          subtitle: '이름, 사진 변경',
                          onTap: () {
                            context.push('/edit-profile');
                          },
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.verified_user_outlined,
                          title: '본인 인증',
                          subtitle: _userData['isVerified'] ? '인증 완료' : '인증 필요',
                          trailing: _userData['isVerified']
                              ? Icon(
                                  Icons.check_circle,
                                  color: Colors.green.shade600,
                                  size: 20,
                                )
                              : null,
                          onTap: () {
                            if (!_userData['isVerified']) {
                              context.push('/verification');
                            }
                          },
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.payment_outlined,
                          title: '결제 수단',
                          subtitle: '카드, 계좌 관리',
                          onTap: () {
                            context.push('/payment-methods');
                          },
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.location_on_outlined,
                          title: '주소 관리',
                          subtitle: '대여 위치 설정',
                          onTap: () {
                            context.push('/addresses');
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Support Section
                  const Padding(
                    padding: EdgeInsets.only(left: 4, bottom: 8),
                    child: Text(
                      '지원',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        _buildMenuItem(
                          icon: Icons.notifications_outlined,
                          title: '알림 설정',
                          subtitle: '푸시 알림 관리',
                          onTap: () {
                            context.push('/notification-settings');
                          },
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.help_outline,
                          title: '고객센터',
                          subtitle: '도움말 및 문의',
                          onTap: () {
                            context.push('/support');
                          },
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.description_outlined,
                          title: '이용약관',
                          subtitle: '서비스 이용약관',
                          onTap: () {
                            context.push('/terms');
                          },
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.privacy_tip_outlined,
                          title: '개인정보처리방침',
                          subtitle: '개인정보 보호 정책',
                          onTap: () {
                            context.push('/privacy');
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Logout Button
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TextButton(
                      onPressed: () {
                        _showLogoutDialog(context);
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        '로그아웃',
                        style: TextStyle(
                          color: Colors.red.shade600,
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // App Version
                  Center(
                    child: Column(
                      children: [
                        Text(
                          'Billage',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey.shade600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Version 1.0.0',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
    Color? color,
  }) {
    return Column(
      children: [
        Icon(
          icon,
          size: 24,
          color: color ?? Colors.grey.shade700,
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade900,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Widget? trailing,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                size: 20,
                color: Theme.of(context).primaryColor,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            trailing ??
                Icon(
                  Icons.chevron_right,
                  size: 20,
                  color: Colors.grey.shade400,
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Divider(
      height: 1,
      thickness: 1,
      indent: 72,
      color: Colors.grey.shade200,
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text('로그아웃'),
        content: const Text('정말 로그아웃 하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Perform logout
              context.go('/login');
            },
            child: Text(
              '로그아웃',
              style: TextStyle(
                color: Colors.red.shade600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
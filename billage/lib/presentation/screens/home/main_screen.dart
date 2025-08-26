import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Bottom Navigation Index Provider
final bottomNavIndexProvider = StateProvider<int>((ref) => 0);

class MainScreen extends ConsumerWidget {
  final Widget child;

  const MainScreen({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(bottomNavIndexProvider);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: currentIndex,
          onDestinationSelected: (index) {
            ref.read(bottomNavIndexProvider.notifier).state = index;
            
            switch (index) {
              case 0:
                context.go('/');
                break;
              case 1:
                context.go('/search');
                break;
              case 2:
                context.go('/create');
                break;
              case 3:
                context.go('/chat');
                break;
              case 4:
                context.go('/profile');
                break;
            }
          },
          height: 64,
          elevation: 0,
          backgroundColor: Colors.white,
          indicatorColor: Theme.of(context).primaryColor.withOpacity(0.1),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: [
            NavigationDestination(
              icon: Icon(
                Icons.home_outlined,
                color: currentIndex == 0
                    ? Theme.of(context).primaryColor
                    : Colors.grey,
              ),
              selectedIcon: Icon(
                Icons.home,
                color: Theme.of(context).primaryColor,
              ),
              label: '홈',
            ),
            NavigationDestination(
              icon: Icon(
                Icons.search_outlined,
                color: currentIndex == 1
                    ? Theme.of(context).primaryColor
                    : Colors.grey,
              ),
              selectedIcon: Icon(
                Icons.search,
                color: Theme.of(context).primaryColor,
              ),
              label: '검색',
            ),
            NavigationDestination(
              icon: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.add,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              label: '등록',
            ),
            NavigationDestination(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    Icons.chat_bubble_outline,
                    color: currentIndex == 3
                        ? Theme.of(context).primaryColor
                        : Colors.grey,
                  ),
                  // Unread Badge
                  Positioned(
                    top: -4,
                    right: -4,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
              selectedIcon: Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    Icons.chat_bubble,
                    color: Theme.of(context).primaryColor,
                  ),
                  Positioned(
                    top: -4,
                    right: -4,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
              label: '채팅',
            ),
            NavigationDestination(
              icon: Icon(
                Icons.person_outline,
                color: currentIndex == 4
                    ? Theme.of(context).primaryColor
                    : Colors.grey,
              ),
              selectedIcon: Icon(
                Icons.person,
                color: Theme.of(context).primaryColor,
              ),
              label: '프로필',
            ),
          ],
        ),
      ),
    );
  }
}
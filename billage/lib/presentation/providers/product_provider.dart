import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/product_repository.dart';
import '../../data/models/product_model.dart';
import '../../data/models/user_model.dart';
import 'auth_provider.dart';

// Product Repository Provider
final productRepositoryProvider = Provider<ProductRepository>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return ProductRepository(supabase: supabase);
});

// Categories Provider
final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getCategories();
});

// Products List Provider
final productsProvider = StateNotifierProvider<ProductsNotifier, AsyncValue<List<ProductModel>>>((ref) {
  final repository = ref.watch(productRepositoryProvider);
  return ProductsNotifier(repository);
});

class ProductsNotifier extends StateNotifier<AsyncValue<List<ProductModel>>> {
  final ProductRepository _repository;
  
  ProductsNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadProducts();
  }
  
  // 필터 옵션
  String? _categoryId;
  String? _searchQuery;
  double? _maxPrice;
  double? _latitude;
  double? _longitude;
  double? _radius;
  
  Future<void> loadProducts({
    bool refresh = false,
  }) async {
    try {
      if (refresh) {
        state = const AsyncValue.loading();
      }
      
      final products = await _repository.getProducts(
        categoryId: _categoryId,
        searchQuery: _searchQuery,
        maxPrice: _maxPrice,
        latitude: _latitude,
        longitude: _longitude,
        radius: _radius,
      );
      
      state = AsyncValue.data(products);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
  
  Future<void> loadMore() async {
    final currentProducts = state.value ?? [];
    if (currentProducts.isEmpty) return;
    
    try {
      final moreProducts = await _repository.getProducts(
        offset: currentProducts.length,
        categoryId: _categoryId,
        searchQuery: _searchQuery,
        maxPrice: _maxPrice,
        latitude: _latitude,
        longitude: _longitude,
        radius: _radius,
      );
      
      state = AsyncValue.data([...currentProducts, ...moreProducts]);
    } catch (e, stack) {
      // 더 불러오기 실패는 무시
    }
  }
  
  void setCategory(String? categoryId) {
    _categoryId = categoryId;
    loadProducts(refresh: true);
  }
  
  void setSearchQuery(String? query) {
    _searchQuery = query;
    loadProducts(refresh: true);
  }
  
  void setMaxPrice(double? price) {
    _maxPrice = price;
    loadProducts(refresh: true);
  }
  
  void setLocation(double? lat, double? lng, double? radius) {
    _latitude = lat;
    _longitude = lng;
    _radius = radius;
    loadProducts(refresh: true);
  }
  
  void clearFilters() {
    _categoryId = null;
    _searchQuery = null;
    _maxPrice = null;
    _latitude = null;
    _longitude = null;
    _radius = null;
    loadProducts(refresh: true);
  }
}

// Product Detail Provider
final productDetailProvider = FutureProvider.family<ProductModel?, String>((ref, productId) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getProduct(productId);
});

// My Products Provider
final myProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final currentUser = ref.watch(currentUserProvider).value;
  if (currentUser == null) return [];
  
  final repository = ref.watch(productRepositoryProvider);
  return repository.getMyProducts(currentUser.id);
});

// Favorite Products Provider
final favoriteProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final currentUser = ref.watch(currentUserProvider).value;
  if (currentUser == null) return [];
  
  final repository = ref.watch(productRepositoryProvider);
  return repository.getFavoriteProducts(currentUser.id);
});

// Product Creation/Update Provider
final productFormProvider = StateNotifierProvider<ProductFormNotifier, AsyncValue<ProductModel?>>((ref) {
  final repository = ref.watch(productRepositoryProvider);
  final currentUser = ref.watch(currentUserProvider).value;
  return ProductFormNotifier(repository, currentUser);
});

class ProductFormNotifier extends StateNotifier<AsyncValue<ProductModel?>> {
  final ProductRepository _repository;
  final UserModel? _currentUser;
  
  ProductFormNotifier(this._repository, this._currentUser) : super(const AsyncValue.data(null));
  
  Future<void> createProduct({
    required String categoryId,
    required String title,
    required String description,
    required String condition,
    required double dailyPrice,
    required double depositAmount,
    String? brand,
    String? model,
    double? weeklyPrice,
    double? monthlyPrice,
    String? address,
    double? latitude,
    double? longitude,
    List<String>? images,
    Map<String, dynamic>? specifications,
  }) async {
    if (_currentUser == null) {
      state = AsyncValue.error(Exception('로그인이 필요합니다'), StackTrace.current);
      return;
    }
    
    try {
      state = const AsyncValue.loading();
      final product = await _repository.createProduct(
        ownerId: _currentUser.id,
        categoryId: categoryId,
        title: title,
        description: description,
        condition: condition,
        dailyPrice: dailyPrice,
        depositAmount: depositAmount,
        brand: brand,
        model: model,
        weeklyPrice: weeklyPrice,
        monthlyPrice: monthlyPrice,
        address: address,
        latitude: latitude,
        longitude: longitude,
        images: images,
        specifications: specifications,
      );
      state = AsyncValue.data(product);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
  
  Future<void> updateProduct({
    required String productId,
    String? title,
    String? description,
    String? condition,
    String? status,
    double? dailyPrice,
    double? weeklyPrice,
    double? monthlyPrice,
    double? depositAmount,
    List<String>? images,
    Map<String, dynamic>? specifications,
  }) async {
    try {
      state = const AsyncValue.loading();
      final product = await _repository.updateProduct(
        productId: productId,
        title: title,
        description: description,
        condition: condition,
        status: status,
        dailyPrice: dailyPrice,
        weeklyPrice: weeklyPrice,
        monthlyPrice: monthlyPrice,
        depositAmount: depositAmount,
        images: images,
        specifications: specifications,
      );
      state = AsyncValue.data(product);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
  
  Future<void> deleteProduct(String productId) async {
    try {
      state = const AsyncValue.loading();
      await _repository.deleteProduct(productId);
      state = const AsyncValue.data(null);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
}

// Favorite Toggle Provider
final toggleFavoriteProvider = Provider((ref) {
  return (String productId) async {
    final currentUser = ref.read(currentUserProvider).value;
    if (currentUser == null) throw Exception('로그인이 필요합니다');
    
    final repository = ref.read(productRepositoryProvider);
    await repository.toggleFavorite(
      userId: currentUser.id,
      productId: productId,
    );
    
    // 즐겨찾기 목록 새로고침
    ref.invalidate(favoriteProductsProvider);
  };
});
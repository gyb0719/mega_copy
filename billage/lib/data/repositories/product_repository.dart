import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/product_model.dart';
import '../models/user_model.dart';

class ProductRepository {
  final SupabaseClient _supabase;
  
  ProductRepository({required SupabaseClient supabase}) : _supabase = supabase;
  
  // 제품 목록 가져오기
  Future<List<ProductModel>> getProducts({
    int limit = 20,
    int offset = 0,
    String? categoryId,
    String? searchQuery,
    String? status = 'available',
    double? maxPrice,
    double? latitude,
    double? longitude,
    double? radius,
  }) async {
    try {
      var query = _supabase
          .from('products')
          .select('''
            *,
            owner:profiles(*),
            category:categories(*)
          ''')
          .neq('status', 'deleted');
      
      if (status != null) {
        query = query.eq('status', status);
      }
      
      if (categoryId != null) {
        query = query.eq('category_id', categoryId);
      }
      
      if (searchQuery != null && searchQuery.isNotEmpty) {
        query = query.or('title.ilike.%$searchQuery%,description.ilike.%$searchQuery%');
      }
      
      if (maxPrice != null) {
        query = query.lte('daily_price', maxPrice);
      }
      
      // 위치 기반 필터링 (PostGIS 사용)
      if (latitude != null && longitude != null && radius != null) {
        // ST_DWithin 함수를 사용한 거리 기반 필터링
        query = query.rpc('nearby_products', params: {
          'lat': latitude,
          'lng': longitude,
          'radius_km': radius,
        });
      }
      
      query = query
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);
      
      final response = await query;
      
      return (response as List)
          .map((json) => ProductModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('제품 목록 조회 실패: $e');
    }
  }
  
  // 제품 상세 정보 가져오기
  Future<ProductModel?> getProduct(String productId) async {
    try {
      final response = await _supabase
          .from('products')
          .select('''
            *,
            owner:profiles(*),
            category:categories(*)
          ''')
          .eq('id', productId)
          .single();
      
      // 조회수 증가
      await _incrementViewCount(productId);
      
      return ProductModel.fromJson(response);
    } catch (e) {
      return null;
    }
  }
  
  // 제품 생성
  Future<ProductModel> createProduct({
    required String ownerId,
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
    try {
      final now = DateTime.now();
      final productData = {
        'owner_id': ownerId,
        'category_id': categoryId,
        'title': title,
        'description': description,
        'condition': condition,
        'daily_price': dailyPrice,
        'deposit_amount': depositAmount,
        'brand': brand,
        'model': model,
        'weekly_price': weeklyPrice,
        'monthly_price': monthlyPrice,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'images': images ?? [],
        'specifications': specifications ?? {},
        'created_at': now.toIso8601String(),
        'updated_at': now.toIso8601String(),
      };
      
      final response = await _supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
      
      return ProductModel.fromJson(response);
    } catch (e) {
      throw Exception('제품 생성 실패: $e');
    }
  }
  
  // 제품 업데이트
  Future<ProductModel> updateProduct({
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
      final updates = <String, dynamic>{
        'updated_at': DateTime.now().toIso8601String(),
      };
      
      if (title != null) updates['title'] = title;
      if (description != null) updates['description'] = description;
      if (condition != null) updates['condition'] = condition;
      if (status != null) updates['status'] = status;
      if (dailyPrice != null) updates['daily_price'] = dailyPrice;
      if (weeklyPrice != null) updates['weekly_price'] = weeklyPrice;
      if (monthlyPrice != null) updates['monthly_price'] = monthlyPrice;
      if (depositAmount != null) updates['deposit_amount'] = depositAmount;
      if (images != null) updates['images'] = images;
      if (specifications != null) updates['specifications'] = specifications;
      
      final response = await _supabase
          .from('products')
          .update(updates)
          .eq('id', productId)
          .select()
          .single();
      
      return ProductModel.fromJson(response);
    } catch (e) {
      throw Exception('제품 업데이트 실패: $e');
    }
  }
  
  // 제품 삭제 (소프트 삭제)
  Future<void> deleteProduct(String productId) async {
    try {
      await _supabase
          .from('products')
          .update({
            'status': 'deleted',
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', productId);
    } catch (e) {
      throw Exception('제품 삭제 실패: $e');
    }
  }
  
  // 내 제품 목록 가져오기
  Future<List<ProductModel>> getMyProducts(String userId) async {
    try {
      final response = await _supabase
          .from('products')
          .select('''
            *,
            category:categories(*)
          ''')
          .eq('owner_id', userId)
          .neq('status', 'deleted')
          .order('created_at', ascending: false);
      
      return (response as List)
          .map((json) => ProductModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('내 제품 조회 실패: $e');
    }
  }
  
  // 즐겨찾기 추가/제거
  Future<void> toggleFavorite({
    required String userId,
    required String productId,
  }) async {
    try {
      // 기존 즐겨찾기 확인
      final existing = await _supabase
          .from('favorites')
          .select()
          .eq('user_id', userId)
          .eq('product_id', productId);
      
      if (existing.isEmpty) {
        // 즐겨찾기 추가
        await _supabase
            .from('favorites')
            .insert({
              'user_id': userId,
              'product_id': productId,
            });
        
        // 즐겨찾기 카운트 증가
        await _supabase.rpc('increment_favorite_count', params: {
          'product_id': productId,
        });
      } else {
        // 즐겨찾기 제거
        await _supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
        
        // 즐겨찾기 카운트 감소
        await _supabase.rpc('decrement_favorite_count', params: {
          'product_id': productId,
        });
      }
    } catch (e) {
      throw Exception('즐겨찾기 토글 실패: $e');
    }
  }
  
  // 즐겨찾기 제품 목록 가져오기
  Future<List<ProductModel>> getFavoriteProducts(String userId) async {
    try {
      final response = await _supabase
          .from('favorites')
          .select('''
            product:products(
              *,
              owner:profiles(*),
              category:categories(*)
            )
          ''')
          .eq('user_id', userId)
          .order('created_at', ascending: false);
      
      return (response as List)
          .map((json) => ProductModel.fromJson(json['product']))
          .toList();
    } catch (e) {
      throw Exception('즐겨찾기 제품 조회 실패: $e');
    }
  }
  
  // 조회수 증가
  Future<void> _incrementViewCount(String productId) async {
    try {
      await _supabase.rpc('increment_view_count', params: {
        'product_id': productId,
      });
    } catch (e) {
      // 조회수 증가 실패는 무시
    }
  }
  
  // 카테고리 목록 가져오기
  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await _supabase
          .from('categories')
          .select()
          .eq('is_active', true)
          .order('sort_order');
      
      return (response as List)
          .map((json) => CategoryModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('카테고리 조회 실패: $e');
    }
  }
}
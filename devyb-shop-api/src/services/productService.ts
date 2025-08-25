import Product, { IProduct } from '../models/Product';
import { FilterQuery, SortOrder } from 'mongoose';

export interface ProductSearchFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  status?: 'active' | 'inactive' | 'discontinued';
  rating?: number;
  tags?: string[];
  features?: string[];
}

export interface ProductSortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface ProductSearchResult {
  products: IProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: Array<{ name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    avgRating: number;
  };
}

class ProductService {
  private static instance: ProductService;

  private constructor() {}

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  /**
   * 상품 검색 및 필터링
   */
  async searchProducts(
    filters: ProductSearchFilters = {},
    sort: ProductSortOptions = { field: 'createdAt', order: 'desc' },
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<ProductSearchResult> {
    try {
      // 기본 쿼리 구성
      const query: FilterQuery<IProduct> = this.buildSearchQuery(filters);

      // 정렬 옵션 구성
      const sortOption: Record<string, SortOrder> = {
        [sort.field]: sort.order === 'asc' ? 1 : -1
      };

      // 보조 정렬 기준 추가
      if (sort.field !== 'createdAt') {
        sortOption.createdAt = -1;
      }

      // 페이지네이션 계산
      const skip = (pagination.page - 1) * pagination.limit;

      // 상품 조회와 총 개수 조회를 동시 실행
      const [products, totalProducts, filterStats] = await Promise.all([
        Product.find(query)
          .sort(sortOption)
          .skip(skip)
          .limit(pagination.limit)
          .populate('reviews', 'rating')
          .lean(),
        Product.countDocuments(query),
        this.getFilterStatistics(filters)
      ]);

      // 페이지네이션 정보 계산
      const totalPages = Math.ceil(totalProducts / pagination.limit);
      const hasNext = pagination.page < totalPages;
      const hasPrev = pagination.page > 1;

      return {
        products: products as IProduct[],
        pagination: {
          currentPage: pagination.page,
          totalPages,
          totalProducts,
          hasNext,
          hasPrev
        },
        filters: filterStats
      };
    } catch (error) {
      console.error('상품 검색 오류:', error);
      throw new Error('상품 검색 중 오류가 발생했습니다.');
    }
  }

  /**
   * 검색 쿼리 구성
   */
  private buildSearchQuery(filters: ProductSearchFilters): FilterQuery<IProduct> {
    const query: FilterQuery<IProduct> = {};

    // 기본적으로 활성 상품만 조회
    query.status = filters.status || 'active';

    // 텍스트 검색
    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { brand: searchRegex }
      ];
    }

    // 카테고리 필터
    if (filters.category) {
      query.category = filters.category;
    }

    // 서브카테고리 필터
    if (filters.subcategory) {
      query.subcategory = filters.subcategory;
    }

    // 브랜드 필터
    if (filters.brand) {
      query.brand = new RegExp(filters.brand.trim(), 'i');
    }

    // 가격 범위 필터
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.$or = [
        {
          // 할인 가격이 있는 경우 할인 가격으로 필터링
          $and: [
            { discountPrice: { $exists: true, $gt: 0 } },
            ...(filters.minPrice !== undefined ? [{ discountPrice: { $gte: filters.minPrice } }] : []),
            ...(filters.maxPrice !== undefined ? [{ discountPrice: { $lte: filters.maxPrice } }] : [])
          ]
        },
        {
          // 할인 가격이 없는 경우 원가로 필터링
          $and: [
            { $or: [{ discountPrice: { $exists: false } }, { discountPrice: { $lte: 0 } }] },
            ...(filters.minPrice !== undefined ? [{ price: { $gte: filters.minPrice } }] : []),
            ...(filters.maxPrice !== undefined ? [{ price: { $lte: filters.maxPrice } }] : [])
          ]
        }
      ];
    }

    // 재고 필터
    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        query.stock = { $gt: 0 };
      } else {
        query.stock = { $lte: 0 };
      }
    }

    // 평점 필터
    if (filters.rating !== undefined) {
      query.ratings = { $gte: filters.rating };
    }

    // 태그 필터
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // 특징 필터
    if (filters.features && filters.features.length > 0) {
      query.features = { $in: filters.features };
    }

    return query;
  }

  /**
   * 필터 통계 정보 생성
   */
  private async getFilterStatistics(currentFilters: ProductSearchFilters) {
    try {
      // 현재 필터를 제외한 기본 쿼리
      const baseQuery: FilterQuery<IProduct> = { status: 'active' };
      
      if (currentFilters.search) {
        const searchRegex = new RegExp(currentFilters.search.trim(), 'i');
        baseQuery.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
          { brand: searchRegex }
        ];
      }

      const [categories, brands, priceStats, avgRating] = await Promise.all([
        // 카테고리별 상품 수
        Product.aggregate([
          { $match: baseQuery },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),

        // 브랜드별 상품 수
        Product.aggregate([
          { $match: { ...baseQuery, brand: { $ne: null, $ne: '' } } },
          { $group: { _id: '$brand', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),

        // 가격 범위 통계
        Product.aggregate([
          { $match: baseQuery },
          {
            $addFields: {
              finalPrice: {
                $cond: {
                  if: { $and: [{ $gt: ['$discountPrice', 0] }, { $ne: ['$discountPrice', null] }] },
                  then: '$discountPrice',
                  else: '$price'
                }
              }
            }
          },
          {
            $bucket: {
              groupBy: '$finalPrice',
              boundaries: [0, 10000, 50000, 100000, 500000, 1000000, 10000000],
              default: '기타',
              output: {
                count: { $sum: 1 },
                avgPrice: { $avg: '$finalPrice' }
              }
            }
          }
        ]),

        // 평균 평점
        Product.aggregate([
          { $match: baseQuery },
          { $group: { _id: null, avgRating: { $avg: '$ratings' } } }
        ])
      ]);

      return {
        categories: categories.map(cat => ({
          name: cat._id,
          count: cat.count
        })),
        brands: brands.map(brand => ({
          name: brand._id,
          count: brand.count
        })),
        priceRanges: priceStats.map((range, index) => {
          const boundaries = [0, 10000, 50000, 100000, 500000, 1000000, 10000000];
          return {
            min: boundaries[index] || 0,
            max: boundaries[index + 1] || 10000000,
            count: range.count
          };
        }),
        avgRating: avgRating[0]?.avgRating || 0
      };
    } catch (error) {
      console.error('필터 통계 생성 오류:', error);
      return {
        categories: [],
        brands: [],
        priceRanges: [],
        avgRating: 0
      };
    }
  }

  /**
   * 인기 상품 조회
   */
  async getPopularProducts(limit: number = 10): Promise<IProduct[]> {
    try {
      return await Product.find({ status: 'active', stock: { $gt: 0 } })
        .sort({ sold: -1, ratings: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('인기 상품 조회 오류:', error);
      throw new Error('인기 상품 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 추천 상품 조회 (유사 상품)
   */
  async getRecommendedProducts(productId: string, limit: number = 5): Promise<IProduct[]> {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      // 같은 카테고리의 다른 상품들을 추천
      return await Product.find({
        _id: { $ne: productId },
        category: product.category,
        status: 'active',
        stock: { $gt: 0 }
      })
        .sort({ ratings: -1, sold: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('추천 상품 조회 오류:', error);
      throw new Error('추천 상품 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 신상품 조회
   */
  async getNewProducts(limit: number = 10): Promise<IProduct[]> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      return await Product.find({
        status: 'active',
        stock: { $gt: 0 },
        createdAt: { $gte: oneWeekAgo }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('신상품 조회 오류:', error);
      throw new Error('신상품 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 할인 상품 조회
   */
  async getDiscountedProducts(limit: number = 10): Promise<IProduct[]> {
    try {
      return await Product.find({
        status: 'active',
        stock: { $gt: 0 },
        discountPrice: { $exists: true, $gt: 0 }
      })
        .sort({
          // 할인율로 정렬
          $expr: {
            $divide: [
              { $subtract: ['$price', '$discountPrice'] },
              '$price'
            ]
          }
        } as any)
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('할인 상품 조회 오류:', error);
      throw new Error('할인 상품 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 검색 키워드 자동완성
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      if (!query.trim()) return [];

      const searchRegex = new RegExp(query.trim(), 'i');
      
      const products = await Product.find({
        status: 'active',
        $or: [
          { name: searchRegex },
          { brand: searchRegex },
          { tags: searchRegex }
        ]
      })
        .select('name brand tags')
        .limit(limit * 2)
        .lean();

      const suggestions = new Set<string>();

      products.forEach(product => {
        // 상품명에서 매치되는 부분 추가
        if (product.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(product.name);
        }

        // 브랜드명에서 매치되는 부분 추가
        if (product.brand && product.brand.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(product.brand);
        }

        // 태그에서 매치되는 부분 추가
        product.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(tag);
          }
        });
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('검색 제안 조회 오류:', error);
      return [];
    }
  }
}

export default ProductService;
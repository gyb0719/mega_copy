import { IProduct } from '../models/Product';
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
        categories: Array<{
            name: string;
            count: number;
        }>;
        brands: Array<{
            name: string;
            count: number;
        }>;
        priceRanges: Array<{
            min: number;
            max: number;
            count: number;
        }>;
        avgRating: number;
    };
}
declare class ProductService {
    private static instance;
    private constructor();
    static getInstance(): ProductService;
    searchProducts(filters?: ProductSearchFilters, sort?: ProductSortOptions, pagination?: PaginationOptions): Promise<ProductSearchResult>;
    private buildSearchQuery;
    private getFilterStatistics;
    getPopularProducts(limit?: number): Promise<IProduct[]>;
    getRecommendedProducts(productId: string, limit?: number): Promise<IProduct[]>;
    getNewProducts(limit?: number): Promise<IProduct[]>;
    getDiscountedProducts(limit?: number): Promise<IProduct[]>;
    getSearchSuggestions(query: string, limit?: number): Promise<string[]>;
}
export default ProductService;
//# sourceMappingURL=productService.d.ts.map
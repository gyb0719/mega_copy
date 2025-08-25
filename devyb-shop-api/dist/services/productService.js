"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = __importDefault(require("../models/Product"));
class ProductService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!ProductService.instance) {
            ProductService.instance = new ProductService();
        }
        return ProductService.instance;
    }
    async searchProducts(filters = {}, sort = { field: 'createdAt', order: 'desc' }, pagination = { page: 1, limit: 10 }) {
        try {
            const query = this.buildSearchQuery(filters);
            const sortOption = {
                [sort.field]: sort.order === 'asc' ? 1 : -1
            };
            if (sort.field !== 'createdAt') {
                sortOption.createdAt = -1;
            }
            const skip = (pagination.page - 1) * pagination.limit;
            const [products, totalProducts, filterStats] = await Promise.all([
                Product_1.default.find(query)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(pagination.limit)
                    .populate('reviews', 'rating')
                    .lean(),
                Product_1.default.countDocuments(query),
                this.getFilterStatistics(filters)
            ]);
            const totalPages = Math.ceil(totalProducts / pagination.limit);
            const hasNext = pagination.page < totalPages;
            const hasPrev = pagination.page > 1;
            return {
                products: products,
                pagination: {
                    currentPage: pagination.page,
                    totalPages,
                    totalProducts,
                    hasNext,
                    hasPrev
                },
                filters: filterStats
            };
        }
        catch (error) {
            console.error('상품 검색 오류:', error);
            throw new Error('상품 검색 중 오류가 발생했습니다.');
        }
    }
    buildSearchQuery(filters) {
        const query = {};
        query.status = filters.status || 'active';
        if (filters.search) {
            const searchRegex = new RegExp(filters.search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { tags: searchRegex },
                { brand: searchRegex }
            ];
        }
        if (filters.category) {
            query.category = filters.category;
        }
        if (filters.subcategory) {
            query.subcategory = filters.subcategory;
        }
        if (filters.brand) {
            query.brand = new RegExp(filters.brand.trim(), 'i');
        }
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            query.$or = [
                {
                    $and: [
                        { discountPrice: { $exists: true, $gt: 0 } },
                        ...(filters.minPrice !== undefined ? [{ discountPrice: { $gte: filters.minPrice } }] : []),
                        ...(filters.maxPrice !== undefined ? [{ discountPrice: { $lte: filters.maxPrice } }] : [])
                    ]
                },
                {
                    $and: [
                        { $or: [{ discountPrice: { $exists: false } }, { discountPrice: { $lte: 0 } }] },
                        ...(filters.minPrice !== undefined ? [{ price: { $gte: filters.minPrice } }] : []),
                        ...(filters.maxPrice !== undefined ? [{ price: { $lte: filters.maxPrice } }] : [])
                    ]
                }
            ];
        }
        if (filters.inStock !== undefined) {
            if (filters.inStock) {
                query.stock = { $gt: 0 };
            }
            else {
                query.stock = { $lte: 0 };
            }
        }
        if (filters.rating !== undefined) {
            query.ratings = { $gte: filters.rating };
        }
        if (filters.tags && filters.tags.length > 0) {
            query.tags = { $in: filters.tags };
        }
        if (filters.features && filters.features.length > 0) {
            query.features = { $in: filters.features };
        }
        return query;
    }
    async getFilterStatistics(currentFilters) {
        try {
            const baseQuery = { status: 'active' };
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
                Product_1.default.aggregate([
                    { $match: baseQuery },
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]),
                Product_1.default.aggregate([
                    { $match: { ...baseQuery, brand: { $ne: null, $ne: '' } } },
                    { $group: { _id: '$brand', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]),
                Product_1.default.aggregate([
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
                Product_1.default.aggregate([
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
        }
        catch (error) {
            console.error('필터 통계 생성 오류:', error);
            return {
                categories: [],
                brands: [],
                priceRanges: [],
                avgRating: 0
            };
        }
    }
    async getPopularProducts(limit = 10) {
        try {
            return await Product_1.default.find({ status: 'active', stock: { $gt: 0 } })
                .sort({ sold: -1, ratings: -1 })
                .limit(limit)
                .lean();
        }
        catch (error) {
            console.error('인기 상품 조회 오류:', error);
            throw new Error('인기 상품 조회 중 오류가 발생했습니다.');
        }
    }
    async getRecommendedProducts(productId, limit = 5) {
        try {
            const product = await Product_1.default.findById(productId);
            if (!product) {
                throw new Error('상품을 찾을 수 없습니다.');
            }
            return await Product_1.default.find({
                _id: { $ne: productId },
                category: product.category,
                status: 'active',
                stock: { $gt: 0 }
            })
                .sort({ ratings: -1, sold: -1 })
                .limit(limit)
                .lean();
        }
        catch (error) {
            console.error('추천 상품 조회 오류:', error);
            throw new Error('추천 상품 조회 중 오류가 발생했습니다.');
        }
    }
    async getNewProducts(limit = 10) {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return await Product_1.default.find({
                status: 'active',
                stock: { $gt: 0 },
                createdAt: { $gte: oneWeekAgo }
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        }
        catch (error) {
            console.error('신상품 조회 오류:', error);
            throw new Error('신상품 조회 중 오류가 발생했습니다.');
        }
    }
    async getDiscountedProducts(limit = 10) {
        try {
            return await Product_1.default.find({
                status: 'active',
                stock: { $gt: 0 },
                discountPrice: { $exists: true, $gt: 0 }
            })
                .sort({
                $expr: {
                    $divide: [
                        { $subtract: ['$price', '$discountPrice'] },
                        '$price'
                    ]
                }
            })
                .limit(limit)
                .lean();
        }
        catch (error) {
            console.error('할인 상품 조회 오류:', error);
            throw new Error('할인 상품 조회 중 오류가 발생했습니다.');
        }
    }
    async getSearchSuggestions(query, limit = 5) {
        try {
            if (!query.trim())
                return [];
            const searchRegex = new RegExp(query.trim(), 'i');
            const products = await Product_1.default.find({
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
            const suggestions = new Set();
            products.forEach(product => {
                if (product.name.toLowerCase().includes(query.toLowerCase())) {
                    suggestions.add(product.name);
                }
                if (product.brand && product.brand.toLowerCase().includes(query.toLowerCase())) {
                    suggestions.add(product.brand);
                }
                product.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(query.toLowerCase())) {
                        suggestions.add(tag);
                    }
                });
            });
            return Array.from(suggestions).slice(0, limit);
        }
        catch (error) {
            console.error('검색 제안 조회 오류:', error);
            return [];
        }
    }
}
exports.default = ProductService;
//# sourceMappingURL=productService.js.map
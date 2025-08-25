"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.uploadProductImages = exports.updateStock = exports.getSearchSuggestions = exports.getDiscountedProducts = exports.getNewProducts = exports.getPopularProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
require("multer");
const Product_1 = __importDefault(require("../models/Product"));
const productService_1 = __importDefault(require("../services/productService"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const productService = productService_1.default.getInstance();
const cloudinaryService = cloudinary_1.default.getInstance();
const getProducts = async (req, res, next) => {
    try {
        const { search, category, subcategory, brand, minPrice, maxPrice, inStock, status, rating, tags, features, page = 1, limit = 10, sort = '-createdAt' } = req.query;
        const filters = {
            search: search,
            category: category,
            subcategory: subcategory,
            brand: brand,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            inStock: inStock === 'true',
            status: status,
            rating: rating ? Number(rating) : undefined,
            tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
            features: features ? (Array.isArray(features) ? features : [features]) : undefined
        };
        const sortField = sort.startsWith('-')
            ? sort.substring(1)
            : sort;
        const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
        const pagination = {
            page: Number(page),
            limit: Math.min(Number(limit), 100)
        };
        const result = await productService.searchProducts(filters, { field: sortField, order: sortOrder }, pagination);
        res.status(200).json({
            success: true,
            data: result.products,
            pagination: result.pagination,
            filters: result.filters,
            message: `${result.pagination.totalProducts}개의 상품을 찾았습니다.`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findById(id).populate('reviews');
        if (!product) {
            res.status(404).json({
                success: false,
                error: {
                    status: 404,
                    message: '상품을 찾을 수 없습니다.'
                }
            });
            return;
        }
        const recommendedProducts = await productService.getRecommendedProducts(id);
        res.status(200).json({
            success: true,
            data: {
                product,
                recommendedProducts
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res, next) => {
    try {
        const productData = req.body;
        const existingProduct = await Product_1.default.findOne({ sku: productData.sku });
        if (existingProduct) {
            res.status(400).json({
                success: false,
                error: {
                    status: 400,
                    message: '이미 사용 중인 SKU입니다.'
                }
            });
            return;
        }
        const product = new Product_1.default(productData);
        await product.save();
        res.status(201).json({
            success: true,
            data: product,
            message: '상품이 성공적으로 생성되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (updateData.sku) {
            const existingProduct = await Product_1.default.findOne({
                sku: updateData.sku,
                _id: { $ne: id }
            });
            if (existingProduct) {
                res.status(400).json({
                    success: false,
                    error: {
                        status: 400,
                        message: '이미 사용 중인 SKU입니다.'
                    }
                });
                return;
            }
        }
        const product = await Product_1.default.findByIdAndUpdate(id, { ...updateData, updatedAt: new Date() }, { new: true, runValidators: true });
        if (!product) {
            res.status(404).json({
                success: false,
                error: {
                    status: 404,
                    message: '상품을 찾을 수 없습니다.'
                }
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: product,
            message: '상품이 성공적으로 수정되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findById(id);
        if (!product) {
            res.status(404).json({
                success: false,
                error: {
                    status: 404,
                    message: '상품을 찾을 수 없습니다.'
                }
            });
            return;
        }
        if (product.images && product.images.length > 0) {
            try {
                const publicIds = product.images.map(url => {
                    const parts = url.split('/');
                    const filename = parts[parts.length - 1];
                    return filename.split('.')[0];
                });
                await cloudinaryService.deleteMultipleFiles(publicIds);
            }
            catch (imageError) {
                console.error('이미지 삭제 오류:', imageError);
            }
        }
        await Product_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: '상품이 성공적으로 삭제되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const getPopularProducts = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const products = await productService.getPopularProducts(Number(limit));
        res.status(200).json({
            success: true,
            data: products,
            message: '인기 상품을 조회했습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPopularProducts = getPopularProducts;
const getNewProducts = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const products = await productService.getNewProducts(Number(limit));
        res.status(200).json({
            success: true,
            data: products,
            message: '신상품을 조회했습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getNewProducts = getNewProducts;
const getDiscountedProducts = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const products = await productService.getDiscountedProducts(Number(limit));
        res.status(200).json({
            success: true,
            data: products,
            message: '할인 상품을 조회했습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDiscountedProducts = getDiscountedProducts;
const getSearchSuggestions = async (req, res, next) => {
    try {
        const { q, limit = 5 } = req.query;
        if (!q || typeof q !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    status: 400,
                    message: '검색어를 입력해주세요.'
                }
            });
            return;
        }
        const suggestions = await productService.getSearchSuggestions(q, Number(limit));
        res.status(200).json({
            success: true,
            data: suggestions
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSearchSuggestions = getSearchSuggestions;
const updateStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { stock, operation = 'set' } = req.body;
        const product = await Product_1.default.findById(id);
        if (!product) {
            res.status(404).json({
                success: false,
                error: {
                    status: 404,
                    message: '상품을 찾을 수 없습니다.'
                }
            });
            return;
        }
        let newStock = stock;
        if (operation === 'add') {
            newStock = product.stock + stock;
        }
        else if (operation === 'subtract') {
            newStock = Math.max(0, product.stock - stock);
        }
        product.stock = newStock;
        await product.save();
        res.status(200).json({
            success: true,
            data: { stock: product.stock },
            message: '재고가 성공적으로 업데이트되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStock = updateStock;
const uploadProductImages = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                error: {
                    status: 400,
                    message: '업로드할 이미지를 선택해주세요.'
                }
            });
            return;
        }
        const uploadPromises = files.map(file => cloudinaryService.uploadFile(file.buffer, {
            folder: 'devyb-shop/products',
            quality: 'auto:good',
            format: 'webp'
        }));
        const uploadResults = await Promise.all(uploadPromises);
        const imageUrls = uploadResults.map(result => result.secure_url);
        res.status(200).json({
            success: true,
            data: {
                images: imageUrls,
                uploadResults
            },
            message: `${imageUrls.length}개의 이미지가 성공적으로 업로드되었습니다.`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadProductImages = uploadProductImages;
const getCategoryStats = async (_req, res, next) => {
    try {
        const stats = await Product_1.default.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$category',
                    totalProducts: { $sum: 1 },
                    averagePrice: { $avg: '$price' },
                    totalStock: { $sum: '$stock' },
                    averageRating: { $avg: '$ratings' }
                }
            },
            { $sort: { totalProducts: -1 } }
        ]);
        res.status(200).json({
            success: true,
            data: stats,
            message: '카테고리별 통계를 조회했습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryStats = getCategoryStats;
//# sourceMappingURL=productController.js.map
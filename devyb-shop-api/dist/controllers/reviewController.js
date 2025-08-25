"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReviews = exports.uploadReviewImages = exports.getReviewableProducts = exports.getPendingReviews = exports.moderateReview = exports.replyToReview = exports.voteReview = exports.deleteReview = exports.updateReview = exports.getProductReviewStats = exports.getReview = exports.getReviews = exports.createReview = void 0;
require("multer");
const reviewService_1 = __importDefault(require("../services/reviewService"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const reviewService = reviewService_1.default.getInstance();
const cloudinaryService = cloudinary_1.default.getInstance();
const createReview = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { product, order, rating, title, comment, images } = req.body;
        const review = await reviewService.createReview({
            user: userId,
            product,
            order,
            rating,
            title,
            comment,
            images
        });
        res.status(201).json({
            success: true,
            data: review,
            message: '리뷰가 성공적으로 작성되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
const getReviews = async (req, res, next) => {
    try {
        const { product, user, rating, minRating, maxRating, isVerifiedPurchase, hasImages, sortBy, page = 1, limit = 10 } = req.query;
        const filters = {
            product: product,
            user: user,
            rating: rating ? Number(rating) : undefined,
            minRating: minRating ? Number(minRating) : undefined,
            maxRating: maxRating ? Number(maxRating) : undefined,
            isVerifiedPurchase: isVerifiedPurchase === 'true',
            hasImages: hasImages === 'true',
            sortBy: sortBy
        };
        const result = await reviewService.getReviews(filters, Number(page), Number(limit));
        res.status(200).json({
            success: true,
            data: result.reviews,
            pagination: result.pagination
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviews = getReviews;
const getReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const review = await reviewService.getReviews({ product: id }, 1, 1);
        if (!review.reviews.length) {
            res.status(404).json({
                success: false,
                error: {
                    status: 404,
                    message: '리뷰를 찾을 수 없습니다.'
                }
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: review.reviews[0]
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReview = getReview;
const getProductReviewStats = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const stats = await reviewService.getProductReviewStats(productId);
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductReviewStats = getProductReviewStats;
const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const updateData = req.body;
        const review = await reviewService.updateReview(id, userId, updateData);
        res.status(200).json({
            success: true,
            data: review,
            message: '리뷰가 성공적으로 수정되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        await reviewService.deleteReview(id, userId);
        res.status(200).json({
            success: true,
            message: '리뷰가 성공적으로 삭제되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReview = deleteReview;
const voteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isHelpful } = req.body;
        const userId = req.userId;
        const review = await reviewService.voteHelpful(id, userId, isHelpful);
        res.status(200).json({
            success: true,
            data: {
                helpfulVotes: review.helpfulVotes,
                totalVotes: review.totalVotes
            },
            message: isHelpful ? '도움이 되는 리뷰로 투표했습니다.' : '도움이 되지 않는 리뷰로 투표했습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.voteReview = voteReview;
const replyToReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const adminId = req.userId;
        const review = await reviewService.addReply(id, adminId, comment);
        res.status(200).json({
            success: true,
            data: review,
            message: '답글이 성공적으로 작성되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.replyToReview = replyToReview;
const moderateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const review = await reviewService.moderateReview(id, status, reason);
        res.status(200).json({
            success: true,
            data: review,
            message: status === 'approved' ? '리뷰가 승인되었습니다.' : '리뷰가 거부되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.moderateReview = moderateReview;
const getPendingReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await reviewService.getPendingReviews(Number(page), Number(limit));
        res.status(200).json({
            success: true,
            data: result.reviews,
            pagination: result.pagination
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingReviews = getPendingReviews;
const getReviewableProducts = async (req, res, next) => {
    try {
        const userId = req.userId;
        const products = await reviewService.getReviewableProducts(userId);
        res.status(200).json({
            success: true,
            data: products,
            message: `${products.length}개의 리뷰 작성 가능한 상품이 있습니다.`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviewableProducts = getReviewableProducts;
const uploadReviewImages = async (req, res, next) => {
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
        if (files.length > 5) {
            res.status(400).json({
                success: false,
                error: {
                    status: 400,
                    message: '리뷰 이미지는 최대 5개까지 업로드 가능합니다.'
                }
            });
            return;
        }
        const uploadPromises = files.map(file => cloudinaryService.uploadFile(file.buffer, {
            folder: 'devyb-shop/reviews',
            quality: 'auto:good',
            format: 'webp',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto:good' }
            ]
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
exports.uploadReviewImages = uploadReviewImages;
const getUserReviews = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;
        const result = await reviewService.getReviews({ user: userId, sortBy: 'newest' }, Number(page), Number(limit));
        res.status(200).json({
            success: true,
            data: result.reviews,
            pagination: result.pagination
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserReviews = getUserReviews;
//# sourceMappingURL=reviewController.js.map
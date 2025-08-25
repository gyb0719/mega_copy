"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Review_1 = __importDefault(require("../models/Review"));
const Order_1 = __importDefault(require("../models/Order"));
class ReviewService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!ReviewService.instance) {
            ReviewService.instance = new ReviewService();
        }
        return ReviewService.instance;
    }
    async createReview(reviewData) {
        try {
            const existingReview = await Review_1.default.findOne({
                user: reviewData.user,
                product: reviewData.product
            });
            if (existingReview) {
                throw new Error('이미 이 상품에 대한 리뷰를 작성하셨습니다.');
            }
            const order = await Order_1.default.findOne({
                _id: reviewData.order,
                user: reviewData.user,
                'orderItems.product': reviewData.product,
                isPaid: true,
                isDelivered: true
            });
            if (!order) {
                throw new Error('구매하지 않은 상품에는 리뷰를 작성할 수 없습니다.');
            }
            const review = new Review_1.default({
                ...reviewData,
                status: 'approved'
            });
            await review.save();
            return review;
        }
        catch (error) {
            console.error('리뷰 생성 오류:', error);
            throw error;
        }
    }
    async getReviews(filters = {}, page = 1, limit = 10) {
        try {
            const query = this.buildReviewQuery(filters);
            const sortOption = this.getSortOption(filters.sortBy || 'newest');
            const skip = (page - 1) * limit;
            const [reviews, totalReviews] = await Promise.all([
                Review_1.default.find(query)
                    .populate('user', 'name avatar')
                    .populate('product', 'name images')
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Review_1.default.countDocuments(query)
            ]);
            const totalPages = Math.ceil(totalReviews / limit);
            return {
                reviews,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalReviews,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        }
        catch (error) {
            console.error('리뷰 목록 조회 오류:', error);
            throw new Error('리뷰 조회 중 오류가 발생했습니다.');
        }
    }
    async getProductReviewStats(productId) {
        try {
            const [totalStats, ratingStats, verifiedCount, withImagesCount] = await Promise.all([
                Review_1.default.aggregate([
                    {
                        $match: {
                            product: new (require('mongoose')).Types.ObjectId(productId),
                            status: 'approved'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalReviews: { $sum: 1 },
                            averageRating: { $avg: '$rating' }
                        }
                    }
                ]),
                Review_1.default.aggregate([
                    {
                        $match: {
                            product: new (require('mongoose')).Types.ObjectId(productId),
                            status: 'approved'
                        }
                    },
                    {
                        $group: {
                            _id: '$rating',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } }
                ]),
                Review_1.default.countDocuments({
                    product: productId,
                    status: 'approved',
                    isVerifiedPurchase: true
                }),
                Review_1.default.countDocuments({
                    product: productId,
                    status: 'approved',
                    images: { $exists: true, $not: { $size: 0 } }
                })
            ]);
            const total = totalStats[0]?.totalReviews || 0;
            const avgRating = totalStats[0]?.averageRating || 0;
            const ratingDistribution = [];
            for (let rating = 5; rating >= 1; rating--) {
                const stat = ratingStats.find(s => s._id === rating);
                const count = stat?.count || 0;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                ratingDistribution.push({
                    rating,
                    count,
                    percentage
                });
            }
            return {
                totalReviews: total,
                averageRating: Math.round(avgRating * 10) / 10,
                ratingDistribution,
                verifiedPurchaseCount: verifiedCount,
                withImagesCount
            };
        }
        catch (error) {
            console.error('리뷰 통계 조회 오류:', error);
            throw new Error('리뷰 통계 조회 중 오류가 발생했습니다.');
        }
    }
    async updateReview(reviewId, userId, updateData) {
        try {
            const review = await Review_1.default.findOne({ _id: reviewId, user: userId });
            if (!review) {
                throw new Error('수정할 수 있는 리뷰를 찾을 수 없습니다.');
            }
            const daysSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceCreation > 7) {
                throw new Error('리뷰 작성 후 7일 이내에만 수정할 수 있습니다.');
            }
            Object.assign(review, updateData);
            review.status = 'pending';
            await review.save();
            return review;
        }
        catch (error) {
            console.error('리뷰 수정 오류:', error);
            throw error;
        }
    }
    async deleteReview(reviewId, userId) {
        try {
            const review = await Review_1.default.findOne({ _id: reviewId, user: userId });
            if (!review) {
                throw new Error('삭제할 수 있는 리뷰를 찾을 수 없습니다.');
            }
            await review.deleteOne();
        }
        catch (error) {
            console.error('리뷰 삭제 오류:', error);
            throw error;
        }
    }
    async voteHelpful(reviewId, userId, isHelpful) {
        try {
            const review = await Review_1.default.findById(reviewId);
            if (!review) {
                throw new Error('리뷰를 찾을 수 없습니다.');
            }
            if (review.user.toString() === userId) {
                throw new Error('자신의 리뷰에는 투표할 수 없습니다.');
            }
            if (isHelpful) {
                await review.addHelpfulVote(userId);
            }
            else {
                await review.addNotHelpfulVote(userId);
            }
            return review;
        }
        catch (error) {
            console.error('리뷰 투표 오류:', error);
            throw error;
        }
    }
    async addReply(reviewId, adminId, comment) {
        try {
            const review = await Review_1.default.findById(reviewId);
            if (!review) {
                throw new Error('리뷰를 찾을 수 없습니다.');
            }
            review.reply = {
                comment,
                repliedAt: new Date(),
                repliedBy: adminId
            };
            await review.save();
            return review;
        }
        catch (error) {
            console.error('리뷰 답글 작성 오류:', error);
            throw error;
        }
    }
    async moderateReview(reviewId, status, reason) {
        try {
            const review = await Review_1.default.findById(reviewId);
            if (!review) {
                throw new Error('리뷰를 찾을 수 없습니다.');
            }
            review.status = status;
            if (status === 'rejected' && reason) {
                review.moderationReason = reason;
            }
            await review.save();
            return review;
        }
        catch (error) {
            console.error('리뷰 검토 오류:', error);
            throw error;
        }
    }
    async getPendingReviews(page = 1, limit = 10) {
        try {
            return await this.getReviews({ status: 'pending', sortBy: 'oldest' }, page, limit);
        }
        catch (error) {
            console.error('대기 중인 리뷰 조회 오류:', error);
            throw error;
        }
    }
    async getReviewableProducts(userId) {
        try {
            const orders = await Order_1.default.find({
                user: userId,
                isPaid: true,
                isDelivered: true
            }).populate('orderItems.product');
            const reviewedProductIds = await Review_1.default.distinct('product', { user: userId });
            const reviewableItems = [];
            for (const order of orders) {
                for (const item of order.orderItems) {
                    if (!reviewedProductIds.includes(item.product._id)) {
                        reviewableItems.push({
                            order: order._id,
                            product: item.product,
                            purchaseDate: order.deliveredAt || order.createdAt
                        });
                    }
                }
            }
            return reviewableItems;
        }
        catch (error) {
            console.error('리뷰 가능 상품 조회 오류:', error);
            throw error;
        }
    }
    buildReviewQuery(filters) {
        const query = {};
        if (filters.product) {
            query.product = filters.product;
        }
        if (filters.user) {
            query.user = filters.user;
        }
        if (filters.rating) {
            query.rating = filters.rating;
        }
        if (filters.minRating || filters.maxRating) {
            query.rating = {};
            if (filters.minRating)
                query.rating.$gte = filters.minRating;
            if (filters.maxRating)
                query.rating.$lte = filters.maxRating;
        }
        if (filters.isVerifiedPurchase !== undefined) {
            query.isVerifiedPurchase = filters.isVerifiedPurchase;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        else {
            query.status = 'approved';
        }
        if (filters.hasImages !== undefined) {
            if (filters.hasImages) {
                query.images = { $exists: true, $not: { $size: 0 } };
            }
            else {
                query.$or = [
                    { images: { $exists: false } },
                    { images: { $size: 0 } }
                ];
            }
        }
        return query;
    }
    getSortOption(sortBy) {
        switch (sortBy) {
            case 'oldest':
                return { createdAt: 1 };
            case 'helpful':
                return { helpfulVotes: -1, createdAt: -1 };
            case 'rating_high':
                return { rating: -1, createdAt: -1 };
            case 'rating_low':
                return { rating: 1, createdAt: -1 };
            case 'newest':
            default:
                return { createdAt: -1 };
        }
    }
}
exports.default = ReviewService;
//# sourceMappingURL=reviewService.js.map
import { IReview } from '../models/Review';
export interface ReviewFilters {
    product?: string;
    user?: string;
    rating?: number;
    minRating?: number;
    maxRating?: number;
    isVerifiedPurchase?: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    hasImages?: boolean;
    sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating_high' | 'rating_low';
}
export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Array<{
        rating: number;
        count: number;
        percentage: number;
    }>;
    verifiedPurchaseCount: number;
    withImagesCount: number;
}
declare class ReviewService {
    private static instance;
    private constructor();
    static getInstance(): ReviewService;
    createReview(reviewData: {
        user: string;
        product: string;
        order: string;
        rating: number;
        title: string;
        comment: string;
        images?: string[];
    }): Promise<IReview>;
    getReviews(filters?: ReviewFilters, page?: number, limit?: number): Promise<{
        reviews: (import("mongoose").FlattenMaps<IReview> & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalReviews: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getProductReviewStats(productId: string): Promise<ReviewStats>;
    updateReview(reviewId: string, userId: string, updateData: Partial<{
        rating: number;
        title: string;
        comment: string;
        images: string[];
    }>): Promise<IReview>;
    deleteReview(reviewId: string, userId: string): Promise<void>;
    voteHelpful(reviewId: string, userId: string, isHelpful: boolean): Promise<IReview>;
    addReply(reviewId: string, adminId: string, comment: string): Promise<IReview>;
    moderateReview(reviewId: string, status: 'approved' | 'rejected', reason?: string): Promise<IReview>;
    getPendingReviews(page?: number, limit?: number): Promise<{
        reviews: (import("mongoose").FlattenMaps<IReview> & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalReviews: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getReviewableProducts(userId: string): Promise<{
        order: string;
        product: string;
        purchaseDate: Date;
    }[]>;
    private buildReviewQuery;
    private getSortOption;
}
export default ReviewService;
//# sourceMappingURL=reviewService.d.ts.map
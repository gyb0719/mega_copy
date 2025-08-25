import Review, { IReview } from '../models/Review';
import Order from '../models/Order';
import { FilterQuery, SortOrder } from 'mongoose';

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
  ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
  verifiedPurchaseCount: number;
  withImagesCount: number;
}

class ReviewService {
  private static instance: ReviewService;

  private constructor() {}

  public static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  /**
   * 리뷰 생성
   */
  async createReview(reviewData: {
    user: string;
    product: string;
    order: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<IReview> {
    try {
      // 이미 리뷰를 작성했는지 확인
      const existingReview = await Review.findOne({
        user: reviewData.user,
        product: reviewData.product
      });

      if (existingReview) {
        throw new Error('이미 이 상품에 대한 리뷰를 작성하셨습니다.');
      }

      // 주문 확인 - 실제로 구매한 상품인지 확인
      const order = await Order.findOne({
        _id: reviewData.order,
        user: reviewData.user,
        'orderItems.product': reviewData.product,
        isPaid: true,
        isDelivered: true
      });

      if (!order) {
        throw new Error('구매하지 않은 상품에는 리뷰를 작성할 수 없습니다.');
      }

      // 리뷰 생성
      const review = new Review({
        ...reviewData,
        status: 'approved' // 기본적으로 승인 상태로 생성 (필요에 따라 'pending'으로 변경)
      });

      await review.save();
      return review;
    } catch (error) {
      console.error('리뷰 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 리뷰 목록 조회
   */
  async getReviews(
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const query: FilterQuery<IReview> = this.buildReviewQuery(filters);
      const sortOption = this.getSortOption(filters.sortBy || 'newest');
      
      const skip = (page - 1) * limit;

      const [reviews, totalReviews] = await Promise.all([
        Review.find(query)
          .populate('user', 'name avatar')
          .populate('product', 'name images')
          .sort(sortOption as any)
          .skip(skip)
          .limit(limit)
          .lean(),
        Review.countDocuments(query)
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
    } catch (error) {
      console.error('리뷰 목록 조회 오류:', error);
      throw new Error('리뷰 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 상품별 리뷰 통계
   */
  async getProductReviewStats(productId: string): Promise<ReviewStats> {
    try {
      const [totalStats, ratingStats, verifiedCount, withImagesCount] = await Promise.all([
        // 전체 통계
        Review.aggregate([
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

        // 평점별 분포
        Review.aggregate([
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

        // 검증된 구매 리뷰 수
        Review.countDocuments({
          product: productId,
          status: 'approved',
          isVerifiedPurchase: true
        }),

        // 이미지가 있는 리뷰 수
        Review.countDocuments({
          product: productId,
          status: 'approved',
          images: { $exists: true, $not: { $size: 0 } }
        })
      ]);

      const total = totalStats[0]?.totalReviews || 0;
      const avgRating = totalStats[0]?.averageRating || 0;

      // 평점 분포 계산 (1-5점)
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
    } catch (error) {
      console.error('리뷰 통계 조회 오류:', error);
      throw new Error('리뷰 통계 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 리뷰 수정
   */
  async updateReview(
    reviewId: string,
    userId: string,
    updateData: Partial<{
      rating: number;
      title: string;
      comment: string;
      images: string[];
    }>
  ): Promise<IReview> {
    try {
      const review = await Review.findOne({ _id: reviewId, user: userId });
      
      if (!review) {
        throw new Error('수정할 수 있는 리뷰를 찾을 수 없습니다.');
      }

      // 수정 허용 기간 체크 (7일)
      const daysSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > 7) {
        throw new Error('리뷰 작성 후 7일 이내에만 수정할 수 있습니다.');
      }

      Object.assign(review, updateData);
      review.status = 'pending'; // 수정 시 다시 검토 대기 상태로 변경
      
      await review.save();
      return review;
    } catch (error) {
      console.error('리뷰 수정 오류:', error);
      throw error;
    }
  }

  /**
   * 리뷰 삭제
   */
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      const review = await Review.findOne({ _id: reviewId, user: userId });
      
      if (!review) {
        throw new Error('삭제할 수 있는 리뷰를 찾을 수 없습니다.');
      }

      await review.deleteOne();
    } catch (error) {
      console.error('리뷰 삭제 오류:', error);
      throw error;
    }
  }

  /**
   * 리뷰 도움됨 투표
   */
  async voteHelpful(reviewId: string, userId: string, isHelpful: boolean): Promise<IReview> {
    try {
      const review = await Review.findById(reviewId);
      
      if (!review) {
        throw new Error('리뷰를 찾을 수 없습니다.');
      }

      if (review.user.toString() === userId) {
        throw new Error('자신의 리뷰에는 투표할 수 없습니다.');
      }

      if (isHelpful) {
        await review.addHelpfulVote(userId);
      } else {
        await review.addNotHelpfulVote(userId);
      }

      return review;
    } catch (error) {
      console.error('리뷰 투표 오류:', error);
      throw error;
    }
  }

  /**
   * 리뷰 답글 작성 (관리자)
   */
  async addReply(
    reviewId: string,
    adminId: string,
    comment: string
  ): Promise<IReview> {
    try {
      const review = await Review.findById(reviewId);
      
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
    } catch (error) {
      console.error('리뷰 답글 작성 오류:', error);
      throw error;
    }
  }

  /**
   * 리뷰 승인/거부 (관리자)
   */
  async moderateReview(
    reviewId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<IReview> {
    try {
      const review = await Review.findById(reviewId);
      
      if (!review) {
        throw new Error('리뷰를 찾을 수 없습니다.');
      }

      review.status = status;
      if (status === 'rejected' && reason) {
        review.moderationReason = reason;
      }

      await review.save();
      return review;
    } catch (error) {
      console.error('리뷰 검토 오류:', error);
      throw error;
    }
  }

  /**
   * 검토 대기 중인 리뷰 목록
   */
  async getPendingReviews(page: number = 1, limit: number = 10) {
    try {
      return await this.getReviews(
        { status: 'pending', sortBy: 'oldest' },
        page,
        limit
      );
    } catch (error) {
      console.error('대기 중인 리뷰 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자별 리뷰 가능한 상품 목록
   */
  async getReviewableProducts(userId: string) {
    try {
      // 사용자가 구매했지만 아직 리뷰를 작성하지 않은 상품들
      const orders = await Order.find({
        user: userId,
        isPaid: true,
        isDelivered: true
      }).populate('orderItems.product');

      const reviewedProductIds = await Review.distinct('product', { user: userId });

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
    } catch (error) {
      console.error('리뷰 가능 상품 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 리뷰 쿼리 빌더
   */
  private buildReviewQuery(filters: ReviewFilters): FilterQuery<IReview> {
    const query: FilterQuery<IReview> = {};

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
      if (filters.minRating) query.rating.$gte = filters.minRating;
      if (filters.maxRating) query.rating.$lte = filters.maxRating;
    }

    if (filters.isVerifiedPurchase !== undefined) {
      query.isVerifiedPurchase = filters.isVerifiedPurchase;
    }

    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = 'approved'; // 기본적으로 승인된 리뷰만
    }

    if (filters.hasImages !== undefined) {
      if (filters.hasImages) {
        query.images = { $exists: true, $not: { $size: 0 } };
      } else {
        query.$or = [
          { images: { $exists: false } },
          { images: { $size: 0 } }
        ];
      }
    }

    return query;
  }

  /**
   * 정렬 옵션 빌더
   */
  private getSortOption(sortBy: string): Record<string, SortOrder> {
    switch (sortBy) {
      case 'oldest':
        return { createdAt: 1 as SortOrder };
      case 'helpful':
        return { helpfulVotes: -1 as SortOrder, createdAt: -1 as SortOrder };
      case 'rating_high':
        return { rating: -1 as SortOrder, createdAt: -1 as SortOrder };
      case 'rating_low':
        return { rating: 1 as SortOrder, createdAt: -1 as SortOrder };
      case 'newest':
      default:
        return { createdAt: -1 as SortOrder };
    }
  }
}

export default ReviewService;
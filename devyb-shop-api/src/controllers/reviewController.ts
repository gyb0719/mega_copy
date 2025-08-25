import { Request, Response, NextFunction } from 'express';
import 'multer';
import ReviewService, { ReviewFilters } from '../services/reviewService';
import CloudinaryService from '../config/cloudinary';

const reviewService = ReviewService.getInstance();
const cloudinaryService = CloudinaryService.getInstance();

/**
 * 리뷰 생성
 */
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
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
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 목록 조회
 */
export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      product,
      user,
      rating,
      minRating,
      maxRating,
      isVerifiedPurchase,
      hasImages,
      sortBy,
      page = 1,
      limit = 10
    } = req.query;

    const filters: ReviewFilters = {
      product: product as string,
      user: user as string,
      rating: rating ? Number(rating) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      maxRating: maxRating ? Number(maxRating) : undefined,
      isVerifiedPurchase: isVerifiedPurchase === 'true',
      hasImages: hasImages === 'true',
      sortBy: sortBy as 'newest' | 'oldest' | 'helpful' | 'rating_high' | 'rating_low'
    };

    const result = await reviewService.getReviews(
      filters,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 특정 리뷰 조회
 */
export const getReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const review = await reviewService.getReviews(
      { product: id },
      1,
      1
    );

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
  } catch (error) {
    next(error);
  }
};

/**
 * 상품별 리뷰 통계
 */
export const getProductReviewStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const stats = await reviewService.getProductReviewStats(productId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 수정
 */
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const updateData = req.body;

    const review = await reviewService.updateReview(id, userId, updateData);

    res.status(200).json({
      success: true,
      data: review,
      message: '리뷰가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 삭제
 */
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    await reviewService.deleteReview(id, userId);

    res.status(200).json({
      success: true,
      message: '리뷰가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 도움됨 투표
 */
export const voteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isHelpful } = req.body;
    const userId = req.userId!;

    const review = await reviewService.voteHelpful(id, userId, isHelpful);

    res.status(200).json({
      success: true,
      data: {
        helpfulVotes: review.helpfulVotes,
        totalVotes: review.totalVotes
      },
      message: isHelpful ? '도움이 되는 리뷰로 투표했습니다.' : '도움이 되지 않는 리뷰로 투표했습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 답글 작성 (관리자)
 */
export const replyToReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const adminId = req.userId!;

    const review = await reviewService.addReply(id, adminId, comment);

    res.status(200).json({
      success: true,
      data: review,
      message: '답글이 성공적으로 작성되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 검토 (승인/거부) - 관리자
 */
export const moderateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const review = await reviewService.moderateReview(id, status, reason);

    res.status(200).json({
      success: true,
      data: review,
      message: status === 'approved' ? '리뷰가 승인되었습니다.' : '리뷰가 거부되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 검토 대기 중인 리뷰 목록 (관리자)
 */
export const getPendingReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await reviewService.getPendingReviews(
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 가능한 상품 목록
 */
export const getReviewableProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;

    const products = await reviewService.getReviewableProducts(userId);

    res.status(200).json({
      success: true,
      data: products,
      message: `${products.length}개의 리뷰 작성 가능한 상품이 있습니다.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 리뷰 이미지 업로드
 */
export const uploadReviewImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

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

    // 최대 5개 이미지 제한
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

    // Cloudinary에 이미지 업로드
    const uploadPromises = files.map(file =>
      cloudinaryService.uploadFile(file.buffer, {
        folder: 'devyb-shop/reviews',
        quality: 'auto:good',
        format: 'webp',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      })
    );

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
  } catch (error) {
    next(error);
  }
};

/**
 * 사용자별 작성한 리뷰 목록
 */
export const getUserReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 10 } = req.query;

    const result = await reviewService.getReviews(
      { user: userId, sortBy: 'newest' },
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};
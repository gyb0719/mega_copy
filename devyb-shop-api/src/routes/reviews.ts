import express from 'express';
import multer from 'multer';
import {
  createReview,
  getReviews,
  getReview,
  getProductReviewStats,
  updateReview,
  deleteReview,
  voteReview,
  replyToReview,
  moderateReview,
  getPendingReviews,
  getReviewableProducts,
  uploadReviewImages,
  getUserReviews
} from '../controllers/reviewController';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { apiRateLimiters, lenientRateLimiter } from '../middleware/rateLimiter';
import Joi from 'joi';

const router = express.Router();

// Multer 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // 최대 5개 파일
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 검증 스키마
const reviewValidation = {
  create: {
    body: Joi.object({
      product: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': '유효한 상품 ID를 입력해주세요.',
          'any.required': '상품 ID가 필요합니다.'
        }),
      order: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': '유효한 주문 ID를 입력해주세요.',
          'any.required': '주문 ID가 필요합니다.'
        }),
      rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
          'number.min': '평점은 최소 1점입니다.',
          'number.max': '평점은 최대 5점입니다.',
          'any.required': '평점을 입력해주세요.'
        }),
      title: Joi.string()
        .trim()
        .min(5)
        .max(100)
        .required()
        .messages({
          'string.min': '제목은 최소 5자 이상이어야 합니다.',
          'string.max': '제목은 100자를 초과할 수 없습니다.',
          'any.required': '제목을 입력해주세요.'
        }),
      comment: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .required()
        .messages({
          'string.min': '리뷰는 최소 10자 이상이어야 합니다.',
          'string.max': '리뷰는 2000자를 초과할 수 없습니다.',
          'any.required': '리뷰 내용을 입력해주세요.'
        }),
      images: Joi.array()
        .items(Joi.string().uri())
        .max(5)
        .optional()
        .messages({
          'array.max': '이미지는 최대 5개까지 첨부할 수 있습니다.'
        })
    })
  },

  update: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    }),
    body: Joi.object({
      rating: Joi.number().integer().min(1).max(5),
      title: Joi.string().trim().min(5).max(100),
      comment: Joi.string().trim().min(10).max(2000),
      images: Joi.array().items(Joi.string().uri()).max(5)
    }).min(1)
  },

  vote: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    }),
    body: Joi.object({
      isHelpful: Joi.boolean()
        .required()
        .messages({
          'any.required': '투표 종류를 선택해주세요.'
        })
    })
  },

  reply: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    }),
    body: Joi.object({
      comment: Joi.string()
        .trim()
        .min(5)
        .max(1000)
        .required()
        .messages({
          'string.min': '답글은 최소 5자 이상이어야 합니다.',
          'string.max': '답글은 1000자를 초과할 수 없습니다.',
          'any.required': '답글 내용을 입력해주세요.'
        })
    })
  },

  moderate: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    }),
    body: Joi.object({
      status: Joi.string()
        .valid('approved', 'rejected')
        .required()
        .messages({
          'any.only': '상태는 approved 또는 rejected만 가능합니다.',
          'any.required': '상태를 선택해주세요.'
        }),
      reason: Joi.string()
        .trim()
        .max(500)
        .when('status', {
          is: 'rejected',
          then: Joi.required(),
          otherwise: Joi.optional()
        })
        .messages({
          'string.max': '사유는 500자를 초과할 수 없습니다.',
          'any.required': '거부 사유를 입력해주세요.'
        })
    })
  },

  getReviews: {
    query: Joi.object({
      product: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      user: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      rating: Joi.number().integer().min(1).max(5),
      minRating: Joi.number().integer().min(1).max(5),
      maxRating: Joi.number().integer().min(1).max(5),
      isVerifiedPurchase: Joi.boolean(),
      hasImages: Joi.boolean(),
      sortBy: Joi.string().valid('newest', 'oldest', 'helpful', 'rating_high', 'rating_low').default('newest'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(10)
    })
  },

  getProductStats: {
    params: Joi.object({
      productId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': '유효한 상품 ID를 입력해주세요.'
        })
    })
  },

  getId: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    })
  }
};

// 공개 라우트
router.get('/', lenientRateLimiter, validate(reviewValidation.getReviews), optionalAuth, getReviews);
router.get('/product/:productId/stats', lenientRateLimiter, validate(reviewValidation.getProductStats), getProductReviewStats);
router.get('/:id', lenientRateLimiter, validate(reviewValidation.getId), optionalAuth, getReview);

// 인증 필요 라우트
router.post('/', authenticate, apiRateLimiters.createReview, validate(reviewValidation.create), createReview);
router.put('/:id', authenticate, validate(reviewValidation.update), updateReview);
router.delete('/:id', authenticate, validate(reviewValidation.getId), deleteReview);
router.post('/:id/vote', authenticate, validate(reviewValidation.vote), voteReview);
router.get('/user/my-reviews', authenticate, getUserReviews);
router.get('/user/reviewable-products', authenticate, getReviewableProducts);

// 이미지 업로드
router.post('/images/upload', 
  authenticate,
  apiRateLimiters.fileUpload,
  upload.array('images', 5),
  uploadReviewImages
);

// 관리자 전용 라우트
router.get('/admin/pending', authenticate, requireAdmin, getPendingReviews);
router.post('/:id/reply', authenticate, requireAdmin, validate(reviewValidation.reply), replyToReview);
router.patch('/:id/moderate', authenticate, requireAdmin, validate(reviewValidation.moderate), moderateReview);

export default router;
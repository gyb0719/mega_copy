"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const reviewController_1 = require("../controllers/reviewController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    }
});
const reviewValidation = {
    create: {
        body: joi_1.default.object({
            product: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
                .messages({
                'string.pattern.base': '유효한 상품 ID를 입력해주세요.',
                'any.required': '상품 ID가 필요합니다.'
            }),
            order: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
                .messages({
                'string.pattern.base': '유효한 주문 ID를 입력해주세요.',
                'any.required': '주문 ID가 필요합니다.'
            }),
            rating: joi_1.default.number()
                .integer()
                .min(1)
                .max(5)
                .required()
                .messages({
                'number.min': '평점은 최소 1점입니다.',
                'number.max': '평점은 최대 5점입니다.',
                'any.required': '평점을 입력해주세요.'
            }),
            title: joi_1.default.string()
                .trim()
                .min(5)
                .max(100)
                .required()
                .messages({
                'string.min': '제목은 최소 5자 이상이어야 합니다.',
                'string.max': '제목은 100자를 초과할 수 없습니다.',
                'any.required': '제목을 입력해주세요.'
            }),
            comment: joi_1.default.string()
                .trim()
                .min(10)
                .max(2000)
                .required()
                .messages({
                'string.min': '리뷰는 최소 10자 이상이어야 합니다.',
                'string.max': '리뷰는 2000자를 초과할 수 없습니다.',
                'any.required': '리뷰 내용을 입력해주세요.'
            }),
            images: joi_1.default.array()
                .items(joi_1.default.string().uri())
                .max(5)
                .optional()
                .messages({
                'array.max': '이미지는 최대 5개까지 첨부할 수 있습니다.'
            })
        })
    },
    update: {
        params: joi_1.default.object({
            id: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
        }),
        body: joi_1.default.object({
            rating: joi_1.default.number().integer().min(1).max(5),
            title: joi_1.default.string().trim().min(5).max(100),
            comment: joi_1.default.string().trim().min(10).max(2000),
            images: joi_1.default.array().items(joi_1.default.string().uri()).max(5)
        }).min(1)
    },
    vote: {
        params: joi_1.default.object({
            id: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
        }),
        body: joi_1.default.object({
            isHelpful: joi_1.default.boolean()
                .required()
                .messages({
                'any.required': '투표 종류를 선택해주세요.'
            })
        })
    },
    reply: {
        params: joi_1.default.object({
            id: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
        }),
        body: joi_1.default.object({
            comment: joi_1.default.string()
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
        params: joi_1.default.object({
            id: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
        }),
        body: joi_1.default.object({
            status: joi_1.default.string()
                .valid('approved', 'rejected')
                .required()
                .messages({
                'any.only': '상태는 approved 또는 rejected만 가능합니다.',
                'any.required': '상태를 선택해주세요.'
            }),
            reason: joi_1.default.string()
                .trim()
                .max(500)
                .when('status', {
                is: 'rejected',
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            })
                .messages({
                'string.max': '사유는 500자를 초과할 수 없습니다.',
                'any.required': '거부 사유를 입력해주세요.'
            })
        })
    },
    getReviews: {
        query: joi_1.default.object({
            product: joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/),
            user: joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/),
            rating: joi_1.default.number().integer().min(1).max(5),
            minRating: joi_1.default.number().integer().min(1).max(5),
            maxRating: joi_1.default.number().integer().min(1).max(5),
            isVerifiedPurchase: joi_1.default.boolean(),
            hasImages: joi_1.default.boolean(),
            sortBy: joi_1.default.string().valid('newest', 'oldest', 'helpful', 'rating_high', 'rating_low').default('newest'),
            page: joi_1.default.number().integer().min(1).default(1),
            limit: joi_1.default.number().integer().min(1).max(50).default(10)
        })
    },
    getProductStats: {
        params: joi_1.default.object({
            productId: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
                .messages({
                'string.pattern.base': '유효한 상품 ID를 입력해주세요.'
            })
        })
    },
    getId: {
        params: joi_1.default.object({
            id: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
        })
    }
};
router.get('/', rateLimiter_1.lenientRateLimiter, (0, validation_1.validate)(reviewValidation.getReviews), auth_1.optionalAuth, reviewController_1.getReviews);
router.get('/product/:productId/stats', rateLimiter_1.lenientRateLimiter, (0, validation_1.validate)(reviewValidation.getProductStats), reviewController_1.getProductReviewStats);
router.get('/:id', rateLimiter_1.lenientRateLimiter, (0, validation_1.validate)(reviewValidation.getId), auth_1.optionalAuth, reviewController_1.getReview);
router.post('/', auth_1.authenticate, rateLimiter_1.apiRateLimiters.createReview, (0, validation_1.validate)(reviewValidation.create), reviewController_1.createReview);
router.put('/:id', auth_1.authenticate, (0, validation_1.validate)(reviewValidation.update), reviewController_1.updateReview);
router.delete('/:id', auth_1.authenticate, (0, validation_1.validate)(reviewValidation.getId), reviewController_1.deleteReview);
router.post('/:id/vote', auth_1.authenticate, (0, validation_1.validate)(reviewValidation.vote), reviewController_1.voteReview);
router.get('/user/my-reviews', auth_1.authenticate, reviewController_1.getUserReviews);
router.get('/user/reviewable-products', auth_1.authenticate, reviewController_1.getReviewableProducts);
router.post('/images/upload', auth_1.authenticate, rateLimiter_1.apiRateLimiters.fileUpload, upload.array('images', 5), reviewController_1.uploadReviewImages);
router.get('/admin/pending', auth_1.authenticate, auth_1.requireAdmin, reviewController_1.getPendingReviews);
router.post('/:id/reply', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validate)(reviewValidation.reply), reviewController_1.replyToReview);
router.patch('/:id/moderate', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validate)(reviewValidation.moderate), reviewController_1.moderateReview);
exports.default = router;
//# sourceMappingURL=reviews.js.map
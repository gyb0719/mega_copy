import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getPopularProducts,
  getNewProducts,
  getDiscountedProducts,
  getSearchSuggestions,
  updateStock,
  uploadProductImages,
  getCategoryStats
} from '../controllers/productController';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth';
import { validate, productValidation } from '../middleware/validation';
import { apiRateLimiters, lenientRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Multer 설정 (메모리 스토리지)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // 최대 10개 파일
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 공개 라우트 (인증 불필요)
router.get('/', lenientRateLimiter, validate(productValidation.getProducts), optionalAuth, getProducts);
router.get('/popular', lenientRateLimiter, getPopularProducts);
router.get('/new', lenientRateLimiter, getNewProducts);
router.get('/discounted', lenientRateLimiter, getDiscountedProducts);
router.get('/search/suggestions', apiRateLimiters.search, getSearchSuggestions);
router.get('/stats/categories', lenientRateLimiter, getCategoryStats);
router.get('/:id', lenientRateLimiter, validate(productValidation.getById), optionalAuth, getProduct);

// 관리자 전용 라우트
router.post('/', authenticate, requireAdmin, validate(productValidation.create), createProduct);
router.put('/:id', authenticate, requireAdmin, validate(productValidation.update), updateProduct);
router.delete('/:id', authenticate, requireAdmin, validate(productValidation.getById), deleteProduct);

// 재고 관리
router.patch('/:id/stock', authenticate, requireAdmin, updateStock);

// 이미지 업로드
router.post('/images/upload', 
  authenticate, 
  requireAdmin, 
  apiRateLimiters.fileUpload,
  upload.array('images', 10), 
  uploadProductImages
);

export default router;
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
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
router.get('/', rateLimiter_1.lenientRateLimiter, (0, validation_1.validate)(validation_1.productValidation.getProducts), auth_1.optionalAuth, productController_1.getProducts);
router.get('/popular', rateLimiter_1.lenientRateLimiter, productController_1.getPopularProducts);
router.get('/new', rateLimiter_1.lenientRateLimiter, productController_1.getNewProducts);
router.get('/discounted', rateLimiter_1.lenientRateLimiter, productController_1.getDiscountedProducts);
router.get('/search/suggestions', rateLimiter_1.apiRateLimiters.search, productController_1.getSearchSuggestions);
router.get('/stats/categories', rateLimiter_1.lenientRateLimiter, productController_1.getCategoryStats);
router.get('/:id', rateLimiter_1.lenientRateLimiter, (0, validation_1.validate)(validation_1.productValidation.getById), auth_1.optionalAuth, productController_1.getProduct);
router.post('/', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validate)(validation_1.productValidation.create), productController_1.createProduct);
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validate)(validation_1.productValidation.update), productController_1.updateProduct);
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validate)(validation_1.productValidation.getById), productController_1.deleteProduct);
router.patch('/:id/stock', auth_1.authenticate, auth_1.requireAdmin, productController_1.updateStock);
router.post('/images/upload', auth_1.authenticate, auth_1.requireAdmin, rateLimiter_1.apiRateLimiters.fileUpload, upload.array('images', 10), productController_1.uploadProductImages);
exports.default = router;
//# sourceMappingURL=products.js.map
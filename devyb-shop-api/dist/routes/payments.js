"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const paymentValidation = {
    createPaymentIntent: {
        body: joi_1.default.object({
            orderId: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
                .messages({
                'string.pattern.base': '유효한 주문 ID를 입력해주세요.',
                'any.required': '주문 ID가 필요합니다.'
            })
        })
    },
    refundPayment: {
        params: joi_1.default.object({
            paymentIntentId: joi_1.default.string().required()
        }),
        body: joi_1.default.object({
            amount: joi_1.default.number().min(1).optional(),
            reason: joi_1.default.string()
                .valid('duplicate', 'fraudulent', 'requested_by_customer')
                .default('requested_by_customer')
        })
    },
    savePaymentMethod: {
        body: joi_1.default.object({
            paymentMethodId: joi_1.default.string().required().messages({
                'any.required': '결제 방법 ID가 필요합니다.'
            })
        })
    },
    getPaymentStats: {
        query: joi_1.default.object({
            startDate: joi_1.default.date().iso().optional(),
            endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate')).optional()
        })
    },
    getOrderPayment: {
        params: joi_1.default.object({
            orderId: joi_1.default.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required()
                .messages({
                'string.pattern.base': '유효한 주문 ID를 입력해주세요.'
            })
        })
    }
};
router.post('/create-payment-intent', auth_1.authenticate, rateLimiter_1.apiRateLimiters.createOrder, (0, validation_1.validate)(paymentValidation.createPaymentIntent), paymentController_1.createPaymentIntent);
router.get('/status/:paymentIntentId', auth_1.authenticate, paymentController_1.getPaymentStatus);
router.post('/:paymentIntentId/refund', auth_1.authenticate, auth_1.requireAdmin, rateLimiter_1.strictRateLimiter, (0, validation_1.validate)(paymentValidation.refundPayment), paymentController_1.refundPayment);
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), paymentController_1.handleWebhook);
router.post('/payment-methods', auth_1.authenticate, (0, validation_1.validate)(paymentValidation.savePaymentMethod), paymentController_1.savePaymentMethod);
router.get('/payment-methods', auth_1.authenticate, paymentController_1.getPaymentMethods);
router.get('/stats', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validate)(paymentValidation.getPaymentStats), paymentController_1.getPaymentStats);
router.get('/orders/:orderId', auth_1.authenticate, (0, validation_1.validate)(paymentValidation.getOrderPayment), paymentController_1.getOrderPayment);
exports.default = router;
//# sourceMappingURL=payments.js.map
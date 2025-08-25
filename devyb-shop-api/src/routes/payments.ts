import express from 'express';
import {
  createPaymentIntent,
  getPaymentStatus,
  refundPayment,
  handleWebhook,
  savePaymentMethod,
  getPaymentMethods,
  getPaymentStats,
  getOrderPayment
} from '../controllers/paymentController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { apiRateLimiters, strictRateLimiter } from '../middleware/rateLimiter';
import Joi from 'joi';

const router = express.Router();

// 결제 관련 검증 스키마
const paymentValidation = {
  createPaymentIntent: {
    body: Joi.object({
      orderId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': '유효한 주문 ID를 입력해주세요.',
          'any.required': '주문 ID가 필요합니다.'
        })
    })
  },

  refundPayment: {
    params: Joi.object({
      paymentIntentId: Joi.string().required()
    }),
    body: Joi.object({
      amount: Joi.number().min(1).optional(),
      reason: Joi.string()
        .valid('duplicate', 'fraudulent', 'requested_by_customer')
        .default('requested_by_customer')
    })
  },

  savePaymentMethod: {
    body: Joi.object({
      paymentMethodId: Joi.string().required().messages({
        'any.required': '결제 방법 ID가 필요합니다.'
      })
    })
  },

  getPaymentStats: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
    })
  },

  getOrderPayment: {
    params: Joi.object({
      orderId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': '유효한 주문 ID를 입력해주세요.'
        })
    })
  }
};

// 결제 인텐트 생성
router.post('/create-payment-intent',
  authenticate,
  apiRateLimiters.createOrder,
  validate(paymentValidation.createPaymentIntent),
  createPaymentIntent
);

// 결제 상태 확인
router.get('/status/:paymentIntentId',
  authenticate,
  getPaymentStatus
);

// 환불 처리 (관리자)
router.post('/:paymentIntentId/refund',
  authenticate,
  requireAdmin,
  strictRateLimiter,
  validate(paymentValidation.refundPayment),
  refundPayment
);

// Stripe 웹훅 (인증 불필요 - Stripe에서 직접 호출)
router.post('/webhook',
  express.raw({ type: 'application/json' }), // raw body가 필요
  handleWebhook
);

// 결제 방법 저장
router.post('/payment-methods',
  authenticate,
  validate(paymentValidation.savePaymentMethod),
  savePaymentMethod
);

// 저장된 결제 방법 목록
router.get('/payment-methods',
  authenticate,
  getPaymentMethods
);

// 결제 통계 (관리자)
router.get('/stats',
  authenticate,
  requireAdmin,
  validate(paymentValidation.getPaymentStats),
  getPaymentStats
);

// 주문별 결제 정보
router.get('/orders/:orderId',
  authenticate,
  validate(paymentValidation.getOrderPayment),
  getOrderPayment
);

export default router;
import express from 'express';
import {
  getDashboardStats,
  getSalesReport,
  getRealTimeStats,
  getProductPerformance,
  getUserAnalytics,
  getOrderAnalytics,
  getRecentActivity,
  getDashboardAlerts
} from '../controllers/dashboardController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { lenientRateLimiter } from '../middleware/rateLimiter';
import Joi from 'joi';

const router = express.Router();

// 검증 스키마
const dashboardValidation = {
  getDashboardStats: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
    })
  },

  getSalesReport: {
    query: Joi.object({
      period: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
    })
  },

  getProductPerformance: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(20),
      sortBy: Joi.string().valid('revenue', 'sales').default('revenue')
    })
  },

  getUserAnalytics: {
    query: Joi.object({
      days: Joi.number().integer().min(1).max(365).default(30)
    })
  },

  getOrderAnalytics: {
    query: Joi.object({
      days: Joi.number().integer().min(1).max(365).default(30)
    })
  },

  getRecentActivity: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(50).default(10)
    })
  }
};

// 모든 라우트는 관리자 권한 필요
router.use(authenticate);
router.use(requireAdmin);
router.use(lenientRateLimiter);

// 전체 대시보드 통계
router.get('/stats',
  validate(dashboardValidation.getDashboardStats),
  getDashboardStats
);

// 매출 리포트
router.get('/sales-report',
  validate(dashboardValidation.getSalesReport),
  getSalesReport
);

// 실시간 통계
router.get('/realtime',
  getRealTimeStats
);

// 상품 성과 분석
router.get('/products/performance',
  validate(dashboardValidation.getProductPerformance),
  getProductPerformance
);

// 사용자 분석
router.get('/users/analytics',
  validate(dashboardValidation.getUserAnalytics),
  getUserAnalytics
);

// 주문 분석
router.get('/orders/analytics',
  validate(dashboardValidation.getOrderAnalytics),
  getOrderAnalytics
);

// 최근 활동
router.get('/activity',
  validate(dashboardValidation.getRecentActivity),
  getRecentActivity
);

// 대시보드 알림
router.get('/alerts',
  getDashboardAlerts
);

export default router;
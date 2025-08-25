"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboardController_1 = require("../controllers/dashboardController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const dashboardValidation = {
    getDashboardStats: {
        query: joi_1.default.object({
            startDate: joi_1.default.date().iso().optional(),
            endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate')).optional()
        })
    },
    getSalesReport: {
        query: joi_1.default.object({
            period: joi_1.default.string().valid('daily', 'weekly', 'monthly').default('daily'),
            startDate: joi_1.default.date().iso().optional(),
            endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate')).optional()
        })
    },
    getProductPerformance: {
        query: joi_1.default.object({
            limit: joi_1.default.number().integer().min(1).max(100).default(20),
            sortBy: joi_1.default.string().valid('revenue', 'sales').default('revenue')
        })
    },
    getUserAnalytics: {
        query: joi_1.default.object({
            days: joi_1.default.number().integer().min(1).max(365).default(30)
        })
    },
    getOrderAnalytics: {
        query: joi_1.default.object({
            days: joi_1.default.number().integer().min(1).max(365).default(30)
        })
    },
    getRecentActivity: {
        query: joi_1.default.object({
            limit: joi_1.default.number().integer().min(1).max(50).default(10)
        })
    }
};
router.use(auth_1.authenticate);
router.use(auth_1.requireAdmin);
router.use(rateLimiter_1.lenientRateLimiter);
router.get('/stats', (0, validation_1.validate)(dashboardValidation.getDashboardStats), dashboardController_1.getDashboardStats);
router.get('/sales-report', (0, validation_1.validate)(dashboardValidation.getSalesReport), dashboardController_1.getSalesReport);
router.get('/realtime', dashboardController_1.getRealTimeStats);
router.get('/products/performance', (0, validation_1.validate)(dashboardValidation.getProductPerformance), dashboardController_1.getProductPerformance);
router.get('/users/analytics', (0, validation_1.validate)(dashboardValidation.getUserAnalytics), dashboardController_1.getUserAnalytics);
router.get('/orders/analytics', (0, validation_1.validate)(dashboardValidation.getOrderAnalytics), dashboardController_1.getOrderAnalytics);
router.get('/activity', (0, validation_1.validate)(dashboardValidation.getRecentActivity), dashboardController_1.getRecentActivity);
router.get('/alerts', dashboardController_1.getDashboardAlerts);
exports.default = router;
//# sourceMappingURL=dashboard.js.map
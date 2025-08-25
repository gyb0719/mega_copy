"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAlerts = exports.getRecentActivity = exports.getOrderAnalytics = exports.getUserAnalytics = exports.getProductPerformance = exports.getRealTimeStats = exports.getSalesReport = exports.getDashboardStats = void 0;
const dashboardService_1 = __importDefault(require("../services/dashboardService"));
const dashboardService = dashboardService_1.default.getInstance();
const getDashboardStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const defaultEndDate = new Date();
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        const dateRange = {
            start: startDate ? new Date(startDate) : defaultStartDate,
            end: endDate ? new Date(endDate) : defaultEndDate
        };
        const stats = await dashboardService.getDashboardStats(dateRange);
        res.status(200).json({
            success: true,
            data: stats,
            period: {
                startDate: dateRange.start,
                endDate: dateRange.end
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
const getSalesReport = async (req, res, next) => {
    try {
        const { period = 'daily', startDate, endDate } = req.query;
        const defaultEndDate = new Date();
        const defaultStartDate = new Date();
        switch (period) {
            case 'weekly':
                defaultStartDate.setDate(defaultStartDate.getDate() - 84);
                break;
            case 'monthly':
                defaultStartDate.setMonth(defaultStartDate.getMonth() - 12);
                break;
            default:
                defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        }
        const start = startDate ? new Date(startDate) : defaultStartDate;
        const end = endDate ? new Date(endDate) : defaultEndDate;
        const report = await dashboardService.generateSalesReport(period, start, end);
        res.status(200).json({
            success: true,
            data: report,
            period: {
                type: period,
                startDate: start,
                endDate: end
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesReport = getSalesReport;
const getRealTimeStats = async (_req, res, next) => {
    try {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const stats = await dashboardService.getDashboardStats({
            start: yesterday,
            end: today
        });
        const realTimeData = {
            todayOrders: stats.recentActivity.pendingOrders,
            todayRevenue: stats.salesData.dailySales[stats.salesData.dailySales.length - 1]?.sales || 0,
            activeUsers: stats.userAnalytics.activeUsers.daily,
            pendingReviews: stats.recentActivity.pendingReviews,
            lowStockAlert: stats.productAnalytics.lowStockProducts.length,
            outOfStock: stats.productAnalytics.outOfStockCount,
            conversionRate: stats.overview.conversionRate,
            averageOrderValue: stats.overview.averageOrderValue
        };
        res.status(200).json({
            success: true,
            data: realTimeData,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRealTimeStats = getRealTimeStats;
const getProductPerformance = async (req, res, next) => {
    try {
        const { limit = 20, sortBy = 'revenue' } = req.query;
        const stats = await dashboardService.getDashboardStats({
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
        });
        let performanceData = stats.salesData.topProducts;
        if (sortBy === 'sales') {
            performanceData.sort((a, b) => b.sales - a.sales);
        }
        else if (sortBy === 'revenue') {
            performanceData.sort((a, b) => b.revenue - a.revenue);
        }
        performanceData = performanceData.slice(0, Number(limit));
        res.status(200).json({
            success: true,
            data: {
                topProducts: performanceData,
                lowStockProducts: stats.productAnalytics.lowStockProducts,
                topRatedProducts: stats.productAnalytics.topRatedProducts,
                categoryPerformance: stats.salesData.salesByCategory
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductPerformance = getProductPerformance;
const getUserAnalytics = async (req, res, next) => {
    try {
        const { days = 30 } = req.query;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        const stats = await dashboardService.getDashboardStats({
            start: startDate,
            end: endDate
        });
        res.status(200).json({
            success: true,
            data: {
                userGrowth: stats.userAnalytics.userGrowth,
                activeUsers: stats.userAnalytics.activeUsers,
                usersByRegion: stats.userAnalytics.usersByRegion,
                recentUsers: stats.recentActivity.recentUsers,
                totalUsers: stats.overview.totalUsers,
                newUsersThisMonth: stats.overview.newUsersThisMonth
            },
            period: {
                days: Number(days),
                startDate,
                endDate
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserAnalytics = getUserAnalytics;
const getOrderAnalytics = async (req, res, next) => {
    try {
        const { days = 30 } = req.query;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        const stats = await dashboardService.getDashboardStats({
            start: startDate,
            end: endDate
        });
        res.status(200).json({
            success: true,
            data: {
                ordersByStatus: stats.orderAnalytics.ordersByStatus,
                averageDeliveryTime: stats.orderAnalytics.averageDeliveryTime,
                returnRate: stats.orderAnalytics.returnRate,
                cancelledOrderRate: stats.orderAnalytics.cancelledOrderRate,
                recentOrders: stats.recentActivity.recentOrders,
                totalOrders: stats.overview.totalOrders,
                averageOrderValue: stats.overview.averageOrderValue,
                newOrdersThisWeek: stats.overview.newOrdersThisWeek
            },
            period: {
                days: Number(days),
                startDate,
                endDate
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderAnalytics = getOrderAnalytics;
const getRecentActivity = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const stats = await dashboardService.getDashboardStats({
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date()
        });
        const activity = stats.recentActivity;
        res.status(200).json({
            success: true,
            data: {
                recentOrders: activity.recentOrders.slice(0, Number(limit)),
                recentUsers: activity.recentUsers.slice(0, Number(limit)),
                recentReviews: activity.recentReviews.slice(0, Number(limit)),
                pending: {
                    orders: activity.pendingOrders,
                    reviews: activity.pendingReviews
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecentActivity = getRecentActivity;
const getDashboardAlerts = async (_req, res, next) => {
    try {
        const stats = await dashboardService.getDashboardStats({
            start: new Date(Date.now() - 24 * 60 * 60 * 1000),
            end: new Date()
        });
        const alerts = [];
        if (stats.productAnalytics.lowStockProducts.length > 0) {
            alerts.push({
                type: 'warning',
                title: '재고 부족 상품',
                message: `${stats.productAnalytics.lowStockProducts.length}개 상품의 재고가 부족합니다.`,
                count: stats.productAnalytics.lowStockProducts.length,
                action: 'view_products'
            });
        }
        if (stats.productAnalytics.outOfStockCount > 0) {
            alerts.push({
                type: 'error',
                title: '품절 상품',
                message: `${stats.productAnalytics.outOfStockCount}개 상품이 품절되었습니다.`,
                count: stats.productAnalytics.outOfStockCount,
                action: 'view_products'
            });
        }
        if (stats.recentActivity.pendingReviews > 0) {
            alerts.push({
                type: 'info',
                title: '검토 대기 리뷰',
                message: `${stats.recentActivity.pendingReviews}개의 리뷰가 검토를 기다리고 있습니다.`,
                count: stats.recentActivity.pendingReviews,
                action: 'view_reviews'
            });
        }
        if (stats.recentActivity.pendingOrders > 0) {
            alerts.push({
                type: 'warning',
                title: '처리 대기 주문',
                message: `${stats.recentActivity.pendingOrders}개의 주문이 처리를 기다리고 있습니다.`,
                count: stats.recentActivity.pendingOrders,
                action: 'view_orders'
            });
        }
        if (stats.orderAnalytics.cancelledOrderRate > 10) {
            alerts.push({
                type: 'warning',
                title: '높은 주문 취소율',
                message: `주문 취소율이 ${stats.orderAnalytics.cancelledOrderRate}%입니다.`,
                value: stats.orderAnalytics.cancelledOrderRate,
                action: 'view_analytics'
            });
        }
        res.status(200).json({
            success: true,
            data: {
                alerts,
                alertCount: alerts.length
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardAlerts = getDashboardAlerts;
//# sourceMappingURL=dashboardController.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const Review_1 = __importDefault(require("../models/Review"));
const paymentService_1 = __importDefault(require("./paymentService"));
class DashboardService {
    static instance;
    paymentService;
    constructor() {
        this.paymentService = paymentService_1.default.getInstance();
    }
    static getInstance() {
        if (!DashboardService.instance) {
            DashboardService.instance = new DashboardService();
        }
        return DashboardService.instance;
    }
    async getDashboardStats(dateRange) {
        try {
            const [overview, salesData, userAnalytics, orderAnalytics, productAnalytics, recentActivity] = await Promise.all([
                this.getOverviewStats(dateRange),
                this.getSalesData(dateRange),
                this.getUserAnalytics(dateRange),
                this.getOrderAnalytics(dateRange),
                this.getProductAnalytics(),
                this.getRecentActivity()
            ]);
            return {
                overview,
                salesData,
                userAnalytics,
                orderAnalytics,
                productAnalytics,
                recentActivity
            };
        }
        catch (error) {
            console.error('대시보드 통계 조회 오류:', error);
            throw new Error('대시보드 통계 조회 중 오류가 발생했습니다.');
        }
    }
    async getOverviewStats(dateRange) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const [totalUsers, totalProducts, totalOrders, totalRevenue, newUsersThisMonth, newOrdersThisWeek, orderValueStats] = await Promise.all([
            User_1.default.countDocuments(),
            Product_1.default.countDocuments(),
            Order_1.default.countDocuments(),
            Order_1.default.aggregate([
                { $match: { isPaid: true } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]),
            User_1.default.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
            Order_1.default.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
            Order_1.default.aggregate([
                { $match: { isPaid: true } },
                { $group: { _id: null, avgOrder: { $avg: '$totalPrice' } } }
            ])
        ]);
        const revenue = totalRevenue[0]?.total || 0;
        const avgOrderValue = orderValueStats[0]?.avgOrder || 0;
        const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;
        return {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: Math.round(revenue),
            newUsersThisMonth,
            newOrdersThisWeek,
            averageOrderValue: Math.round(avgOrderValue),
            conversionRate: Math.round(conversionRate * 100) / 100
        };
    }
    async getSalesData(dateRange) {
        const [dailySales, monthlySales, topProducts, salesByCategory] = await Promise.all([
            Order_1.default.aggregate([
                {
                    $match: {
                        isPaid: true,
                        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        sales: { $sum: '$totalPrice' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $limit: 30 }
            ]),
            Order_1.default.aggregate([
                {
                    $match: { isPaid: true }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                        sales: { $sum: '$totalPrice' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $limit: 12 }
            ]),
            Order_1.default.aggregate([
                { $match: { isPaid: true } },
                { $unwind: '$orderItems' },
                {
                    $group: {
                        _id: '$orderItems.product',
                        sales: { $sum: '$orderItems.quantity' },
                        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
                    }
                },
                { $sort: { sales: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' }
            ]),
            Order_1.default.aggregate([
                { $match: { isPaid: true } },
                { $unwind: '$orderItems' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'orderItems.product',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $group: {
                        _id: '$product.category',
                        sales: { $sum: '$orderItems.quantity' }
                    }
                },
                { $sort: { sales: -1 } }
            ])
        ]);
        const totalCategorySales = salesByCategory.reduce((sum, cat) => sum + cat.sales, 0);
        const categoriesWithPercentage = salesByCategory.map(cat => ({
            category: cat._id,
            sales: cat.sales,
            percentage: totalCategorySales > 0 ? Math.round((cat.sales / totalCategorySales) * 100) : 0
        }));
        return {
            dailySales: dailySales.map(item => ({
                date: item._id,
                sales: Math.round(item.sales),
                orders: item.orders
            })),
            monthlySales: monthlySales.map(item => ({
                month: item._id,
                sales: Math.round(item.sales),
                orders: item.orders
            })),
            topProducts: topProducts.map(item => ({
                product: item.product,
                sales: item.sales,
                revenue: Math.round(item.revenue)
            })),
            salesByCategory: categoriesWithPercentage
        };
    }
    async getUserAnalytics(dateRange) {
        const [userGrowth, usersByRegion, activeUsers] = await Promise.all([
            User_1.default.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        newUsers: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $limit: 30 }
            ]),
            User_1.default.aggregate([
                { $match: { 'address.city': { $exists: true, $ne: '' } } },
                {
                    $group: {
                        _id: '$address.city',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            Promise.all([
                Order_1.default.distinct('user', { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }).then(users => users.length),
                Order_1.default.distinct('user', { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).then(users => users.length),
                Order_1.default.distinct('user', { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }).then(users => users.length)
            ])
        ]);
        let totalUsers = 0;
        const userGrowthWithTotal = userGrowth.map(item => {
            totalUsers += item.newUsers;
            return {
                date: item._id,
                totalUsers,
                newUsers: item.newUsers
            };
        });
        return {
            userGrowth: userGrowthWithTotal,
            usersByRegion: usersByRegion.map(item => ({
                region: item._id,
                count: item.count
            })),
            activeUsers: {
                daily: activeUsers[0],
                weekly: activeUsers[1],
                monthly: activeUsers[2]
            }
        };
    }
    async getOrderAnalytics(dateRange) {
        const [ordersByStatus, deliveryTimeStats, returnStats] = await Promise.all([
            Order_1.default.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Order_1.default.aggregate([
                {
                    $match: {
                        isDelivered: true,
                        deliveredAt: { $exists: true },
                        createdAt: { $exists: true }
                    }
                },
                {
                    $project: {
                        deliveryTime: {
                            $divide: [
                                { $subtract: ['$deliveredAt', '$createdAt'] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgDeliveryTime: { $avg: '$deliveryTime' }
                    }
                }
            ]),
            Order_1.default.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        returned: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } },
                        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
                    }
                }
            ])
        ]);
        const totalOrders = ordersByStatus.reduce((sum, item) => sum + item.count, 0);
        const ordersWithPercentage = ordersByStatus.map(item => ({
            status: item._id,
            count: item.count,
            percentage: totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0
        }));
        const avgDeliveryTime = deliveryTimeStats[0]?.avgDeliveryTime || 0;
        const returnRate = returnStats[0] ? (returnStats[0].returned / returnStats[0].total) * 100 : 0;
        const cancelledRate = returnStats[0] ? (returnStats[0].cancelled / returnStats[0].total) * 100 : 0;
        return {
            ordersByStatus: ordersWithPercentage,
            averageDeliveryTime: Math.round(avgDeliveryTime * 10) / 10,
            returnRate: Math.round(returnRate * 100) / 100,
            cancelledOrderRate: Math.round(cancelledRate * 100) / 100
        };
    }
    async getProductAnalytics() {
        const [lowStockProducts, topRatedProducts, outOfStockCount, categories] = await Promise.all([
            Product_1.default.find({ stock: { $lt: 10 }, status: 'active' })
                .select('name stock images')
                .sort({ stock: 1 })
                .limit(10),
            Product_1.default.find({ ratings: { $gte: 4.0 }, numReviews: { $gte: 5 } })
                .select('name ratings numReviews images')
                .sort({ ratings: -1, numReviews: -1 })
                .limit(10),
            Product_1.default.countDocuments({ stock: 0, status: 'active' }),
            Product_1.default.distinct('category')
        ]);
        return {
            lowStockProducts: lowStockProducts.map(product => ({
                product,
                stock: product.stock
            })),
            topRatedProducts: topRatedProducts.map(product => ({
                product,
                rating: product.ratings,
                reviews: product.numReviews
            })),
            outOfStockCount,
            totalCategories: categories.length
        };
    }
    async getRecentActivity() {
        const [recentOrders, recentUsers, recentReviews, pendingOrders, pendingReviews] = await Promise.all([
            Order_1.default.find()
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(10)
                .select('user totalPrice status createdAt orderItems'),
            User_1.default.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .select('name email createdAt isVerified'),
            Review_1.default.find({ status: 'approved' })
                .populate('user', 'name')
                .populate('product', 'name')
                .sort({ createdAt: -1 })
                .limit(10)
                .select('user product rating title createdAt'),
            Order_1.default.countDocuments({ status: 'pending' }),
            Review_1.default.countDocuments({ status: 'pending' })
        ]);
        return {
            recentOrders,
            recentUsers,
            recentReviews,
            pendingOrders,
            pendingReviews
        };
    }
    async generateSalesReport(period, startDate, endDate) {
        try {
            let groupFormat;
            switch (period) {
                case 'daily':
                    groupFormat = '%Y-%m-%d';
                    break;
                case 'weekly':
                    groupFormat = '%Y-%U';
                    break;
                case 'monthly':
                    groupFormat = '%Y-%m';
                    break;
                default:
                    groupFormat = '%Y-%m-%d';
            }
            const salesReport = await Order_1.default.aggregate([
                {
                    $match: {
                        isPaid: true,
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
                        totalSales: { $sum: '$totalPrice' },
                        totalOrders: { $sum: 1 },
                        averageOrderValue: { $avg: '$totalPrice' },
                        totalItems: {
                            $sum: {
                                $sum: {
                                    $map: {
                                        input: '$orderItems',
                                        as: 'item',
                                        in: '$$item.quantity'
                                    }
                                }
                            }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            return salesReport.map(item => ({
                period: item._id,
                totalSales: Math.round(item.totalSales),
                totalOrders: item.totalOrders,
                averageOrderValue: Math.round(item.averageOrderValue),
                totalItems: item.totalItems
            }));
        }
        catch (error) {
            console.error('매출 리포트 생성 오류:', error);
            throw new Error('매출 리포트 생성 중 오류가 발생했습니다.');
        }
    }
}
exports.default = DashboardService;
//# sourceMappingURL=dashboardService.js.map
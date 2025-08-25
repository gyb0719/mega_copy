export interface DashboardStats {
    overview: {
        totalUsers: number;
        totalProducts: number;
        totalOrders: number;
        totalRevenue: number;
        newUsersThisMonth: number;
        newOrdersThisWeek: number;
        averageOrderValue: number;
        conversionRate: number;
    };
    salesData: {
        dailySales: Array<{
            date: string;
            sales: number;
            orders: number;
        }>;
        monthlySales: Array<{
            month: string;
            sales: number;
            orders: number;
        }>;
        topProducts: Array<{
            product: any;
            sales: number;
            revenue: number;
        }>;
        salesByCategory: Array<{
            category: string;
            sales: number;
            percentage: number;
        }>;
    };
    userAnalytics: {
        userGrowth: Array<{
            date: string;
            totalUsers: number;
            newUsers: number;
        }>;
        usersByRegion: Array<{
            region: string;
            count: number;
        }>;
        activeUsers: {
            daily: number;
            weekly: number;
            monthly: number;
        };
    };
    orderAnalytics: {
        ordersByStatus: Array<{
            status: string;
            count: number;
            percentage: number;
        }>;
        averageDeliveryTime: number;
        returnRate: number;
        cancelledOrderRate: number;
    };
    productAnalytics: {
        lowStockProducts: Array<{
            product: any;
            stock: number;
        }>;
        topRatedProducts: Array<{
            product: any;
            rating: number;
            reviews: number;
        }>;
        outOfStockCount: number;
        totalCategories: number;
    };
    recentActivity: {
        recentOrders: any[];
        recentUsers: any[];
        recentReviews: any[];
        pendingOrders: number;
        pendingReviews: number;
    };
}
declare class DashboardService {
    private static instance;
    private paymentService;
    private constructor();
    static getInstance(): DashboardService;
    getDashboardStats(dateRange: {
        start: Date;
        end: Date;
    }): Promise<DashboardStats>;
    private getOverviewStats;
    private getSalesData;
    private getUserAnalytics;
    private getOrderAnalytics;
    private getProductAnalytics;
    private getRecentActivity;
    generateSalesReport(period: 'daily' | 'weekly' | 'monthly', startDate: Date, endDate: Date): Promise<{
        period: any;
        totalSales: number;
        totalOrders: any;
        averageOrderValue: number;
        totalItems: any;
    }[]>;
}
export default DashboardService;
//# sourceMappingURL=dashboardService.d.ts.map
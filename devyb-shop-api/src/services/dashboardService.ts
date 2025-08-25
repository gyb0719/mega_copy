import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Review from '../models/Review';
import PaymentService from './paymentService';

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
    dailySales: Array<{ date: string; sales: number; orders: number }>;
    monthlySales: Array<{ month: string; sales: number; orders: number }>;
    topProducts: Array<{ product: any; sales: number; revenue: number }>;
    salesByCategory: Array<{ category: string; sales: number; percentage: number }>;
  };
  userAnalytics: {
    userGrowth: Array<{ date: string; totalUsers: number; newUsers: number }>;
    usersByRegion: Array<{ region: string; count: number }>;
    activeUsers: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  orderAnalytics: {
    ordersByStatus: Array<{ status: string; count: number; percentage: number }>;
    averageDeliveryTime: number;
    returnRate: number;
    cancelledOrderRate: number;
  };
  productAnalytics: {
    lowStockProducts: Array<{ product: any; stock: number }>;
    topRatedProducts: Array<{ product: any; rating: number; reviews: number }>;
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

class DashboardService {
  private static instance: DashboardService;
  private paymentService: PaymentService;

  private constructor() {
    this.paymentService = PaymentService.getInstance();
  }

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * 전체 대시보드 통계 조회
   */
  async getDashboardStats(dateRange: { start: Date; end: Date }): Promise<DashboardStats> {
    try {
      const [
        overview,
        salesData,
        userAnalytics,
        orderAnalytics,
        productAnalytics,
        recentActivity
      ] = await Promise.all([
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
    } catch (error) {
      console.error('대시보드 통계 조회 오류:', error);
      throw new Error('대시보드 통계 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 개요 통계
   */
  private async getOverviewStats(dateRange: { start: Date; end: Date }) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      newUsersThisMonth,
      newOrdersThisWeek,
      orderValueStats
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      User.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
      Order.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, avgOrder: { $avg: '$totalPrice' } } }
      ])
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const avgOrderValue = orderValueStats[0]?.avgOrder || 0;

    // 전환율 계산 (가정: 총 방문자 수 대비 주문 완료율)
    // 실제로는 Google Analytics나 다른 트래킹 도구와 연동 필요
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

  /**
   * 판매 데이터
   */
  private async getSalesData(dateRange: { start: Date; end: Date }) {
    const [dailySales, monthlySales, topProducts, salesByCategory] = await Promise.all([
      // 일별 판매 데이터
      Order.aggregate([
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

      // 월별 판매 데이터
      Order.aggregate([
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

      // 인기 상품
      Order.aggregate([
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

      // 카테고리별 판매
      Order.aggregate([
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

    // 카테고리별 판매 비율 계산
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

  /**
   * 사용자 분석
   */
  private async getUserAnalytics(dateRange: { start: Date; end: Date }) {
    const [userGrowth, usersByRegion, activeUsers] = await Promise.all([
      // 사용자 증가 추세
      User.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]),

      // 지역별 사용자 (주소 정보가 있는 경우)
      User.aggregate([
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

      // 활성 사용자 (주문 기준으로 계산)
      Promise.all([
        Order.distinct('user', { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }).then(users => users.length),
        Order.distinct('user', { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).then(users => users.length),
        Order.distinct('user', { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }).then(users => users.length)
      ])
    ]);

    // 누적 사용자 수 계산
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

  /**
   * 주문 분석
   */
  private async getOrderAnalytics(dateRange: { start: Date; end: Date }) {
    const [ordersByStatus, deliveryTimeStats, returnStats] = await Promise.all([
      // 상태별 주문 수
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // 배송 시간 통계
      Order.aggregate([
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
                1000 * 60 * 60 * 24 // 일 단위로 변환
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

      // 환불/취소 통계
      Order.aggregate([
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

  /**
   * 상품 분석
   */
  private async getProductAnalytics() {
    const [lowStockProducts, topRatedProducts, outOfStockCount, categories] = await Promise.all([
      // 재고 부족 상품
      Product.find({ stock: { $lt: 10 }, status: 'active' })
        .select('name stock images')
        .sort({ stock: 1 })
        .limit(10),

      // 높은 평점 상품
      Product.find({ ratings: { $gte: 4.0 }, numReviews: { $gte: 5 } })
        .select('name ratings numReviews images')
        .sort({ ratings: -1, numReviews: -1 })
        .limit(10),

      // 품절 상품 수
      Product.countDocuments({ stock: 0, status: 'active' }),

      // 총 카테고리 수
      Product.distinct('category')
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

  /**
   * 최근 활동
   */
  private async getRecentActivity() {
    const [recentOrders, recentUsers, recentReviews, pendingOrders, pendingReviews] = await Promise.all([
      // 최근 주문
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('user totalPrice status createdAt orderItems'),

      // 최근 가입 사용자
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email createdAt isVerified'),

      // 최근 리뷰
      Review.find({ status: 'approved' })
        .populate('user', 'name')
        .populate('product', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('user product rating title createdAt'),

      // 처리 대기 주문 수
      Order.countDocuments({ status: 'pending' }),

      // 검토 대기 리뷰 수
      Review.countDocuments({ status: 'pending' })
    ]);

    return {
      recentOrders,
      recentUsers,
      recentReviews,
      pendingOrders,
      pendingReviews
    };
  }

  /**
   * 매출 리포트 생성
   */
  async generateSalesReport(period: 'daily' | 'weekly' | 'monthly', startDate: Date, endDate: Date) {
    try {
      let groupFormat: string;
      switch (period) {
        case 'daily':
          groupFormat = '%Y-%m-%d';
          break;
        case 'weekly':
          groupFormat = '%Y-%U'; // 주 단위
          break;
        case 'monthly':
          groupFormat = '%Y-%m';
          break;
        default:
          groupFormat = '%Y-%m-%d';
      }

      const salesReport = await Order.aggregate([
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
    } catch (error) {
      console.error('매출 리포트 생성 오류:', error);
      throw new Error('매출 리포트 생성 중 오류가 발생했습니다.');
    }
  }
}

export default DashboardService;
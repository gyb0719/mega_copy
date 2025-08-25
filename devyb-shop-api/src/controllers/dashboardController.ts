import { Request, Response, NextFunction } from 'express';
import DashboardService from '../services/dashboardService';

const dashboardService = DashboardService.getInstance();

/**
 * 전체 대시보드 통계 조회
 */
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    // 기본값: 최근 30일
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateRange = {
      start: startDate ? new Date(startDate as string) : defaultStartDate,
      end: endDate ? new Date(endDate as string) : defaultEndDate
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
  } catch (error) {
    next(error);
  }
};

/**
 * 매출 리포트 생성
 */
export const getSalesReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;

    // 기본값 설정
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    
    switch (period) {
      case 'weekly':
        defaultStartDate.setDate(defaultStartDate.getDate() - 84); // 12주
        break;
      case 'monthly':
        defaultStartDate.setMonth(defaultStartDate.getMonth() - 12); // 12개월
        break;
      default: // daily
        defaultStartDate.setDate(defaultStartDate.getDate() - 30); // 30일
    }

    const start = startDate ? new Date(startDate as string) : defaultStartDate;
    const end = endDate ? new Date(endDate as string) : defaultEndDate;

    const report = await dashboardService.generateSalesReport(
      period as 'daily' | 'weekly' | 'monthly',
      start,
      end
    );

    res.status(200).json({
      success: true,
      data: report,
      period: {
        type: period,
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 실시간 통계 (간단한 개요)
 */
export const getRealTimeStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const stats = await dashboardService.getDashboardStats({
      start: yesterday,
      end: today
    });

    // 실시간 통계에 필요한 핵심 데이터만 추출
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
  } catch (error) {
    next(error);
  }
};

/**
 * 상품 성과 분석
 */
export const getProductPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 20, sortBy = 'revenue' } = req.query;

    const stats = await dashboardService.getDashboardStats({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일
      end: new Date()
    });

    let performanceData = stats.salesData.topProducts;

    // 정렬 옵션
    if (sortBy === 'sales') {
      performanceData.sort((a, b) => b.sales - a.sales);
    } else if (sortBy === 'revenue') {
      performanceData.sort((a, b) => b.revenue - a.revenue);
    }

    // 제한
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
  } catch (error) {
    next(error);
  }
};

/**
 * 사용자 분석
 */
export const getUserAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
  } catch (error) {
    next(error);
  }
};

/**
 * 주문 분석
 */
export const getOrderAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
  } catch (error) {
    next(error);
  }
};

/**
 * 최근 활동 조회
 */
export const getRecentActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const stats = await dashboardService.getDashboardStats({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일
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
  } catch (error) {
    next(error);
  }
};

/**
 * 대시보드 알림 (중요한 업데이트나 경고)
 */
export const getDashboardAlerts = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await dashboardService.getDashboardStats({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24시간
      end: new Date()
    });

    const alerts = [];

    // 재고 부족 경고
    if (stats.productAnalytics.lowStockProducts.length > 0) {
      alerts.push({
        type: 'warning',
        title: '재고 부족 상품',
        message: `${stats.productAnalytics.lowStockProducts.length}개 상품의 재고가 부족합니다.`,
        count: stats.productAnalytics.lowStockProducts.length,
        action: 'view_products'
      });
    }

    // 품절 상품 경고
    if (stats.productAnalytics.outOfStockCount > 0) {
      alerts.push({
        type: 'error',
        title: '품절 상품',
        message: `${stats.productAnalytics.outOfStockCount}개 상품이 품절되었습니다.`,
        count: stats.productAnalytics.outOfStockCount,
        action: 'view_products'
      });
    }

    // 검토 대기 리뷰
    if (stats.recentActivity.pendingReviews > 0) {
      alerts.push({
        type: 'info',
        title: '검토 대기 리뷰',
        message: `${stats.recentActivity.pendingReviews}개의 리뷰가 검토를 기다리고 있습니다.`,
        count: stats.recentActivity.pendingReviews,
        action: 'view_reviews'
      });
    }

    // 처리 대기 주문
    if (stats.recentActivity.pendingOrders > 0) {
      alerts.push({
        type: 'warning',
        title: '처리 대기 주문',
        message: `${stats.recentActivity.pendingOrders}개의 주문이 처리를 기다리고 있습니다.`,
        count: stats.recentActivity.pendingOrders,
        action: 'view_orders'
      });
    }

    // 높은 취소율 경고
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
  } catch (error) {
    next(error);
  }
};
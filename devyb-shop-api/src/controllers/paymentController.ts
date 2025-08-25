import { Request, Response, NextFunction } from 'express';
import PaymentService from '../services/paymentService';
import Order from '../models/Order';

const paymentService = PaymentService.getInstance();

/**
 * 결제 인텐트 생성
 */
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      res.status(400).json({
        success: false,
        error: {
          status: 400,
          message: '주문 ID가 필요합니다.'
        }
      });
      return;
    }

    // 주문 존재 및 권한 확인
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        error: {
          status: 404,
          message: '주문을 찾을 수 없습니다.'
        }
      });
      return;
    }

    // 주문자 확인 (관리자는 모든 주문에 접근 가능)
    if (req.user?.role !== 'admin' && order.user.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        error: {
          status: 403,
          message: '해당 주문에 대한 권한이 없습니다.'
        }
      });
      return;
    }

    // 이미 결제된 주문인지 확인
    if (order.isPaid) {
      res.status(400).json({
        success: false,
        error: {
          status: 400,
          message: '이미 결제가 완료된 주문입니다.'
        }
      });
      return;
    }

    const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntent(
      orderId,
      {
        customerName: req.user?.name || '',
        customerEmail: req.user?.email || ''
      }
    );

    res.status(200).json({
      success: true,
      data: {
        clientSecret,
        paymentIntentId,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      },
      message: '결제가 준비되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 결제 상태 확인
 */
export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentIntentId } = req.params;

    const paymentStatus = await paymentService.getPaymentStatus(paymentIntentId);
    
    res.status(200).json({
      success: true,
      data: paymentStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 결제 취소/환불
 */
export const refundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentIntentId } = req.params;
    const { amount, reason } = req.body;

    let refundResult;

    if (amount) {
      // 부분 환불
      refundResult = await paymentService.partialRefund(
        paymentIntentId,
        amount,
        reason
      );
    } else {
      // 전체 환불
      refundResult = await paymentService.cancelPayment(
        paymentIntentId,
        reason as 'duplicate' | 'fraudulent' | 'requested_by_customer'
      );
    }

    // 주문 상태 업데이트
    const paymentStatus = await paymentService.getPaymentStatus(paymentIntentId);
    const orderId = paymentStatus.metadata.orderId;
    
    await Order.findByIdAndUpdate(orderId, {
      status: 'refunded',
      $push: {
        refunds: {
          refundId: refundResult.refundId,
          amount: refundResult.amount,
          reason,
          createdAt: new Date()
        }
      }
    });

    res.status(200).json({
      success: true,
      data: refundResult,
      message: amount ? '부분 환불이 완료되었습니다.' : '전체 환불이 완료되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stripe 웹훅 처리
 */
export const handleWebhook = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      res.status(400).json({
        success: false,
        error: {
          status: 400,
          message: 'Stripe 서명이 없습니다.'
        }
      });
      return;
    }

    const event = paymentService.verifyWebhookSignature(req.body, signature);
    
    if (!event) {
      res.status(400).json({
        success: false,
        error: {
          status: 400,
          message: '유효하지 않은 웹훅 서명입니다.'
        }
      });
      return;
    }

    console.log(`📧 Stripe 웹훅 이벤트: ${event.type}`);

    // 이벤트 타입에 따른 처리
    switch (event.type) {
      case 'payment_intent.succeeded':
        await paymentService.handlePaymentSuccess(event.data.object.id);
        break;
        
      case 'payment_intent.payment_failed':
        await paymentService.handlePaymentFailed(event.data.object.id);
        break;
        
      case 'payment_intent.canceled':
        await paymentService.handlePaymentFailed(event.data.object.id);
        break;
        
      default:
        console.log(`처리되지 않은 이벤트 타입: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('웹훅 처리 오류:', error);
    res.status(400).json({
      success: false,
      error: {
        status: 400,
        message: '웹훅 처리 중 오류가 발생했습니다.'
      }
    });
  }
};

/**
 * 고객 결제 방법 저장
 */
export const savePaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      res.status(400).json({
        success: false,
        error: {
          status: 400,
          message: '결제 방법 ID가 필요합니다.'
        }
      });
      return;
    }

    // Stripe 고객 생성/업데이트
    const customerId = await paymentService.createOrUpdateCustomer(
      req.user!.email,
      req.user!.name,
      req.user!.phone,
      {
        userId: req.user!._id.toString()
      }
    );

    // 결제 방법 저장
    await paymentService.savePaymentMethod(customerId, paymentMethodId);

    res.status(200).json({
      success: true,
      message: '결제 방법이 저장되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 저장된 결제 방법 목록 조회
 */
export const getPaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Stripe 고객 ID 조회
    const customerId = await paymentService.createOrUpdateCustomer(
      req.user!.email,
      req.user!.name,
      req.user!.phone,
      {
        userId: req.user!._id.toString()
      }
    );

    const paymentMethods = await paymentService.getPaymentMethods(customerId);

    // 민감한 정보 제거하고 반환
    const safeMethods = paymentMethods.map(method => ({
      id: method.id,
      type: method.type,
      card: method.card ? {
        brand: method.card.brand,
        last4: method.card.last4,
        exp_month: method.card.exp_month,
        exp_year: method.card.exp_year
      } : null,
      created: method.created
    }));

    res.status(200).json({
      success: true,
      data: safeMethods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 결제 통계 조회 (관리자)
 */
export const getPaymentStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30일 전
    const end = endDate ? new Date(endDate as string) : new Date();

    const stats = await paymentService.getPaymentStats(start, end);

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        period: {
          startDate: start,
          endDate: end
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 주문별 결제 정보 조회
 */
export const getOrderPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        error: {
          status: 404,
          message: '주문을 찾을 수 없습니다.'
        }
      });
      return;
    }

    // 주문자 확인 (관리자는 모든 주문에 접근 가능)
    if (req.user?.role !== 'admin' && order.user.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        error: {
          status: 403,
          message: '해당 주문에 대한 권한이 없습니다.'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        totalAmount: order.totalPrice,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        paymentMethod: order.paymentMethod,
        paymentResult: order.paymentResult,
        status: order.status
      }
    });
  } catch (error) {
    next(error);
  }
};
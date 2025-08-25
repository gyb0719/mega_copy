import Stripe from 'stripe';
import config from '../config';
import Order from '../models/Order';
import Product from '../models/Product';

class PaymentService {
  private static instance: PaymentService;
  private stripe: Stripe | null = null;

  private constructor() {
    if (config.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(config.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20'
      });
      console.log('✅ Stripe가 초기화되었습니다');
    } else {
      console.warn('⚠️  Stripe Secret Key가 설정되지 않았습니다.');
    }
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * 결제 인텐트 생성
   */
  async createPaymentIntent(
    orderId: string,
    metadata?: Record<string, string>
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    if (!this.stripe) {
      throw new Error('Stripe가 초기화되지 않았습니다.');
    }

    try {
      // 주문 정보 조회
      const order = await Order.findById(orderId).populate('orderItems.product');
      if (!order) {
        throw new Error('주문을 찾을 수 없습니다.');
      }

      // 결제 금액 계산 (원화 기준, 최소 단위는 원)
      const amount = Math.round(order.totalPrice);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'krw',
        metadata: {
          orderId: order._id.toString(),
          userId: order.user.toString(),
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      if (!paymentIntent.client_secret) {
        throw new Error('결제 인텐트 생성에 실패했습니다.');
      }

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('결제 인텐트 생성 오류:', error);
      throw new Error('결제 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 결제 상태 확인
   */
  async getPaymentStatus(paymentIntentId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
  }> {
    if (!this.stripe) {
      throw new Error('Stripe가 초기화되지 않았습니다.');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      console.error('결제 상태 확인 오류:', error);
      throw new Error('결제 상태 확인 중 오류가 발생했습니다.');
    }
  }

  /**
   * 결제 취소 (환불)
   */
  async cancelPayment(
    paymentIntentId: string,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<{
    refundId: string;
    amount: number;
    status: string;
  }> {
    if (!this.stripe) {
      throw new Error('Stripe가 초기화되지 않았습니다.');
    }

    try {
      // 결제 인텐트 확인
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('결제가 완료되지 않은 주문은 환불할 수 없습니다.');
      }

      // 환불 실행
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason
      });

      return {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      };
    } catch (error) {
      console.error('결제 취소 오류:', error);
      throw new Error('결제 취소 중 오류가 발생했습니다.');
    }
  }

  /**
   * 부분 환불
   */
  async partialRefund(
    paymentIntentId: string,
    amount: number,
    reason?: string
  ): Promise<{
    refundId: string;
    amount: number;
    status: string;
  }> {
    if (!this.stripe) {
      throw new Error('Stripe가 초기화되지 않았습니다.');
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount),
        reason: 'requested_by_customer',
        metadata: {
          reason: reason || '부분 환불'
        }
      });

      return {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      };
    } catch (error) {
      console.error('부분 환불 오류:', error);
      throw new Error('부분 환불 중 오류가 발생했습니다.');
    }
  }

  /**
   * 웹훅 서명 확인
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event | null {
    if (!this.stripe || !config.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe 웹훅이 설정되지 않았습니다.');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      console.error('웹훅 서명 확인 오류:', error);
      return null;
    }
  }

  /**
   * 결제 성공 처리
   */
  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    try {
      const paymentIntent = await this.getPaymentStatus(paymentIntentId);
      const orderId = paymentIntent.metadata.orderId;

      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('주문을 찾을 수 없습니다.');
      }

      // 주문 상태 업데이트
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'processing';
      order.paymentResult = {
        id: paymentIntentId,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: null
      };

      await order.save();

      // 상품 재고 및 판매량 업데이트
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: -item.quantity,
            sold: item.quantity
          }
        });
      }

      console.log(`✅ 결제 성공 처리 완료: 주문 ID ${orderId}`);
    } catch (error) {
      console.error('결제 성공 처리 오류:', error);
      throw error;
    }
  }

  /**
   * 결제 실패 처리
   */
  async handlePaymentFailed(paymentIntentId: string): Promise<void> {
    try {
      const paymentIntent = await this.getPaymentStatus(paymentIntentId);
      const orderId = paymentIntent.metadata.orderId;

      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('주문을 찾을 수 없습니다.');
      }

      // 주문 상태 업데이트
      order.status = 'cancelled';
      order.paymentResult = {
        id: paymentIntentId,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: null
      };

      await order.save();

      console.log(`❌ 결제 실패 처리 완료: 주문 ID ${orderId}`);
    } catch (error) {
      console.error('결제 실패 처리 오류:', error);
      throw error;
    }
  }

  /**
   * 고객 정보 생성/업데이트
   */
  async createOrUpdateCustomer(
    email: string,
    name: string,
    phone?: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    if (!this.stripe) {
      throw new Error('Stripe가 초기화되지 않았습니다.');
    }

    try {
      // 기존 고객 찾기
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        // 기존 고객 업데이트
        const customer = await this.stripe.customers.update(
          existingCustomers.data[0].id,
          {
            name,
            phone,
            metadata
          }
        );
        return customer.id;
      } else {
        // 새 고객 생성
        const customer = await this.stripe.customers.create({
          email,
          name,
          phone,
          metadata
        });
        return customer.id;
      }
    } catch (error) {
      console.error('고객 정보 처리 오류:', error);
      throw new Error('고객 정보 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 결제 방법 저장
   */
  async savePaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<void> {
    if (!this.stripe) {
      throw new Error('Stripe가 초기화되지 않았습니다.');
    }

    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
    } catch (error) {
      console.error('결제 방법 저장 오류:', error);
      throw new Error('결제 방법 저장 중 오류가 발생했습니다.');
    }
  }

  /**
   * 저장된 결제 방법 목록 조회
   */
  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    if (!this.stripe) {
      throw new Error('Stripe가 초기화되지 않았습니다.');
    }

    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('결제 방법 조회 오류:', error);
      throw new Error('결제 방법 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 결제 통계 조회
   */
  async getPaymentStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAmount: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    refundedAmount: number;
  }> {
    if (!this.stripe) {
      throw new Error('Stripe가 초기화되지 않았습니다.');
    }

    try {
      const charges = await this.stripe.charges.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000)
        },
        limit: 100
      });

      let totalAmount = 0;
      let totalTransactions = 0;
      let successfulTransactions = 0;
      let failedTransactions = 0;
      let refundedAmount = 0;

      for (const charge of charges.data) {
        totalTransactions++;
        
        if (charge.status === 'succeeded') {
          successfulTransactions++;
          totalAmount += charge.amount;
        } else {
          failedTransactions++;
        }

        if (charge.refunded) {
          refundedAmount += charge.amount_refunded;
        }
      }

      return {
        totalAmount: totalAmount / 100, // 원화 변환
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        refundedAmount: refundedAmount / 100 // 원화 변환
      };
    } catch (error) {
      console.error('결제 통계 조회 오류:', error);
      throw new Error('결제 통계 조회 중 오류가 발생했습니다.');
    }
  }
}

export default PaymentService;
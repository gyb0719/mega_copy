"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../config"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
class PaymentService {
    static instance;
    stripe = null;
    constructor() {
        if (config_1.default.STRIPE_SECRET_KEY) {
            this.stripe = new stripe_1.default(config_1.default.STRIPE_SECRET_KEY, {
                apiVersion: '2024-06-20'
            });
            console.log('✅ Stripe가 초기화되었습니다');
        }
        else {
            console.warn('⚠️  Stripe Secret Key가 설정되지 않았습니다.');
        }
    }
    static getInstance() {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }
    async createPaymentIntent(orderId, metadata) {
        if (!this.stripe) {
            throw new Error('Stripe가 초기화되지 않았습니다.');
        }
        try {
            const order = await Order_1.default.findById(orderId).populate('orderItems.product');
            if (!order) {
                throw new Error('주문을 찾을 수 없습니다.');
            }
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
        }
        catch (error) {
            console.error('결제 인텐트 생성 오류:', error);
            throw new Error('결제 처리 중 오류가 발생했습니다.');
        }
    }
    async getPaymentStatus(paymentIntentId) {
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
        }
        catch (error) {
            console.error('결제 상태 확인 오류:', error);
            throw new Error('결제 상태 확인 중 오류가 발생했습니다.');
        }
    }
    async cancelPayment(paymentIntentId, reason) {
        if (!this.stripe) {
            throw new Error('Stripe가 초기화되지 않았습니다.');
        }
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                throw new Error('결제가 완료되지 않은 주문은 환불할 수 없습니다.');
            }
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                reason
            });
            return {
                refundId: refund.id,
                amount: refund.amount,
                status: refund.status
            };
        }
        catch (error) {
            console.error('결제 취소 오류:', error);
            throw new Error('결제 취소 중 오류가 발생했습니다.');
        }
    }
    async partialRefund(paymentIntentId, amount, reason) {
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
        }
        catch (error) {
            console.error('부분 환불 오류:', error);
            throw new Error('부분 환불 중 오류가 발생했습니다.');
        }
    }
    verifyWebhookSignature(payload, signature) {
        if (!this.stripe || !config_1.default.STRIPE_WEBHOOK_SECRET) {
            throw new Error('Stripe 웹훅이 설정되지 않았습니다.');
        }
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, config_1.default.STRIPE_WEBHOOK_SECRET);
            return event;
        }
        catch (error) {
            console.error('웹훅 서명 확인 오류:', error);
            return null;
        }
    }
    async handlePaymentSuccess(paymentIntentId) {
        try {
            const paymentIntent = await this.getPaymentStatus(paymentIntentId);
            const orderId = paymentIntent.metadata.orderId;
            const order = await Order_1.default.findById(orderId);
            if (!order) {
                throw new Error('주문을 찾을 수 없습니다.');
            }
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
            for (const item of order.orderItems) {
                await Product_1.default.findByIdAndUpdate(item.product, {
                    $inc: {
                        stock: -item.quantity,
                        sold: item.quantity
                    }
                });
            }
            console.log(`✅ 결제 성공 처리 완료: 주문 ID ${orderId}`);
        }
        catch (error) {
            console.error('결제 성공 처리 오류:', error);
            throw error;
        }
    }
    async handlePaymentFailed(paymentIntentId) {
        try {
            const paymentIntent = await this.getPaymentStatus(paymentIntentId);
            const orderId = paymentIntent.metadata.orderId;
            const order = await Order_1.default.findById(orderId);
            if (!order) {
                throw new Error('주문을 찾을 수 없습니다.');
            }
            order.status = 'cancelled';
            order.paymentResult = {
                id: paymentIntentId,
                status: paymentIntent.status,
                update_time: new Date().toISOString(),
                email_address: null
            };
            await order.save();
            console.log(`❌ 결제 실패 처리 완료: 주문 ID ${orderId}`);
        }
        catch (error) {
            console.error('결제 실패 처리 오류:', error);
            throw error;
        }
    }
    async createOrUpdateCustomer(email, name, phone, metadata) {
        if (!this.stripe) {
            throw new Error('Stripe가 초기화되지 않았습니다.');
        }
        try {
            const existingCustomers = await this.stripe.customers.list({
                email,
                limit: 1
            });
            if (existingCustomers.data.length > 0) {
                const customer = await this.stripe.customers.update(existingCustomers.data[0].id, {
                    name,
                    phone,
                    metadata
                });
                return customer.id;
            }
            else {
                const customer = await this.stripe.customers.create({
                    email,
                    name,
                    phone,
                    metadata
                });
                return customer.id;
            }
        }
        catch (error) {
            console.error('고객 정보 처리 오류:', error);
            throw new Error('고객 정보 처리 중 오류가 발생했습니다.');
        }
    }
    async savePaymentMethod(customerId, paymentMethodId) {
        if (!this.stripe) {
            throw new Error('Stripe가 초기화되지 않았습니다.');
        }
        try {
            await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId
            });
        }
        catch (error) {
            console.error('결제 방법 저장 오류:', error);
            throw new Error('결제 방법 저장 중 오류가 발생했습니다.');
        }
    }
    async getPaymentMethods(customerId) {
        if (!this.stripe) {
            throw new Error('Stripe가 초기화되지 않았습니다.');
        }
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });
            return paymentMethods.data;
        }
        catch (error) {
            console.error('결제 방법 조회 오류:', error);
            throw new Error('결제 방법 조회 중 오류가 발생했습니다.');
        }
    }
    async getPaymentStats(startDate, endDate) {
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
                }
                else {
                    failedTransactions++;
                }
                if (charge.refunded) {
                    refundedAmount += charge.amount_refunded;
                }
            }
            return {
                totalAmount: totalAmount / 100,
                totalTransactions,
                successfulTransactions,
                failedTransactions,
                refundedAmount: refundedAmount / 100
            };
        }
        catch (error) {
            console.error('결제 통계 조회 오류:', error);
            throw new Error('결제 통계 조회 중 오류가 발생했습니다.');
        }
    }
}
exports.default = PaymentService;
//# sourceMappingURL=paymentService.js.map
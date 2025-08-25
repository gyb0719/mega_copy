import Stripe from 'stripe';
declare class PaymentService {
    private static instance;
    private stripe;
    private constructor();
    static getInstance(): PaymentService;
    createPaymentIntent(orderId: string, metadata?: Record<string, string>): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    getPaymentStatus(paymentIntentId: string): Promise<{
        status: string;
        amount: number;
        currency: string;
        metadata: Record<string, string>;
    }>;
    cancelPayment(paymentIntentId: string, reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'): Promise<{
        refundId: string;
        amount: number;
        status: string;
    }>;
    partialRefund(paymentIntentId: string, amount: number, reason?: string): Promise<{
        refundId: string;
        amount: number;
        status: string;
    }>;
    verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event | null;
    handlePaymentSuccess(paymentIntentId: string): Promise<void>;
    handlePaymentFailed(paymentIntentId: string): Promise<void>;
    createOrUpdateCustomer(email: string, name: string, phone?: string, metadata?: Record<string, string>): Promise<string>;
    savePaymentMethod(customerId: string, paymentMethodId: string): Promise<void>;
    getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]>;
    getPaymentStats(startDate: Date, endDate: Date): Promise<{
        totalAmount: number;
        totalTransactions: number;
        successfulTransactions: number;
        failedTransactions: number;
        refundedAmount: number;
    }>;
}
export default PaymentService;
//# sourceMappingURL=paymentService.d.ts.map
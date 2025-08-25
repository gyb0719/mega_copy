"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderPayment = exports.getPaymentStats = exports.getPaymentMethods = exports.savePaymentMethod = exports.handleWebhook = exports.refundPayment = exports.getPaymentStatus = exports.createPaymentIntent = void 0;
const paymentService_1 = __importDefault(require("../services/paymentService"));
const Order_1 = __importDefault(require("../models/Order"));
const paymentService = paymentService_1.default.getInstance();
const createPaymentIntent = async (req, res, next) => {
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
        const order = await Order_1.default.findById(orderId);
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
        const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntent(orderId, {
            customerName: req.user?.name || '',
            customerEmail: req.user?.email || ''
        });
        res.status(200).json({
            success: true,
            data: {
                clientSecret,
                paymentIntentId,
                publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
            },
            message: '결제가 준비되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPaymentIntent = createPaymentIntent;
const getPaymentStatus = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.params;
        const paymentStatus = await paymentService.getPaymentStatus(paymentIntentId);
        res.status(200).json({
            success: true,
            data: paymentStatus
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentStatus = getPaymentStatus;
const refundPayment = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.params;
        const { amount, reason } = req.body;
        let refundResult;
        if (amount) {
            refundResult = await paymentService.partialRefund(paymentIntentId, amount, reason);
        }
        else {
            refundResult = await paymentService.cancelPayment(paymentIntentId, reason);
        }
        const paymentStatus = await paymentService.getPaymentStatus(paymentIntentId);
        const orderId = paymentStatus.metadata.orderId;
        await Order_1.default.findByIdAndUpdate(orderId, {
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
    }
    catch (error) {
        next(error);
    }
};
exports.refundPayment = refundPayment;
const handleWebhook = async (req, res, _next) => {
    try {
        const signature = req.headers['stripe-signature'];
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
    }
    catch (error) {
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
exports.handleWebhook = handleWebhook;
const savePaymentMethod = async (req, res, next) => {
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
        const customerId = await paymentService.createOrUpdateCustomer(req.user.email, req.user.name, req.user.phone, {
            userId: req.user._id.toString()
        });
        await paymentService.savePaymentMethod(customerId, paymentMethodId);
        res.status(200).json({
            success: true,
            message: '결제 방법이 저장되었습니다.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.savePaymentMethod = savePaymentMethod;
const getPaymentMethods = async (req, res, next) => {
    try {
        const customerId = await paymentService.createOrUpdateCustomer(req.user.email, req.user.name, req.user.phone, {
            userId: req.user._id.toString()
        });
        const paymentMethods = await paymentService.getPaymentMethods(customerId);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentMethods = getPaymentMethods;
const getPaymentStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
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
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentStats = getPaymentStats;
const getOrderPayment = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order_1.default.findById(orderId);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderPayment = getOrderPayment;
//# sourceMappingURL=paymentController.js.map
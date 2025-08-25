"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Order_1 = __importDefault(require("../models/Order"));
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    try {
        const order = new Order_1.default(req.body);
        await order.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: '주문 생성 중 오류가 발생했습니다.' });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order_1.default.find({ user: req.params.userId })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: '주문 조회 중 오류가 발생했습니다.' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id)
            .populate('items.product')
            .populate('user');
        if (!order) {
            return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: '주문 조회 중 오류가 발생했습니다.' });
    }
});
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: '주문 상태 업데이트 중 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map
import express from 'express';
import Order from '../models/Order';

const router = express.Router();

// 주문 생성
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: '주문 생성 중 오류가 발생했습니다.' });
  }
});

// 사용자의 주문 목록 조회
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: '주문 조회 중 오류가 발생했습니다.' });
  }
});

// 특정 주문 조회
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user');
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: '주문 조회 중 오류가 발생했습니다.' });
  }
});

// 주문 상태 업데이트
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: '주문 상태 업데이트 중 오류가 발생했습니다.' });
  }
});

export default router;
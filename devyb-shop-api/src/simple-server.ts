import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// 메모리 기반 데이터 저장소
let products = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    price: 2499000,
    category: '노트북',
    description: 'Apple M3 Pro 칩셋 탑재, 18GB RAM, 512GB SSD',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    stock: 10,
    rating: 4.8,
    reviews: 124
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    price: 1550000,
    category: '스마트폰',
    description: '티타늄 디자인, A17 Pro 칩, 256GB',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',
    stock: 25,
    rating: 4.9,
    reviews: 342
  },
  {
    id: '3',
    name: 'AirPods Pro 2',
    price: 359000,
    category: '오디오',
    description: '액티브 노이즈 캔슬링, 적응형 투명도 모드',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800',
    stock: 50,
    rating: 4.7,
    reviews: 89
  },
  {
    id: '4',
    name: 'iPad Air',
    price: 929000,
    category: '태블릿',
    description: '10.9인치 Liquid Retina 디스플레이, M1 칩',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    stock: 15,
    rating: 4.6,
    reviews: 67
  },
  {
    id: '5',
    name: 'Apple Watch Series 9',
    price: 599000,
    category: '웨어러블',
    description: '혈중 산소 측정, 심전도 앱, GPS + Cellular',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
    stock: 30,
    rating: 4.8,
    reviews: 156
  },
  {
    id: '6',
    name: 'Sony WH-1000XM5',
    price: 449000,
    category: '오디오',
    description: '업계 최고 수준 노이즈 캔슬링 헤드폰',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
    stock: 20,
    rating: 4.9,
    reviews: 203
  },
  {
    id: '7',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1698000,
    category: '스마트폰',
    description: '갤럭시 AI, 200MP 카메라, S펜 내장',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
    stock: 18,
    rating: 4.7,
    reviews: 289
  },
  {
    id: '8',
    name: 'LG 그램 17"',
    price: 1899000,
    category: '노트북',
    description: '초경량 1.35kg, 인텔 13세대 코어 i7',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800',
    stock: 12,
    rating: 4.5,
    reviews: 95
  }
];

let users: any[] = [];
let orders: any[] = [];
let carts: { [key: string]: any[] } = {};

// Routes

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Products
app.get('/api/products', (req, res) => {
  const { category, sort, search } = req.query;
  let filteredProducts = [...products];

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm)
    );
  }

  if (sort === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  res.json(filteredProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  }
  res.json(product);
});

// Cart
app.get('/api/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  res.json(carts[userId] || []);
});

app.post('/api/cart/:userId/add', (req, res) => {
  const userId = req.params.userId;
  const { productId, quantity = 1 } = req.body;
  
  if (!carts[userId]) {
    carts[userId] = [];
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  }

  const existingItem = carts[userId].find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts[userId].push({
      productId,
      product,
      quantity,
      addedAt: new Date()
    });
  }

  res.json({ message: '장바구니에 추가되었습니다.', cart: carts[userId] });
});

app.delete('/api/cart/:userId/item/:productId', (req, res) => {
  const { userId, productId } = req.params;
  
  if (!carts[userId]) {
    return res.status(404).json({ message: '장바구니가 비어있습니다.' });
  }

  carts[userId] = carts[userId].filter(item => item.productId !== productId);
  res.json({ message: '상품이 삭제되었습니다.', cart: carts[userId] });
});

// Auth (간단한 구현)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
  }

  const newUser = {
    id: String(users.length + 1),
    name,
    email,
    password, // 실제로는 해시해야 함
    createdAt: new Date()
  };

  users.push(newUser);
  
  res.status(201).json({
    message: '회원가입 성공',
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }

  res.json({
    message: '로그인 성공',
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// Orders
app.post('/api/orders', (req, res) => {
  const { userId, items, shippingAddress, totalAmount } = req.body;
  
  const newOrder = {
    id: String(orders.length + 1),
    userId,
    items,
    shippingAddress,
    totalAmount,
    status: 'pending',
    createdAt: new Date()
  };

  orders.push(newOrder);
  
  // Clear cart after order
  if (carts[userId]) {
    carts[userId] = [];
  }

  res.status(201).json({
    message: '주문이 완료되었습니다.',
    order: newOrder
  });
});

app.get('/api/orders/user/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.params.userId);
  res.json(userOrders);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
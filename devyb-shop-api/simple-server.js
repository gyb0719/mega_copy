const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - 모든 localhost 포트 허용
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 메모리 기반 데이터 저장소
let products = [
  {
    id: '1',
    name: '맥북 에어 M3 15인치',
    price: 2190000,
    category: '노트북',
    description: '초경량 디자인, M3 칩, 18시간 배터리',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
    stock: 10,
    rating: 4.8,
    reviews: 124
  },
  {
    id: '2',
    name: '아이폰 15 프로 맥스',
    price: 1890000,
    category: '스마트폰',
    description: '티타늄 프레임, 5배 망원, ProRes 비디오',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
    stock: 25,
    rating: 4.9,
    reviews: 342
  },
  {
    id: '3',
    name: 'Sony WF-1000XM5',
    price: 389000,
    category: '오디오',
    description: '최신 노이즈 캔슬링 이어버드, 8시간 재생',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
    stock: 50,
    rating: 4.7,
    reviews: 89
  },
  {
    id: '4',
    name: '아이패드 프로 12.9인치',
    price: 1549000,
    category: '태블릿',
    description: 'M2 칩, ProMotion 디스플레이, Face ID',
    image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800',
    stock: 15,
    rating: 4.6,
    reviews: 67
  },
  {
    id: '5',
    name: '갤럭시 워치 6 클래식',
    price: 459000,
    category: '웨어러블',
    description: '회전 베젤, 체성분 분석, 수면 코칭',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    stock: 30,
    rating: 4.8,
    reviews: 156
  },
  {
    id: '6',
    name: '마셜 엠버튼 2세대',
    price: 229000,
    category: '오디오',
    description: '360도 사운드, 30시간 재생, IP67 방수',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
    stock: 20,
    rating: 4.9,
    reviews: 203
  },
  {
    id: '7',
    name: '낫싱 폰 (2)',
    price: 899000,
    category: '스마트폰',
    description: 'Glyph 인터페이스, 50MP 듀얼 카메라',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
    stock: 18,
    rating: 4.7,
    reviews: 289
  },
  {
    id: '8',
    name: 'ASUS ROG 제피러스 G14',
    price: 2399000,
    category: '노트북',
    description: 'RTX 4060, AMD Ryzen 9, 165Hz 디스플레이',
    image: 'https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800',
    stock: 12,
    rating: 4.5,
    reviews: 95
  }
];

let users = [];
let orders = [];
let carts = {};

// Routes

// Health check
app.get('/api/health', (req, res) => {
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
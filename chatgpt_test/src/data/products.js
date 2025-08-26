// 더미 상품 데이터
export const products = [
  {
    id: 1,
    name: "무선 블루투스 헤드폰",
    price: 89000,
    category: "전자제품",
    imageUrl: "https://via.placeholder.com/300x300/4F46E5/ffffff?text=Headphone",
    description: "고품질 사운드와 노이즈 캔슬링 기능을 갖춘 프리미엄 무선 헤드폰입니다. 최대 30시간 재생 가능한 대용량 배터리를 탑재했습니다.",
    stock: 15
  },
  {
    id: 2,
    name: "스마트 워치",
    price: 259000,
    category: "전자제품",
    imageUrl: "https://via.placeholder.com/300x300/10B981/ffffff?text=Smart+Watch",
    description: "건강 관리와 피트니스 추적 기능이 뛰어난 최신 스마트 워치입니다. 방수 기능과 GPS를 내장하고 있습니다.",
    stock: 10
  },
  {
    id: 3,
    name: "프리미엄 가죽 지갑",
    price: 65000,
    category: "패션",
    imageUrl: "https://via.placeholder.com/300x300/F59E0B/ffffff?text=Wallet",
    description: "이탈리아산 최고급 가죽으로 제작된 수제 지갑입니다. 카드 수납 공간과 지폐 수납 공간이 넉넉합니다.",
    stock: 25
  },
  {
    id: 4,
    name: "무선 충전기",
    price: 35000,
    category: "전자제품",
    imageUrl: "https://via.placeholder.com/300x300/EF4444/ffffff?text=Charger",
    description: "15W 고속 무선 충전이 가능한 슬림한 디자인의 충전기입니다. 모든 Qi 호환 기기에서 사용 가능합니다.",
    stock: 30
  },
  {
    id: 5,
    name: "캠핑 텐트",
    price: 189000,
    category: "아웃도어",
    imageUrl: "https://via.placeholder.com/300x300/8B5CF6/ffffff?text=Tent",
    description: "4인용 대형 캠핑 텐트입니다. 방수 기능과 UV 차단 기능을 갖추고 있으며, 설치가 간편합니다.",
    stock: 8
  },
  {
    id: 6,
    name: "요가 매트",
    price: 45000,
    category: "스포츠",
    imageUrl: "https://via.placeholder.com/300x300/EC4899/ffffff?text=Yoga+Mat",
    description: "미끄럼 방지 기능이 뛰어난 친환경 소재의 요가 매트입니다. 6mm 두께로 충격 흡수가 우수합니다.",
    stock: 20
  },
  {
    id: 7,
    name: "커피 메이커",
    price: 125000,
    category: "주방용품",
    imageUrl: "https://via.placeholder.com/300x300/06B6D4/ffffff?text=Coffee+Maker",
    description: "전자동 에스프레소 머신입니다. 원터치로 다양한 커피 메뉴를 즐길 수 있습니다.",
    stock: 12
  },
  {
    id: 8,
    name: "러닝화",
    price: 95000,
    category: "스포츠",
    imageUrl: "https://via.placeholder.com/300x300/84CC16/ffffff?text=Running+Shoes",
    description: "경량 쿠셔닝 시스템을 적용한 프로페셔널 러닝화입니다. 통기성이 뛰어나고 착화감이 편안합니다.",
    stock: 18
  },
  {
    id: 9,
    name: "백팩",
    price: 78000,
    category: "패션",
    imageUrl: "https://via.placeholder.com/300x300/F97316/ffffff?text=Backpack",
    description: "노트북 수납 공간이 있는 대용량 백팩입니다. 방수 소재로 제작되어 비 오는 날에도 안심입니다.",
    stock: 22
  },
  {
    id: 10,
    name: "블루투스 스피커",
    price: 68000,
    category: "전자제품",
    imageUrl: "https://via.placeholder.com/300x300/0EA5E9/ffffff?text=Speaker",
    description: "360도 서라운드 사운드를 제공하는 포터블 블루투스 스피커입니다. IPX7 방수 등급을 획득했습니다.",
    stock: 16
  },
  {
    id: 11,
    name: "선글라스",
    price: 55000,
    category: "패션",
    imageUrl: "https://via.placeholder.com/300x300/7C3AED/ffffff?text=Sunglasses",
    description: "UV400 차단 렌즈를 사용한 스타일리시한 선글라스입니다. 가벼운 무게로 장시간 착용해도 편안합니다.",
    stock: 28
  },
  {
    id: 12,
    name: "무선 마우스",
    price: 32000,
    category: "전자제품",
    imageUrl: "https://via.placeholder.com/300x300/DC2626/ffffff?text=Mouse",
    description: "인체공학적 디자인의 무선 마우스입니다. 정밀한 센서와 조용한 클릭음이 특징입니다.",
    stock: 35
  }
];

// ID로 상품 찾기 헬퍼 함수
export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id));
};

// 카테고리별 상품 필터링 헬퍼 함수
export const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category);
};

// 모든 카테고리 목록 가져오기
export const getCategories = () => {
  return [...new Set(products.map(product => product.category))];
};
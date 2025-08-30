// XSS 방지를 위한 입력값 검증 및 정제 함수

// HTML 특수문자 이스케이프
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
}

// 위험한 HTML 태그 제거
export function sanitizeHtml(html: string): string {
  // 스크립트 태그 제거
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 이벤트 핸들러 속성 제거
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // javascript: 프로토콜 제거
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  // data: URL 제거 (base64 인코딩된 스크립트 방지)
  cleaned = cleaned.replace(/data:text\/html[^,]*,/gi, '');
  
  return cleaned;
}

// 상품명 검증
export function validateProductName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: '상품명을 입력해주세요.' };
  }
  
  if (name.length > 200) {
    return { valid: false, message: '상품명은 200자 이내로 입력해주세요.' };
  }
  
  // XSS 위험 문자 체크
  if (/<[^>]*>/g.test(name)) {
    return { valid: false, message: '상품명에 HTML 태그를 사용할 수 없습니다.' };
  }
  
  return { valid: true };
}

// 가격 검증
export function validatePrice(price: number | string): { valid: boolean; message?: string } {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return { valid: false, message: '올바른 가격을 입력해주세요.' };
  }
  
  if (numPrice < 0) {
    return { valid: false, message: '가격은 0원 이상이어야 합니다.' };
  }
  
  if (numPrice > 999999999) {
    return { valid: false, message: '가격이 너무 큽니다.' };
  }
  
  return { valid: true };
}

// 상품 설명 검증
export function validateDescription(desc: string): { valid: boolean; message?: string } {
  if (desc && desc.length > 5000) {
    return { valid: false, message: '상품 설명은 5000자 이내로 입력해주세요.' };
  }
  
  return { valid: true };
}

// URL 검증
export function validateImageUrl(url: string): { valid: boolean; message?: string } {
  if (!url) {
    return { valid: false, message: 'URL을 입력해주세요.' };
  }
  
  try {
    const urlObj = new URL(url);
    
    // 허용된 프로토콜만
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, message: 'HTTP 또는 HTTPS URL만 사용 가능합니다.' };
    }
    
    // Supabase 스토리지 또는 외부 이미지 CDN만 허용
    const allowedHosts = [
      'nzmscqfrmxqcukhshsok.supabase.co',
      'via.placeholder.com',
      'images.unsplash.com',
      'cdn.jsdelivr.net'
    ];
    
    if (!allowedHosts.some(host => urlObj.hostname.includes(host))) {
      return { valid: false, message: '허용되지 않은 이미지 호스트입니다.' };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, message: '올바른 URL 형식이 아닙니다.' };
  }
}

// 카테고리 검증
export function validateCategory(category: string): { valid: boolean; message?: string } {
  const allowedCategories = [
    '가방', '신발', '시계', '지갑', '액세서리', 
    '의류', '잡화', '전체', 'bags', 'shoes', 
    'watches', 'wallets', 'accessories', 'clothing', 'others'
  ];
  
  if (!allowedCategories.includes(category)) {
    return { valid: false, message: '올바른 카테고리를 선택해주세요.' };
  }
  
  return { valid: true };
}

// 전체 상품 데이터 검증
export interface ProductData {
  name: string;
  price: number;
  category: string;
  description?: string;
  image_url?: string;
  stock?: number;
}

export function validateProductData(data: ProductData): { 
  valid: boolean; 
  errors: string[];
  sanitized?: ProductData;
} {
  const errors: string[] = [];
  
  // 각 필드 검증
  const nameValidation = validateProductName(data.name);
  if (!nameValidation.valid && nameValidation.message) {
    errors.push(nameValidation.message);
  }
  
  const priceValidation = validatePrice(data.price);
  if (!priceValidation.valid && priceValidation.message) {
    errors.push(priceValidation.message);
  }
  
  const categoryValidation = validateCategory(data.category);
  if (!categoryValidation.valid && categoryValidation.message) {
    errors.push(categoryValidation.message);
  }
  
  if (data.description) {
    const descValidation = validateDescription(data.description);
    if (!descValidation.valid && descValidation.message) {
      errors.push(descValidation.message);
    }
  }
  
  if (data.image_url) {
    const urlValidation = validateImageUrl(data.image_url);
    if (!urlValidation.valid && urlValidation.message) {
      errors.push(urlValidation.message);
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // 데이터 정제
  const sanitized: ProductData = {
    name: escapeHtml(data.name.trim()),
    price: Number(data.price),
    category: data.category,
    description: data.description ? sanitizeHtml(data.description) : undefined,
    image_url: data.image_url,
    stock: data.stock ? Number(data.stock) : 0
  };
  
  return { valid: true, errors: [], sanitized };
}
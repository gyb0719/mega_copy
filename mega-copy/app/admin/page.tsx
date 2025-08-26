'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, Edit, Plus, X, Loader2 } from 'lucide-react';
import Header from '../components/Header';

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  product_images?: ProductImage[];
}

const categories = [
  '남성 상의', '남성 하의', '여성 의류',
  '모자', '벨트', '신발',
  '숄/머플러', '가방', '지갑',
  '안경/선글라스', '시계/넥타이', '악세서리',
  '향수', '기타'
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    category: categories[0],
    description: '',
    stock: '10'
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('상품을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'mega2024') {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length + uploadedImageUrls.length > 20) {
      alert('최대 20개의 이미지만 업로드 가능합니다.');
      return;
    }
    
    setSelectedImages([...selectedImages, ...files]);
    
    // 이미지를 즉시 업로드
    if (files.length > 0) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('images', file);
        });
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        if (result.urls) {
          setUploadedImageUrls([...uploadedImageUrls, ...result.urls]);
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        alert('이미지 업로드에 실패했습니다.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('상품이 삭제되었습니다.');
        fetchProducts();
      } else {
        alert('상품 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedImageUrls.length === 0) {
      alert('최소 1개 이상의 이미지를 업로드해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          price: parseInt(formData.price),
          category: formData.category,
          description: formData.description,
          stock: parseInt(formData.stock),
          images: uploadedImageUrls
        })
      });
      
      const result = await response.json();
      
      if (result.data) {
        alert('상품이 등록되었습니다.');
        setShowAddModal(false);
        setFormData({
          name: '',
          brand: '',
          price: '',
          category: categories[0],
          description: '',
          stock: '10'
        });
        setSelectedImages([]);
        setUploadedImageUrls([]);
        fetchProducts();
      } else {
        alert('상품 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('상품 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">관리자 로그인</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="비밀번호 입력"
              className="w-full px-4 py-2 border rounded-lg mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-mega-black text-white py-2 rounded-lg hover:bg-gray-800"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">상품 관리</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-mega-yellow text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400"
          >
            <Plus className="w-5 h-5" />
            상품 추가
          </button>
        </div>

        {/* 상품 리스트 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">이미지</th>
                  <th className="px-4 py-3 text-left">상품명</th>
                  <th className="px-4 py-3 text-left">브랜드</th>
                  <th className="px-4 py-3 text-left">카테고리</th>
                  <th className="px-4 py-3 text-left">가격</th>
                  <th className="px-4 py-3 text-left">재고</th>
                  <th className="px-4 py-3 text-left">액션</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const mainImage = product.product_images?.[0]?.image_url;
                  return (
                    <tr key={product.id} className="border-b">
                      <td className="px-4 py-3">
                        {mainImage ? (
                          <img 
                            src={mainImage} 
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{product.brand}</td>
                      <td className="px-4 py-3">{product.category}</td>
                      <td className="px-4 py-3">₩{product.price.toLocaleString()}</td>
                      <td className="px-4 py-3">{product.stock}개</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      등록된 상품이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상품 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">상품 추가</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 이미지 업로드 섹션 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  상품 이미지 (최대 20개)
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-gray-600">클릭하여 이미지 업로드</span>
                    <span className="text-sm text-gray-400 mt-1">
                      JPG, PNG, GIF (최대 20개)
                    </span>
                  </label>
                </div>

                {/* 업로드 중 표시 */}
                {isUploading && (
                  <div className="mt-4 flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin mr-2 text-gray-600" />
                    <span className="text-gray-600">이미지 업로드 중...</span>
                  </div>
                )}

                {/* 업로드된 이미지 미리보기 */}
                {(selectedImages.length > 0 || uploadedImageUrls.length > 0) && !isUploading && (
                  <div className="mt-4 grid grid-cols-5 gap-3">
                    {selectedImages.map((file, index) => (
                      <div key={`file-${index}`} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {uploadedImageUrls.map((url, index) => (
                      <div key={`url-${index}`} className="relative group">
                        <img
                          src={url}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                        />
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                          업로드됨
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(selectedImages.length + index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">상품명</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">브랜드</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">가격</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">카테고리</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">재고</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">상품 설명</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="px-6 py-2 bg-mega-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? '등록 중...' : '상품 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
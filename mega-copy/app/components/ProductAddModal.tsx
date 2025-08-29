'use client';

import { useState } from 'react';
import { X, Upload, Plus, Loader2, Camera, Images } from 'lucide-react';
import { storageAPI } from '../lib/supabase-rpc-api';
import { compressMainImage, compressDetailImage, formatFileSize } from '../lib/image-utils';

interface ProductAddModalProps {
  onClose: () => void;
  onSave: () => void;
}

const categories = [
  '남성 상의', '남성 하의', '여성 의류',
  '모자', '벨트', '신발', '숄/머플러', '가방',
  '지갑', '안경/선글라스', '시계/넥타이', '악세서리', '향수', '기타'
];

export default function ProductAddModal({ onClose, onSave }: ProductAddModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  });
  
  // 메인 이미지 (1장)
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  
  // 세부 이미지 (최대 20장)
  const [detailImages, setDetailImages] = useState<File[]>([]);
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  // 메인 이미지 선택 처리
  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressionProgress(10);
      const compressedFile = await compressMainImage(file);
      setCompressionProgress(100);
      
      setMainImage(compressedFile);
      setMainImageUrl(URL.createObjectURL(compressedFile));
      
      // 파일 크기 표시
      console.log(`메인 이미지 압축 완료: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
      
      setTimeout(() => setCompressionProgress(0), 1000);
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
      setCompressionProgress(0);
    }
  };

  // 세부 이미지 선택 처리
  const handleDetailImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 20장 제한
    const remainingSlots = 20 - detailImages.length;
    if (files.length > remainingSlots) {
      alert(`최대 ${remainingSlots}장까지만 추가할 수 있습니다.`);
      return;
    }

    try {
      setCompressionProgress(10);
      const compressedFiles: File[] = [];
      const urls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const compressedFile = await compressDetailImage(files[i]);
        compressedFiles.push(compressedFile);
        urls.push(URL.createObjectURL(compressedFile));
        setCompressionProgress(10 + (90 * (i + 1) / files.length));
      }

      setDetailImages(prev => [...prev, ...compressedFiles]);
      setDetailImageUrls(prev => [...prev, ...urls]);
      setCompressionProgress(100);
      
      setTimeout(() => setCompressionProgress(0), 1000);
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
      setCompressionProgress(0);
    }
  };

  // 메인 이미지 제거
  const removeMainImage = () => {
    setMainImage(null);
    setMainImageUrl('');
  };

  // 세부 이미지 제거
  const removeDetailImage = (index: number) => {
    setDetailImages(prev => prev.filter((_, i) => i !== index));
    setDetailImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      alert('상품명, 가격, 카테고리는 필수 입력 항목입니다.');
      return;
    }

    if (!mainImage) {
      alert('메인 이미지는 필수입니다.');
      return;
    }

    setIsLoading(true);

    try {
      setUploadingImages(true);
      
      // 1. 메인 이미지 업로드
      console.log('메인 이미지 업로드 시작...');
      console.log('메인 이미지 정보:', {
        name: mainImage.name,
        size: mainImage.size,
        type: mainImage.type
      });
      
      const mainImageUpload = await storageAPI.uploadMultipleImages([mainImage]);
      
      // 메인 이미지는 필수이므로 실패하면 에러
      if (mainImageUpload.uploaded.length === 0) {
        console.error('메인 이미지 업로드 실패:', mainImageUpload.failed);
        const errorDetail = mainImageUpload.failed[0];
        const errorMsg = errorDetail?.message || errorDetail?.toString() || '이미지 업로드 실패';
        console.error('에러 상세:', errorDetail);
        throw new Error(`메인 이미지 업로드 실패: ${errorMsg}`);
      }
      
      const mainImageUrl = mainImageUpload.uploaded[0];
      console.log('메인 이미지 업로드 성공:', mainImageUrl);
      
      // 2. 세부 이미지 업로드 (있는 경우)
      let detailImageUrls: string[] = [];
      if (detailImages.length > 0) {
        console.log(`세부 이미지 ${detailImages.length}개 업로드 시작...`);
        const detailImageUpload = await storageAPI.uploadMultipleImages(detailImages);
        detailImageUrls = detailImageUpload.uploaded;
        
        // 일부 실패한 경우 경고만 표시
        if (detailImageUpload.failed.length > 0) {
          console.warn(`세부 이미지 중 ${detailImageUpload.failed.length}개 업로드 실패`);
          console.warn('실패한 이미지:', detailImageUpload.failed);
        }
        
        console.log(`세부 이미지 ${detailImageUrls.length}개 업로드 성공`);
      }
      
      setUploadingImages(false);

      // 3. Supabase 직접 호출로 상품 등록
      const { supabase } = await import('../../lib/supabase');
      
      // 3-1. products 테이블에 상품 등록
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          brand: '',
          price: parseFloat(formData.price),
          original_price: null,
          category: formData.category,
          description: formData.description || '',
          stock: 0,
          image_url: mainImageUrl, // 메인 이미지
          is_available: true
        })
        .select()
        .single();

      if (productError) {
        console.error('상품 등록 오류:', productError);
        throw new Error('상품 등록에 실패했습니다: ' + productError.message);
      }

      // 3-2. product_images 테이블에 세부 이미지 등록
      if (newProduct && detailImageUrls.length > 0) {
        const imageInserts = detailImageUrls.map((url, index) => ({
          product_id: newProduct.id,
          image_url: url,
          display_order: index + 1
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) {
          console.error('이미지 정보 저장 오류:', imagesError);
          // 이미지 저장 실패는 경고만 하고 진행
        }
      }

      alert('상품이 성공적으로 등록되었습니다!');
      onSave();
    } catch (error: any) {
      console.error('상품 등록 오류:', error);
      alert(error.message || '상품 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-2xl max-h-[90vh] md:max-h-[85vh] rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">상품 추가</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 압축 진행 표시 */}
        {compressionProgress > 0 && (
          <div className="bg-yellow-50 px-4 py-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">이미지 최적화 중... {Math.round(compressionProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className="bg-mega-yellow h-1 rounded-full transition-all"
                style={{ width: `${compressionProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4">
          {/* 메인 이미지 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              <Camera className="w-4 h-4 inline mr-1" />
              메인 이미지 (필수, 1장)
            </label>
            <p className="text-xs text-gray-500 mb-2">상품 목록에 표시될 대표 이미지입니다.</p>
            
            <div className="grid grid-cols-3 gap-2">
              {mainImage ? (
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={mainImageUrl} alt="메인 이미지" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black/50 text-white px-1 py-0.5 rounded text-xs">
                    메인
                  </div>
                </div>
              ) : (
                <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100">
                  <Camera className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">메인 이미지</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 세부 이미지 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              <Images className="w-4 h-4 inline mr-1" />
              세부 이미지 (선택, 최대 20장)
            </label>
            <p className="text-xs text-gray-500 mb-2">상품 상세 페이지에 표시될 추가 이미지입니다.</p>
            
            <div className="grid grid-cols-3 gap-2">
              {detailImageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={url} alt={`세부 이미지 ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeDetailImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black/50 text-white px-1 py-0.5 rounded text-xs">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              {detailImages.length < 20 && (
                <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100">
                  <Plus className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">추가</span>
                  <span className="text-xs text-gray-400">{20 - detailImages.length}장 가능</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDetailImagesChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">상품명 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mega-yellow"
                placeholder="상품명을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">판매가 *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mega-yellow"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">카테고리 *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mega-yellow"
                required
              >
                <option value="">카테고리 선택</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">상품 설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mega-yellow"
                rows={4}
                placeholder="상품에 대한 설명을 입력하세요"
              />
            </div>
          </div>
        </form>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !mainImage}
            className="flex-1 py-2.5 bg-mega-yellow text-black rounded-lg font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadingImages ? '이미지 업로드 중...' : '등록 중...'}
              </>
            ) : (
              '상품 등록'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
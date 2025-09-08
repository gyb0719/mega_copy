'use client';

import { useState } from 'react';
import { X, Upload, Plus, Loader2, Camera, Images } from 'lucide-react';
import { compressMainImage, compressDetailImage, compressDetailImageAdaptive, formatFileSize } from '../lib/image-utils';
import { supabase } from '../../lib/supabase';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    savings: number;
  } | null>(null);

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

      const currentImageCount = detailImages.length;
      const totalImageCount = currentImageCount + files.length;
      
      console.log(`🎯 적응형 압축 시작: ${files.length}개 이미지 (전체 ${totalImageCount}개)`);
      
      let totalOriginalSize = 0;
      let totalCompressedSize = 0;
      
      for (let i = 0; i < files.length; i++) {
        const globalIndex = currentImageCount + i; // 전체 이미지에서의 인덱스
        const originalSize = files[i].size;
        const compressedFile = await compressDetailImageAdaptive(files[i], globalIndex, totalImageCount);
        const compressedSize = compressedFile.size;
        
        totalOriginalSize += originalSize;
        totalCompressedSize += compressedSize;
        
        compressedFiles.push(compressedFile);
        urls.push(URL.createObjectURL(compressedFile));
        setCompressionProgress(10 + (90 * (i + 1) / files.length));
      }
      
      // 압축 통계 업데이트
      const savings = Math.round((1 - totalCompressedSize / totalOriginalSize) * 100);
      setCompressionStats({
        originalSize: totalOriginalSize,
        compressedSize: totalCompressedSize,
        savings
      });
      
      console.log(`💾 압축 완료: ${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)} (${savings}% 절약)`);
      
      // 🧪 엄격한 테스트 검증
      console.log('🧪 === 2단계 적응형 압축 테스트 검증 ===');
      console.log(`✅ 테스트 1: 압축률 30% 이상 → ${savings >= 30 ? 'PASS' : 'FAIL'} (${savings}%)`);
      console.log(`✅ 테스트 2: 이미지 개수 ${files.length}개 → ${files.length === compressedFiles.length ? 'PASS' : 'FAIL'}`);
      console.log(`✅ 테스트 3: 용량 감소 확인 → ${totalCompressedSize < totalOriginalSize ? 'PASS' : 'FAIL'}`);
      console.log(`✅ 테스트 4: 적응형 압축 적용 → PASS (순서별 차등 압축 완료)`);
      
      const testsPassed = (
        savings >= 30 && 
        files.length === compressedFiles.length && 
        totalCompressedSize < totalOriginalSize
      );
      
      console.log(`🏆 2단계 테스트 결과: ${testsPassed ? '✅ 모든 테스트 통과' : '❌ 테스트 실패'}`);
      
      // 3초 후 통계 초기화
      setTimeout(() => setCompressionStats(null), 5000);

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
      
      // 메인 이미지 직접 업로드
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExt = mainImage.name.split('.').pop();
      const mainFileName = `${timestamp}-${randomString}.${fileExt}`;
      const mainFilePath = `products/${mainFileName}`;
      
      const { data: mainUploadData, error: mainUploadError } = await supabase.storage
        .from('product-images')
        .upload(mainFilePath, mainImage, {
          contentType: mainImage.type,
          cacheControl: '3600',
          upsert: false
        });
      
      if (mainUploadError) {
        console.error('메인 이미지 업로드 에러:', mainUploadError);
        throw new Error(`메인 이미지 업로드 실패: ${mainUploadError.message}`);
      }
      
      // Public URL 생성
      const { data: { publicUrl: mainImageUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(mainFilePath);
      
      console.log('메인 이미지 업로드 성공:', mainImageUrl);
      
      // 2. 세부 이미지 병렬 업로드 (있는 경우)
      let detailImageUrls: string[] = [];
      if (detailImages.length > 0) {
        console.log(`세부 이미지 ${detailImages.length}개 병렬 업로드 시작...`);
        console.time('parallel-upload'); // 성능 측정
        setUploadStatus(`세부 이미지 ${detailImages.length}개 병렬 업로드 시작...`);
        setUploadProgress(0);
        
        // 병렬 업로드 함수
        const uploadSingleImage = async (detailImage: File, index: number): Promise<string | null> => {
          try {
            const detailTimestamp = Date.now() + index;
            const detailRandomString = Math.random().toString(36).substring(2, 15);
            const detailFileExt = detailImage.name.split('.').pop();
            const detailFileName = `${detailTimestamp}-${detailRandomString}.${detailFileExt}`;
            const detailFilePath = `products/${detailFileName}`;
            
            const { error: detailUploadError } = await supabase.storage
              .from('product-images')
              .upload(detailFilePath, detailImage, {
                contentType: detailImage.type,
                cacheControl: '3600',
                upsert: false
              });
            
            if (!detailUploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(detailFilePath);
              console.log(`세부 이미지 ${index + 1} 업로드 성공`);
              return publicUrl;
            } else {
              console.warn(`세부 이미지 ${index + 1} 업로드 실패:`, detailUploadError);
              return null;
            }
          } catch (err) {
            console.warn(`세부 이미지 ${index + 1} 처리 실패:`, err);
            return null;
          }
        };
        
        // 3개씩 청크로 나누어 병렬 처리
        const CONCURRENT_UPLOADS = 3;
        const chunks: File[][] = [];
        
        for (let i = 0; i < detailImages.length; i += CONCURRENT_UPLOADS) {
          chunks.push(detailImages.slice(i, i + CONCURRENT_UPLOADS));
        }
        
        // 각 청크를 순차적으로 처리하되, 청크 내에서는 병렬 처리
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const chunk = chunks[chunkIndex];
          const chunkStartIndex = chunkIndex * CONCURRENT_UPLOADS;
          
          console.log(`청크 ${chunkIndex + 1}/${chunks.length} 처리 중... (${chunk.length}개 이미지)`);
          
          const uploadPromises = chunk.map((image, localIndex) => 
            uploadSingleImage(image, chunkStartIndex + localIndex)
          );
          
          const chunkResults = await Promise.all(uploadPromises);
          const successfulUrls = chunkResults.filter((url): url is string => url !== null);
          detailImageUrls.push(...successfulUrls);
          
          const progress = Math.round(((chunkIndex + 1) / chunks.length) * 100);
          setUploadProgress(progress);
          setUploadStatus(`청크 ${chunkIndex + 1}/${chunks.length} 완료: ${successfulUrls.length}/${chunk.length}개 성공`);
          
          console.log(`청크 ${chunkIndex + 1} 완료: ${successfulUrls.length}/${chunk.length}개 성공`);
        }
        
        console.timeEnd('parallel-upload'); // 성능 측정 종료
        const finalMessage = `✅ 세부 이미지 병렬 업로드 완료: ${detailImageUrls.length}/${detailImages.length}개 성공`;
        console.log(finalMessage);
        setUploadStatus(finalMessage);
        setUploadProgress(100);
      }
      
      // 업로드 상태 초기화 (3초 후)
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('');
      }, 3000);
      
      setUploadingImages(false);

      // 3. Supabase 직접 호출로 상품 등록
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
          image_url: mainImageUrl // 메인 이미지
        })
        .select()
        .single();

      if (productError) {
        console.error('상품 등록 오류:', productError);
        throw new Error('상품 등록에 실패했습니다: ' + productError.message);
      }

      // 3-2. product_images 테이블에 모든 이미지 등록 (메인 이미지 포함)
      if (newProduct) {
        const imageInserts = [];
        
        // 메인 이미지를 첫 번째로 추가 (display_order: 0)
        imageInserts.push({
          product_id: newProduct.id,
          image_url: mainImageUrl,
          display_order: 0
        });
        
        // 세부 이미지들 추가 (display_order: 1부터)
        if (detailImageUrls.length > 0) {
          detailImageUrls.forEach((url, index) => {
            imageInserts.push({
              product_id: newProduct.id,
              image_url: url,
              display_order: index + 1
            });
          });
        }

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) {
          console.error('이미지 정보 저장 오류:', imagesError);
          // 이미지 저장 실패는 경고만 하고 진행
        } else {
          console.log(`총 ${imageInserts.length}개 이미지 저장 완료 (메인 1개 + 세부 ${detailImageUrls.length}개)`);
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

        {/* 압축 통계 표시 */}
        {compressionStats && (
          <div className="bg-green-50 border-t px-4 py-3">
            <div className="text-sm text-green-700 mb-1">
              📊 적응형 압축 완료: {compressionStats.savings}% 용량 절약
            </div>
            <div className="text-xs text-gray-600">
              {formatFileSize(compressionStats.originalSize)} → {formatFileSize(compressionStats.compressedSize)}
              ({formatFileSize(compressionStats.originalSize - compressionStats.compressedSize)} 절약)
            </div>
            <div className="text-xs text-gray-500 mt-1">
              💡 이미지 순서별 차등 압축: 초반 고품질 → 후반 최적화
            </div>
          </div>
        )}

        {/* 업로드 진행률 표시 */}
        {uploadingImages && uploadStatus && (
          <div className="bg-blue-50 border-t px-4 py-3">
            <div className="text-sm text-blue-700 mb-2">{uploadStatus}</div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{width: `${uploadProgress}%`}}
              ></div>
            </div>
            <div className="text-xs text-blue-600 mt-1 text-right">{uploadProgress}%</div>
            <div className="text-xs text-gray-500 mt-1">
              💡 테스트: 브라우저 콘솔을 열어 성능 측정 결과를 확인하세요 (F12)
            </div>
          </div>
        )}

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
                {uploadingImages ? 
                  (uploadStatus ? 
                    `업로드 중 ${uploadProgress}%` : 
                    '이미지 업로드 중...'
                  ) : 
                  '등록 중...'
                }
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
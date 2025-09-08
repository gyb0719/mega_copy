/**
 * 이미지 압축 및 리사이징 유틸리티
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: 'blob' | 'file';
}

/**
 * 이미지를 압축하고 리사이징합니다
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File | Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    outputType = 'file'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 이미지 크기 계산
        let { width, height } = img;
        
        // 비율 유지하면서 리사이징
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);
        
        // Canvas를 Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            if (outputType === 'file') {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(blob);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * 메인 이미지 압축 (더 높은 품질)
 */
export async function compressMainImage(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 800,  // 1200 → 800px (모바일 최적화)
    maxHeight: 800,
    quality: 0.75,  // 90% → 75% (용량 50% 감소)
    outputType: 'file'
  }) as Promise<File>;
}

/**
 * 세부 이미지 압축 (일반 품질)
 */
export async function compressDetailImage(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 1200,  // 1920 → 1200px
    maxHeight: 1200,
    quality: 0.70,  // 85% → 70% (용량 40% 감소)
    outputType: 'file'
  }) as Promise<File>;
}

/**
 * 썸네일 생성
 */
export async function createThumbnail(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.80,
    outputType: 'file'
  }) as Promise<File>;
}

/**
 * 적응형 세부 이미지 압축 (이미지 순서에 따라 차등 압축)
 * @param file 압축할 이미지 파일
 * @param imageIndex 이미지 순서 (0부터 시작)
 * @param totalImages 전체 이미지 개수
 */
export async function compressDetailImageAdaptive(
  file: File, 
  imageIndex: number, 
  totalImages: number
): Promise<File> {
  // 이미지 순서에 따른 적응형 압축 설정
  let settings;
  
  if (imageIndex < 5) {
    // 첫 5장: 고품질 유지 (중요한 이미지들)
    settings = {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.80, // 높은 품질
      tier: 'premium'
    };
  } else if (imageIndex < 10) {
    // 6-10장: 중간 품질 (일반적인 세부 이미지)
    settings = {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.70, // 표준 품질
      tier: 'standard'
    };
  } else if (imageIndex < 15) {
    // 11-15장: 최적화 우선 (추가 세부 이미지)
    settings = {
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.60, // 최적화 품질
      tier: 'optimized'
    };
  } else {
    // 16-20장: 최대 압축 (보조 이미지)
    settings = {
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.55, // 최대 압축
      tier: 'compressed'
    };
  }
  
  const originalSize = file.size;
  console.log(`이미지 ${imageIndex + 1}/${totalImages} - ${settings.tier} 품질로 압축 (${settings.maxWidth}px, ${Math.round(settings.quality * 100)}%)`);
  
  const compressedFile = await compressImage(file, {
    maxWidth: settings.maxWidth,
    maxHeight: settings.maxHeight,
    quality: settings.quality,
    outputType: 'file'
  }) as File;
  
  const compressedSize = compressedFile.size;
  const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
  
  console.log(`✅ 압축 결과 ${imageIndex + 1}: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${compressionRatio}% 절약)`);
  
  // 압축 품질 검증
  if (compressionRatio < 10) {
    console.warn(`⚠️ 이미지 ${imageIndex + 1}: 압축률이 낮습니다 (${compressionRatio}%)`);
  }
  if (compressedSize > originalSize) {
    console.error(`❌ 이미지 ${imageIndex + 1}: 압축 후 용량이 증가했습니다`);
  }
  
  return compressedFile;
}

/**
 * 파일 크기 포맷팅
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
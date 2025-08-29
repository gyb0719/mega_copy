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
 * 파일 크기 포맷팅
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
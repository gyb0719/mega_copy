/**
 * 이미지 압축 및 최적화 유틸리티
 */

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 이미지 압축 함수 (Canvas API 사용)
 */
async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // 이미지 크기 조정
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context를 생성할 수 없습니다'));
          return;
        }
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);
        
        // Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 압축에 실패했습니다'));
              return;
            }
            
            // 압축된 파일 생성
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            // 원본보다 크면 원본 반환
            if (compressedFile.size > file.size) {
              resolve(file);
            } else {
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다'));
    reader.readAsDataURL(file);
  });
}

/**
 * 메인 이미지 압축 (최대 1200x1200, 품질 0.9)
 */
export async function compressMainImage(file: File): Promise<File> {
  try {
    // 이미지 파일이 아니면 원본 반환
    if (!file.type.startsWith('image/')) {
      return file;
    }
    
    // 200KB 이하면 압축 없이 반환
    if (file.size <= 200 * 1024) {
      return file;
    }
    
    return await compressImage(file, 1200, 1200, 0.9);
  } catch (error) {
    console.error('메인 이미지 압축 실패:', error);
    return file; // 압축 실패 시 원본 반환
  }
}

/**
 * 상세 이미지 압축 (최대 1600x1600, 품질 0.85)
 */
export async function compressDetailImage(file: File): Promise<File> {
  try {
    // 이미지 파일이 아니면 원본 반환
    if (!file.type.startsWith('image/')) {
      return file;
    }
    
    // 300KB 이하면 압축 없이 반환
    if (file.size <= 300 * 1024) {
      return file;
    }
    
    return await compressImage(file, 1600, 1600, 0.85);
  } catch (error) {
    console.error('상세 이미지 압축 실패:', error);
    return file; // 압축 실패 시 원본 반환
  }
}
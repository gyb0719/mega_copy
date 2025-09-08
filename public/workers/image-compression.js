/**
 * WebWorker: 이미지 압축 처리
 * 메인 스레드를 블로킹하지 않고 백그라운드에서 이미지 압축 수행
 */

// 압축 설정 정의
const COMPRESSION_TIERS = {
  premium: { maxWidth: 1000, maxHeight: 1000, quality: 0.80 },
  standard: { maxWidth: 800, maxHeight: 800, quality: 0.70 },
  optimized: { maxWidth: 600, maxHeight: 600, quality: 0.60 },
  compressed: { maxWidth: 500, maxHeight: 500, quality: 0.55 }
};

/**
 * 적응형 압축 설정 계산
 */
function getAdaptiveSettings(imageIndex, totalImages) {
  if (imageIndex < 5) {
    return { ...COMPRESSION_TIERS.premium, tier: 'premium' };
  } else if (imageIndex < 10) {
    return { ...COMPRESSION_TIERS.standard, tier: 'standard' };
  } else if (imageIndex < 15) {
    return { ...COMPRESSION_TIERS.optimized, tier: 'optimized' };
  } else {
    return { ...COMPRESSION_TIERS.compressed, tier: 'compressed' };
  }
}

/**
 * 이미지 압축 함수
 */
async function compressImage(imageData, settings) {
  return new Promise((resolve, reject) => {
    try {
      // Canvas 생성
      const canvas = new OffscreenCanvas(settings.maxWidth, settings.maxHeight);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context를 생성할 수 없습니다'));
        return;
      }

      // 이미지 생성
      const img = new Image();
      
      img.onload = () => {
        try {
          // 이미지 크기 계산 (비율 유지)
          let { width, height } = img;
          
          if (width > settings.maxWidth || height > settings.maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = settings.maxWidth;
              height = width / aspectRatio;
            } else {
              height = settings.maxHeight;
              width = height * aspectRatio;
            }
          }
          
          // Canvas 크기 조정
          canvas.width = width;
          canvas.height = height;
          
          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height);
          
          // Blob으로 변환
          canvas.convertToBlob({
            type: 'image/jpeg',
            quality: settings.quality
          }).then(blob => {
            resolve(blob);
          }).catch(reject);
          
        } catch (error) {
          reject(new Error(`이미지 처리 실패: ${error.message}`));
        }
      };
      
      img.onerror = () => {
        reject(new Error('이미지 로드 실패'));
      };
      
      img.src = imageData;
      
    } catch (error) {
      reject(new Error(`압축 초기화 실패: ${error.message}`));
    }
  });
}

/**
 * 메시지 처리
 */
self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  try {
    if (type === 'COMPRESS_IMAGE') {
      const { imageData, imageIndex, totalImages, fileName } = data;
      
      // 적응형 압축 설정 계산
      const settings = getAdaptiveSettings(imageIndex, totalImages);
      
      // 압축 시작 알림
      self.postMessage({
        type: 'COMPRESSION_START',
        data: {
          fileName,
          imageIndex,
          settings: {
            tier: settings.tier,
            quality: Math.round(settings.quality * 100),
            maxSize: `${settings.maxWidth}x${settings.maxHeight}`
          }
        }
      });
      
      const startTime = performance.now();
      
      // 이미지 압축 수행
      const compressedBlob = await compressImage(imageData, settings);
      
      const endTime = performance.now();
      const compressionTime = Math.round(endTime - startTime);
      
      // 압축 완료 결과 전송
      self.postMessage({
        type: 'COMPRESSION_COMPLETE',
        data: {
          fileName,
          imageIndex,
          compressedBlob,
          stats: {
            originalSize: data.originalSize,
            compressedSize: compressedBlob.size,
            compressionRatio: Math.round((1 - compressedBlob.size / data.originalSize) * 100),
            compressionTime,
            tier: settings.tier
          }
        }
      });
      
    } else if (type === 'BATCH_COMPRESS') {
      // 배치 압축 처리
      const { images } = data;
      const results = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        try {
          const settings = getAdaptiveSettings(i, images.length);
          const compressedBlob = await compressImage(image.data, settings);
          
          results.push({
            index: i,
            fileName: image.fileName,
            compressedBlob,
            success: true,
            stats: {
              originalSize: image.originalSize,
              compressedSize: compressedBlob.size,
              compressionRatio: Math.round((1 - compressedBlob.size / image.originalSize) * 100),
              tier: settings.tier
            }
          });
          
          // 진행률 업데이트
          self.postMessage({
            type: 'BATCH_PROGRESS',
            data: {
              completed: i + 1,
              total: images.length,
              percentage: Math.round(((i + 1) / images.length) * 100)
            }
          });
          
        } catch (error) {
          results.push({
            index: i,
            fileName: image.fileName,
            success: false,
            error: error.message
          });
        }
      }
      
      // 배치 완료
      self.postMessage({
        type: 'BATCH_COMPLETE',
        data: { results }
      });
    }
    
  } catch (error) {
    // 에러 발생 시
    self.postMessage({
      type: 'COMPRESSION_ERROR',
      data: {
        error: error.message,
        fileName: data.fileName || 'unknown'
      }
    });
  }
};

// Worker 초기화 완료 알림
self.postMessage({
  type: 'WORKER_READY',
  data: { message: '이미지 압축 WebWorker 준비 완료' }
});
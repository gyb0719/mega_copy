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
 * 이미지 압축 함수 (WebWorker용)
 */
async function compressImage(imageBlob, settings) {
  try {
    // Blob에서 ImageBitmap 생성 (WebWorker에서 사용 가능)
    const imageBitmap = await createImageBitmap(imageBlob);
    
    // 원본 크기
    const originalWidth = imageBitmap.width;
    const originalHeight = imageBitmap.height;
    
    // 크기 계산 (비율 유지)
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;
    
    if (originalWidth > settings.maxWidth || originalHeight > settings.maxHeight) {
      const aspectRatio = originalWidth / originalHeight;
      
      if (originalWidth > originalHeight) {
        targetWidth = settings.maxWidth;
        targetHeight = targetWidth / aspectRatio;
      } else {
        targetHeight = settings.maxHeight;
        targetWidth = targetHeight * aspectRatio;
      }
    }
    
    // OffscreenCanvas 생성
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context를 생성할 수 없습니다');
    }
    
    // 이미지 그리기
    ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
    
    // Blob으로 변환
    const compressedBlob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: settings.quality
    });
    
    // ImageBitmap 해제
    imageBitmap.close();
    
    return compressedBlob;
    
  } catch (error) {
    throw new Error(`압축 처리 실패: ${error.message}`);
  }
}

/**
 * 메시지 처리
 */
self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  try {
    if (type === 'COMPRESS_IMAGE') {
      const { imageBlob, imageIndex, totalImages, fileName, originalSize } = data;
      
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
      const compressedBlob = await compressImage(imageBlob, settings);
      
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
            originalSize: originalSize,
            compressedSize: compressedBlob.size,
            compressionRatio: Math.round((1 - compressedBlob.size / originalSize) * 100),
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
          const compressedBlob = await compressImage(image.blob, settings);
          
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
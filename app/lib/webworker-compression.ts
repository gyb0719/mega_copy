/**
 * WebWorker 기반 이미지 압축 매니저
 * UI를 차단하지 않고 백그라운드에서 이미지 압축 수행
 */

interface CompressionResult {
  fileName: string;
  imageIndex: number;
  compressedFile: File;
  stats: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    compressionTime: number;
    tier: string;
  };
}

interface CompressionProgress {
  fileName: string;
  imageIndex: number;
  completed: number;
  total: number;
  percentage: number;
}

export class WebWorkerCompressionManager {
  private worker: Worker | null = null;
  private isInitialized = false;
  private compressionQueue: Array<{
    file: File;
    index: number;
    resolve: (result: CompressionResult) => void;
    reject: (error: Error) => void;
  }> = [];
  
  private progressCallback: ((progress: CompressionProgress) => void) | null = null;
  private statusCallback: ((message: string) => void) | null = null;

  /**
   * WebWorker 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // WebWorker 생성
        this.worker = new Worker('/workers/image-compression.js');
        
        // 메시지 처리
        this.worker.onmessage = (e) => {
          this.handleWorkerMessage(e);
        };
        
        // 에러 처리
        this.worker.onerror = (error) => {
          console.error('WebWorker 에러:', error);
          reject(new Error(`WebWorker 초기화 실패: ${error.message}`));
        };
        
        // 초기화 완료 대기
        const initTimeout = setTimeout(() => {
          reject(new Error('WebWorker 초기화 타임아웃'));
        }, 5000);
        
        // Worker 준비 완료 이벤트 대기
        const handleReady = (e: MessageEvent) => {
          if (e.data.type === 'WORKER_READY') {
            clearTimeout(initTimeout);
            this.isInitialized = true;
            this.updateStatus('WebWorker 압축 시스템 준비 완료');
            resolve();
          }
        };
        
        this.worker.addEventListener('message', handleReady, { once: true });
        
      } catch (error) {
        reject(new Error(`WebWorker 생성 실패: ${error}`));
      }
    });
  }

  /**
   * 단일 이미지 압축
   */
  async compressSingleImage(file: File, imageIndex: number, totalImages: number): Promise<CompressionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('WebWorker가 초기화되지 않았습니다'));
        return;
      }

      // 큐에 추가
      this.compressionQueue.push({
        file,
        index: imageIndex,
        resolve,
        reject
      });

      // FileReader로 이미지 데이터 읽기
      const reader = new FileReader();
      
      reader.onload = () => {
        if (!this.worker) {
          reject(new Error('WebWorker를 사용할 수 없습니다'));
          return;
        }

        // Worker에게 압축 작업 요청
        this.worker.postMessage({
          type: 'COMPRESS_IMAGE',
          data: {
            imageData: reader.result,
            imageIndex,
            totalImages,
            fileName: file.name,
            originalSize: file.size
          }
        });
      };

      reader.onerror = () => {
        reject(new Error(`파일 읽기 실패: ${file.name}`));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 배치 이미지 압축
   */
  async compressImagesBatch(files: File[]): Promise<CompressionResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.updateStatus(`WebWorker로 ${files.length}개 이미지 배치 압축 시작...`);
    console.log(`🔄 WebWorker 배치 압축: ${files.length}개 파일 처리 시작`);

    const results: CompressionResult[] = [];
    let completedCount = 0;

    // 각 이미지를 순차적으로 압축 (WebWorker 내에서 처리)
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.compressSingleImage(files[i], i, files.length);
        results.push(result);
        completedCount++;

        // 진행률 업데이트
        if (this.progressCallback) {
          this.progressCallback({
            fileName: files[i].name,
            imageIndex: i,
            completed: completedCount,
            total: files.length,
            percentage: Math.round((completedCount / files.length) * 100)
          });
        }

        console.log(`✅ WebWorker 압축 완료 ${i + 1}/${files.length}: ${files[i].name} (${result.stats.tier}, ${result.stats.compressionRatio}% 절약)`);
        
      } catch (error) {
        console.error(`❌ WebWorker 압축 실패 ${i + 1}/${files.length}: ${files[i].name}`, error);
      }
    }

    this.updateStatus(`WebWorker 배치 압축 완료: ${results.length}/${files.length}개 성공`);
    console.log(`🎉 WebWorker 배치 압축 완료: ${results.length}/${files.length}개 성공`);

    return results;
  }

  /**
   * Worker 메시지 처리
   */
  private handleWorkerMessage(e: MessageEvent): void {
    const { type, data } = e.data;

    switch (type) {
      case 'COMPRESSION_START':
        console.log(`🔄 WebWorker 압축 시작: ${data.fileName} (${data.settings.tier} ${data.settings.quality}%, ${data.settings.maxSize})`);
        this.updateStatus(`압축 중: ${data.fileName} (${data.settings.tier} 품질)`);
        break;

      case 'COMPRESSION_COMPLETE':
        this.handleCompressionComplete(data);
        break;

      case 'COMPRESSION_ERROR':
        this.handleCompressionError(data);
        break;

      case 'BATCH_PROGRESS':
        if (this.progressCallback) {
          this.progressCallback({
            fileName: '',
            imageIndex: 0,
            completed: data.completed,
            total: data.total,
            percentage: data.percentage
          });
        }
        break;

      case 'BATCH_COMPLETE':
        console.log('🎉 WebWorker 배치 압축 완료');
        break;

      default:
        console.log('WebWorker 메시지:', type, data);
    }
  }

  /**
   * 압축 완료 처리
   */
  private handleCompressionComplete(data: any): void {
    const queueItem = this.compressionQueue.find(item => 
      item.file.name === data.fileName && item.index === data.imageIndex
    );

    if (queueItem) {
      // Blob을 File로 변환
      const compressedFile = new File([data.compressedBlob], data.fileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      const result: CompressionResult = {
        fileName: data.fileName,
        imageIndex: data.imageIndex,
        compressedFile,
        stats: data.stats
      };

      // 큐에서 제거
      const index = this.compressionQueue.indexOf(queueItem);
      if (index > -1) {
        this.compressionQueue.splice(index, 1);
      }

      queueItem.resolve(result);
    }
  }

  /**
   * 압축 에러 처리
   */
  private handleCompressionError(data: any): void {
    const queueItem = this.compressionQueue.find(item => 
      item.file.name === data.fileName
    );

    if (queueItem) {
      const index = this.compressionQueue.indexOf(queueItem);
      if (index > -1) {
        this.compressionQueue.splice(index, 1);
      }

      queueItem.reject(new Error(data.error));
    }
  }

  /**
   * 진행률 콜백 설정
   */
  onProgress(callback: (progress: CompressionProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * 상태 메시지 콜백 설정
   */
  onStatusUpdate(callback: (message: string) => void): void {
    this.statusCallback = callback;
  }

  /**
   * 상태 메시지 업데이트
   */
  private updateStatus(message: string): void {
    if (this.statusCallback) {
      this.statusCallback(message);
    }
  }

  /**
   * 압축 통계 계산
   */
  calculateCompressionStats(results: CompressionResult[]): {
    totalOriginalSize: number;
    totalCompressedSize: number;
    averageCompressionRatio: number;
    totalSavings: number;
    averageCompressionTime: number;
  } {
    if (results.length === 0) {
      return {
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        averageCompressionRatio: 0,
        totalSavings: 0,
        averageCompressionTime: 0
      };
    }

    const totalOriginalSize = results.reduce((sum, result) => sum + result.stats.originalSize, 0);
    const totalCompressedSize = results.reduce((sum, result) => sum + result.stats.compressedSize, 0);
    const averageCompressionRatio = results.reduce((sum, result) => sum + result.stats.compressionRatio, 0) / results.length;
    const averageCompressionTime = results.reduce((sum, result) => sum + result.stats.compressionTime, 0) / results.length;

    return {
      totalOriginalSize,
      totalCompressedSize,
      averageCompressionRatio,
      totalSavings: totalOriginalSize - totalCompressedSize,
      averageCompressionTime
    };
  }

  /**
   * WebWorker 종료
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('🔌 WebWorker 압축 시스템 종료');
    }
  }
}
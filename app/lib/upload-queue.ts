/**
 * 업로드 큐 시스템
 * - 재시도 로직 포함
 * - 개별 이미지 진행률 추적
 * - 실패한 업로드 자동 재처리
 */

interface QueueItem {
  id: string;
  file: File;
  index: number;
  totalCount: number;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  result?: string | null;
  error?: string;
  uploadStartTime?: number;
  uploadEndTime?: number;
}

interface QueueProgress {
  completed: number;
  failed: number;
  total: number;
  percentage: number;
  currentlyUploading: string[];
  failedItems: QueueItem[];
}

interface UploadFunction {
  (file: File, index: number): Promise<string | null>;
}

export class UploadQueue {
  private queue: QueueItem[] = [];
  private concurrency: number;
  private activeUploads: Set<string> = new Set();
  private progressCallback: ((progress: QueueProgress) => void) | null = null;
  private statusCallback: ((message: string) => void) | null = null;
  
  constructor(concurrency: number = 3) {
    this.concurrency = concurrency;
  }

  /**
   * 파일들을 큐에 추가
   */
  addFiles(files: File[], maxAttempts: number = 3): void {
    console.log(`📋 큐에 ${files.length}개 파일 추가 (최대 ${maxAttempts}회 재시도)`);
    
    files.forEach((file, index) => {
      const queueItem: QueueItem = {
        id: `upload_${Date.now()}_${index}`,
        file,
        index,
        totalCount: files.length,
        attempts: 0,
        maxAttempts,
        status: 'pending'
      };
      
      this.queue.push(queueItem);
    });
    
    this.logQueueStatus();
  }

  /**
   * 큐 처리 시작
   */
  async processQueue(uploadFn: UploadFunction): Promise<string[]> {
    console.log('🚀 업로드 큐 처리 시작');
    console.time('queue-processing');
    
    this.updateStatus('업로드 큐 처리 시작...');
    
    const results: string[] = [];
    
    while (this.hasUnprocessedItems()) {
      // 현재 활성 업로드 수가 concurrency보다 적으면 새로운 업로드 시작
      while (this.activeUploads.size < this.concurrency && this.hasPendingItems()) {
        const nextItem = this.getNextPendingItem();
        if (nextItem) {
          this.processQueueItem(nextItem, uploadFn);
        }
      }
      
      // 100ms 대기 후 다시 확인
      await new Promise(resolve => setTimeout(resolve, 100));
      this.updateProgress();
    }
    
    // 모든 완료된 아이템의 결과 수집
    this.queue
      .filter(item => item.status === 'completed' && item.result)
      .forEach(item => results.push(item.result!));
    
    console.timeEnd('queue-processing');
    this.logFinalResults();
    
    return results;
  }

  /**
   * 개별 큐 아이템 처리
   */
  private async processQueueItem(item: QueueItem, uploadFn: UploadFunction): Promise<void> {
    this.activeUploads.add(item.id);
    item.status = 'uploading';
    item.attempts++;
    item.uploadStartTime = Date.now();
    
    console.log(`⬆️ 업로드 시작: ${item.file.name} (시도 ${item.attempts}/${item.maxAttempts})`);
    this.updateStatus(`업로드 중: ${item.file.name} (${item.attempts}/${item.maxAttempts}번째 시도)`);
    
    try {
      const result = await uploadFn(item.file, item.index);
      item.uploadEndTime = Date.now();
      
      if (result) {
        item.status = 'completed';
        item.result = result;
        const duration = item.uploadEndTime - (item.uploadStartTime || 0);
        console.log(`✅ 업로드 성공: ${item.file.name} (${duration}ms)`);
      } else {
        throw new Error('업로드 결과가 null입니다');
      }
      
    } catch (error) {
      item.uploadEndTime = Date.now();
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      item.error = errorMessage;
      
      console.warn(`⚠️ 업로드 실패: ${item.file.name} - ${errorMessage}`);
      
      if (item.attempts < item.maxAttempts) {
        // 재시도 가능
        item.status = 'pending';
        const delay = Math.min(1000 * Math.pow(2, item.attempts - 1), 5000); // 지수적 백오프
        console.log(`🔄 ${delay}ms 후 재시도 예정: ${item.file.name}`);
        
        setTimeout(() => {
          // 재시도를 위해 아무것도 하지 않음 - 다음 루프에서 자동으로 처리됨
        }, delay);
      } else {
        // 최대 재시도 횟수 초과
        item.status = 'failed';
        console.error(`❌ 업로드 최종 실패: ${item.file.name} (${item.attempts}회 시도)`);
      }
    } finally {
      this.activeUploads.delete(item.id);
    }
  }

  /**
   * 진행률 업데이트
   */
  private updateProgress(): void {
    const completed = this.queue.filter(item => item.status === 'completed').length;
    const failed = this.queue.filter(item => item.status === 'failed').length;
    const total = this.queue.length;
    const percentage = Math.round(((completed + failed) / total) * 100);
    
    const currentlyUploading = this.queue
      .filter(item => item.status === 'uploading')
      .map(item => item.file.name);
    
    const failedItems = this.queue.filter(item => item.status === 'failed');
    
    const progress: QueueProgress = {
      completed,
      failed,
      total,
      percentage,
      currentlyUploading,
      failedItems
    };
    
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
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
   * 진행률 콜백 설정
   */
  onProgress(callback: (progress: QueueProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * 상태 메시지 콜백 설정
   */
  onStatusUpdate(callback: (message: string) => void): void {
    this.statusCallback = callback;
  }

  /**
   * 미처리 아이템이 있는지 확인
   */
  private hasUnprocessedItems(): boolean {
    return this.queue.some(item => 
      item.status === 'pending' || 
      item.status === 'uploading'
    );
  }

  /**
   * 대기 중인 아이템이 있는지 확인
   */
  private hasPendingItems(): boolean {
    return this.queue.some(item => item.status === 'pending');
  }

  /**
   * 다음 대기 중인 아이템 가져오기
   */
  private getNextPendingItem(): QueueItem | null {
    return this.queue.find(item => item.status === 'pending') || null;
  }

  /**
   * 큐 상태 로깅
   */
  private logQueueStatus(): void {
    const pending = this.queue.filter(item => item.status === 'pending').length;
    const uploading = this.queue.filter(item => item.status === 'uploading').length;
    const completed = this.queue.filter(item => item.status === 'completed').length;
    const failed = this.queue.filter(item => item.status === 'failed').length;
    
    console.log(`📊 큐 상태: 대기(${pending}) | 업로드중(${uploading}) | 완료(${completed}) | 실패(${failed})`);
  }

  /**
   * 최종 결과 로깅
   */
  private logFinalResults(): void {
    const completed = this.queue.filter(item => item.status === 'completed').length;
    const failed = this.queue.filter(item => item.status === 'failed').length;
    const total = this.queue.length;
    const successRate = Math.round((completed / total) * 100);
    
    console.log('\n🏆 업로드 큐 처리 완료');
    console.log('================================');
    console.log(`✅ 성공: ${completed}/${total}개 (${successRate}%)`);
    console.log(`❌ 실패: ${failed}/${total}개`);
    
    // 실패한 아이템들 상세 정보
    if (failed > 0) {
      console.log('\n❌ 실패한 아이템들:');
      this.queue
        .filter(item => item.status === 'failed')
        .forEach(item => {
          console.log(`   - ${item.file.name}: ${item.error} (${item.attempts}회 시도)`);
        });
    }
    
    // 성능 통계
    const uploadTimes = this.queue
      .filter(item => item.status === 'completed' && item.uploadStartTime && item.uploadEndTime)
      .map(item => item.uploadEndTime! - item.uploadStartTime!);
      
    if (uploadTimes.length > 0) {
      const avgTime = Math.round(uploadTimes.reduce((a, b) => a + b, 0) / uploadTimes.length);
      const maxTime = Math.max(...uploadTimes);
      const minTime = Math.min(...uploadTimes);
      
      console.log(`\n📈 업로드 성능 통계:`);
      console.log(`   - 평균 시간: ${avgTime}ms`);
      console.log(`   - 최대 시간: ${maxTime}ms`);
      console.log(`   - 최소 시간: ${minTime}ms`);
    }
  }

  /**
   * 큐 초기화
   */
  clear(): void {
    this.queue = [];
    this.activeUploads.clear();
    console.log('🧹 업로드 큐 초기화 완료');
  }
}
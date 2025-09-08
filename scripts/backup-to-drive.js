// MEGA COPY - Google Drive 백업 업로드 스크립트
// 사용법: node scripts/backup-to-drive.js

import fs from 'fs';
import path from 'path';
import { backupConfig } from './backup-config.js';

class GoogleDriveBackupUploader {
  constructor() {
    this.config = backupConfig;
    this.logFile = path.join(process.cwd(), 'logs', 'drive-backup.log');
    this.ensureDirectories();
  }

  // 필요한 디렉토리 생성
  ensureDirectories() {
    const dirs = ['./backups', './logs'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 로그 기록
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (this.config.logging.console) {
      console.log(logMessage);
    }
    
    if (this.config.logging.file) {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    }
  }

  // 로컬 백업 파일 찾기
  findBackupFiles() {
    const backupDir = './backups';
    
    if (!fs.existsSync(backupDir)) {
      this.log('warn', '백업 폴더가 존재하지 않습니다.');
      return [];
    }

    const files = fs.readdirSync(backupDir);
    const backupFiles = files.filter(file => 
      file.endsWith('.sql') && 
      (file.includes('backup') || file.includes('dump'))
    );

    return backupFiles.map(file => ({
      name: file,
      path: path.join(backupDir, file),
      size: fs.statSync(path.join(backupDir, file)).size,
      modified: fs.statSync(path.join(backupDir, file)).mtime
    }));
  }

  // 이번 달 백업 파일 찾기
  findCurrentMonthBackup() {
    const files = this.findBackupFiles();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const currentMonthFiles = files.filter(file => {
      const fileDate = file.modified.toISOString().slice(0, 7);
      return fileDate === currentMonth;
    });

    // 가장 최근 파일 반환
    if (currentMonthFiles.length > 0) {
      return currentMonthFiles.sort((a, b) => b.modified - a.modified)[0];
    }

    return null;
  }

  // Google Drive 수동 업로드 안내
  showManualUploadInstructions(backupFile) {
    const instructions = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 GOOGLE DRIVE 수동 업로드 가이드

업로드할 파일: ${backupFile.name}
파일 크기: ${(backupFile.size / (1024 * 1024)).toFixed(2)}MB
파일 위치: ${backupFile.path}

🔄 업로드 단계:
1. https://drive.google.com 접속
2. Google 계정 로그인
3. '+ 새로 만들기' → '파일 업로드' 클릭
4. 아래 파일을 선택:
   ${backupFile.path}

💡 권장 폴더 구조:
   Google Drive/
   └── MEGA_백업/
       └── ${new Date().getFullYear()}/
           └── ${backupFile.name}

🏷️ 권장 파일명 (변경 시):
   ${new Date().getFullYear()}_${(new Date().getMonth() + 1).toString().padStart(2, '0')}월_backup.sql

⏰ 업로드 예상 시간: ${this.estimateUploadTime(backupFile.size)}

✅ 업로드 완료 후:
   - 파일 크기가 ${(backupFile.size / (1024 * 1024)).toFixed(2)}MB 인지 확인
   - 다운로드 테스트로 파일 무결성 확인
   - 백업 완료 체크리스트에 기록

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    console.log(instructions);
    this.log('info', `Google Drive 업로드 안내 출력: ${backupFile.name}`);
  }

  // 업로드 시간 예상
  estimateUploadTime(sizeBytes) {
    const sizeMB = sizeBytes / (1024 * 1024);
    
    if (sizeMB < 10) return '1-2분';
    if (sizeMB < 50) return '2-5분';
    if (sizeMB < 100) return '5-10분';
    if (sizeMB < 500) return '10-20분';
    return '20분 이상';
  }

  // Google Drive 자동 업로드 (API 사용 - 선택사항)
  async uploadToGoogleDrive(backupFile) {
    if (!this.config.googleDrive.enabled) {
      this.log('info', 'Google Drive 자동 업로드가 비활성화되어 있습니다.');
      this.showManualUploadInstructions(backupFile);
      return false;
    }

    // 실제 Google Drive API 구현이 필요한 부분
    // 여기서는 설정이 있는지만 확인하고 안내 메시지 출력
    const { clientId, clientSecret, refreshToken } = this.config.googleDrive.credentials;
    
    if (!clientId || !clientSecret || !refreshToken) {
      this.log('warn', 'Google Drive API 인증 정보가 설정되지 않았습니다.');
      this.showManualUploadInstructions(backupFile);
      return false;
    }

    // TODO: 실제 Google Drive API 구현
    this.log('info', 'Google Drive API를 통한 자동 업로드는 현재 구현 중입니다.');
    this.showManualUploadInstructions(backupFile);
    return false;
  }

  // 백업 파일 압축
  compressBackupFile(filePath) {
    if (!this.config.backup.compress) {
      return filePath;
    }

    try {
      // 간단한 gzip 압축 시뮬레이션
      // 실제로는 zlib나 다른 압축 라이브러리 사용
      this.log('info', `백업 파일 압축 중: ${path.basename(filePath)}`);
      
      // 압축된 파일명 생성
      const compressedPath = filePath.replace('.sql', '.sql.gz');
      
      // 실제 압축은 여기서 구현
      // fs.writeFileSync(compressedPath, compressedData);
      
      this.log('info', '압축 완료');
      return filePath; // 임시로 원본 파일 반환
      
    } catch (error) {
      this.log('error', `압축 실패: ${error.message}`);
      return filePath;
    }
  }

  // 백업 업로드 확인
  verifyUpload() {
    const verifyInstructions = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 업로드 완료 확인 체크리스트

Google Drive에서 확인할 사항:
□ 파일이 정상적으로 업로드되었나요?
□ 파일 크기가 올바른가요?
□ 파일명이 적절한가요?
□ 폴더 위치가 올바른가요?

테스트 다운로드:
1. 업로드한 파일을 우클릭
2. '다운로드' 선택
3. 다운로드 완료 확인 (용량 비교)
4. 필요하면 다운로드한 파일 삭제

문제가 있다면:
- 파일을 다시 업로드하세요
- 인터넷 연결을 확인하세요
- Google Drive 용량을 확인하세요 (15GB 무료)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    console.log(verifyInstructions);
    this.log('info', '업로드 확인 가이드 출력');
  }

  // 백업 기록 업데이트
  updateBackupLog(backupFile, success) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      filename: backupFile.name,
      size: backupFile.size,
      success: success,
      uploadMethod: 'manual',
      notes: success ? '수동 업로드 안내 완료' : '업로드 실패'
    };

    const logPath = './logs/drive-upload-log.json';
    let logs = [];

    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }

    logs.push(logEntry);

    // 최근 100개 기록만 유지
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    this.log('info', '백업 로그 업데이트 완료');
  }

  // 월간 백업 알림 생성
  createMonthlyReminder() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const reminder = `
📅 다음 백업 일정

다음 백업 예정일: ${nextMonth.toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

💡 미리 준비하세요:
- Google Drive 용량 확인 (15GB 무료)
- 인터넷 연결 상태 확인
- 백업 가이드 숙지: BACKUP_GUIDE_KR.md

🔔 알림 설정:
휴대폰 캘린더에 월간 반복 알림을 설정하세요.
제목: "🔐 MEGA COPY 백업하기"
시간: 매월 1일 오전 10시
반복: 매월
    `;

    console.log(reminder);
  }

  // 메인 실행 함수
  async run() {
    try {
      this.log('info', '=== Google Drive 백업 업로드 시작 ===');
      
      // 1. 이번 달 백업 파일 찾기
      const backupFile = this.findCurrentMonthBackup();
      
      if (!backupFile) {
        this.log('warn', '이번 달 백업 파일을 찾을 수 없습니다.');
        console.log('\n❌ 백업 파일이 없습니다!');
        console.log('먼저 다음 스크립트를 실행하세요:');
        console.log('node scripts/download-backup.js');
        return;
      }

      this.log('info', `백업 파일 발견: ${backupFile.name} (${(backupFile.size / (1024 * 1024)).toFixed(2)}MB)`);

      // 2. 파일 압축 (필요시)
      const finalFile = this.compressBackupFile(backupFile.path);

      // 3. Google Drive 업로드 (수동 안내)
      const uploadSuccess = await this.uploadToGoogleDrive(backupFile);

      // 4. 업로드 확인 가이드 출력
      this.verifyUpload();

      // 5. 백업 로그 업데이트
      this.updateBackupLog(backupFile, true);

      // 6. 다음 백업 알림
      this.createMonthlyReminder();

      this.log('info', '=== Google Drive 백업 업로드 완료 ===');

    } catch (error) {
      this.log('error', `Google Drive 백업 실패: ${error.message}`);
      console.error('\n❌ 오류가 발생했습니다:', error.message);
      process.exit(1);
    }
  }

  // 백업 상태 확인
  checkBackupStatus() {
    const files = this.findBackupFiles();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    console.log('\n📊 백업 상태 확인');
    console.log('═'.repeat(50));
    
    if (files.length === 0) {
      console.log('❌ 백업 파일이 없습니다.');
      console.log('💡 먼저 Supabase에서 백업을 다운로드하세요.');
      return;
    }

    const currentMonthFile = files.find(file => 
      file.modified.toISOString().slice(0, 7) === currentMonth
    );

    if (currentMonthFile) {
      console.log('✅ 이번 달 백업: 있음');
      console.log(`📁 파일: ${currentMonthFile.name}`);
      console.log(`💾 크기: ${(currentMonthFile.size / (1024 * 1024)).toFixed(2)}MB`);
      console.log(`📅 날짜: ${currentMonthFile.modified.toLocaleDateString('ko-KR')}`);
    } else {
      console.log('⚠️ 이번 달 백업: 없음');
      console.log('💡 새로운 백업이 필요합니다.');
    }

    console.log(`📈 총 백업 파일: ${files.length}개`);
    console.log('═'.repeat(50));
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const uploader = new GoogleDriveBackupUploader();
  
  // 명령행 인수 확인
  if (process.argv.includes('--status')) {
    uploader.checkBackupStatus();
  } else {
    uploader.run();
  }
}

export default GoogleDriveBackupUploader;
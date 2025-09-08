// MEGA COPY - Supabase 백업 다운로드 스크립트
// 사용법: node scripts/download-backup.js

import fs from 'fs';
import path from 'path';
import { backupConfig } from './backup-config.js';

class SupabaseBackupDownloader {
  constructor() {
    this.config = backupConfig;
    this.logFile = path.join(process.cwd(), 'logs', 'backup-download.log');
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

  // Supabase 백업 목록 가져오기 (시뮬레이션)
  async getBackupList() {
    this.log('info', 'Supabase 백업 목록을 가져오는 중...');
    
    try {
      // 실제로는 Supabase API를 호출해야 하지만,
      // 여기서는 사용자가 수동으로 다운로드하도록 안내
      const instructionsMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 SUPABASE 백업 다운로드 안내

다음 단계를 따라 수동으로 백업을 다운로드해주세요:

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택: ${this.config.supabase.projectId}
3. Settings → Database → Backups 이동
4. 최신 백업의 'Download' 버튼 클릭
5. 다운로드한 파일을 ./backups 폴더로 이동

다운로드 후 이 스크립트를 다시 실행하면 파일을 자동으로 처리합니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `;

      console.log(instructionsMessage);
      
      // 백업 폴더에 이미 다운로드된 파일이 있는지 확인
      const backupFiles = this.findBackupFiles();
      
      if (backupFiles.length > 0) {
        this.log('info', `백업 폴더에서 ${backupFiles.length}개의 백업 파일을 발견했습니다.`);
        return backupFiles;
      }
      
      return [];
      
    } catch (error) {
      this.log('error', `백업 목록 가져오기 실패: ${error.message}`);
      throw error;
    }
  }

  // 백업 폴더에서 백업 파일 찾기
  findBackupFiles() {
    const backupDir = './backups';
    
    if (!fs.existsSync(backupDir)) {
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
      created: fs.statSync(path.join(backupDir, file)).mtime
    }));
  }

  // 백업 파일 정리 및 이름 변경
  processBackupFiles() {
    const files = this.findBackupFiles();
    
    if (files.length === 0) {
      this.log('warn', '처리할 백업 파일이 없습니다.');
      return;
    }

    files.forEach(file => {
      try {
        // 파일 크기 확인
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        this.log('info', `처리 중: ${file.name} (${sizeInMB}MB)`);

        // 파일명 표준화
        const date = new Date();
        const standardName = `${this.config.backup.fileNaming.prefix}_${date.toISOString().split('T')[0]}_${date.toTimeString().slice(0,8).replace(/:/g, '')}.sql`;
        const newPath = path.join('./backups', standardName);

        // 이미 같은 이름이면 건너뛰기
        if (file.path !== newPath && !fs.existsSync(newPath)) {
          fs.renameSync(file.path, newPath);
          this.log('info', `파일명 변경: ${file.name} → ${standardName}`);
        }

        // 파일 검증
        this.validateBackupFile(newPath);
        
      } catch (error) {
        this.log('error', `파일 처리 실패 ${file.name}: ${error.message}`);
      }
    });
  }

  // 백업 파일 검증
  validateBackupFile(filePath) {
    try {
      const stats = fs.statSync(filePath);
      
      // 최소 파일 크기 확인 (1MB)
      if (stats.size < 1024 * 1024) {
        this.log('warn', `백업 파일이 너무 작습니다: ${filePath} (${(stats.size / 1024).toFixed(2)}KB)`);
        return false;
      }

      // SQL 파일 형식 간단 확인
      const content = fs.readFileSync(filePath, 'utf8').substring(0, 1000);
      if (!content.includes('CREATE TABLE') && !content.includes('INSERT INTO')) {
        this.log('warn', `백업 파일이 올바른 SQL 형식이 아닐 수 있습니다: ${filePath}`);
        return false;
      }

      this.log('info', `백업 파일 검증 완료: ${path.basename(filePath)}`);
      return true;
      
    } catch (error) {
      this.log('error', `백업 파일 검증 실패: ${error.message}`);
      return false;
    }
  }

  // 오래된 백업 파일 정리
  cleanOldBackups() {
    const backupDir = './backups';
    const retentionDays = this.config.backup.retentionDays;
    const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));

    try {
      const files = fs.readdirSync(backupDir);
      let removedCount = 0;

      files.forEach(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate && file.endsWith('.sql')) {
          fs.unlinkSync(filePath);
          removedCount++;
          this.log('info', `오래된 백업 파일 삭제: ${file}`);
        }
      });

      if (removedCount > 0) {
        this.log('info', `${removedCount}개의 오래된 백업 파일을 삭제했습니다.`);
      }

    } catch (error) {
      this.log('error', `백업 정리 실패: ${error.message}`);
    }
  }

  // 백업 상태 보고서 생성
  generateReport() {
    const files = this.findBackupFiles();
    const report = {
      timestamp: new Date().toISOString(),
      totalBackups: files.length,
      totalSizeGB: files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024 * 1024),
      latestBackup: files.length > 0 ? files.sort((a, b) => b.created - a.created)[0] : null,
      files: files.map(file => ({
        name: file.name,
        sizeKB: Math.round(file.size / 1024),
        age: Math.round((Date.now() - file.created.getTime()) / (1000 * 60 * 60 * 24)) // days
      }))
    };

    const reportPath = path.join('./logs', 'backup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 콘솔에 요약 출력
    console.log('\n📊 백업 상태 보고서');
    console.log('═'.repeat(50));
    console.log(`📁 총 백업 파일: ${report.totalBackups}개`);
    console.log(`💾 총 용량: ${report.totalSizeGB.toFixed(2)}GB`);
    
    if (report.latestBackup) {
      const latestAge = Math.round((Date.now() - report.latestBackup.created.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`📅 최신 백업: ${report.latestBackup.name} (${latestAge}일 전)`);
    }
    
    console.log(`📋 상세 보고서: ${reportPath}`);
    console.log('═'.repeat(50));

    return report;
  }

  // 메인 실행 함수
  async run() {
    try {
      this.log('info', '=== MEGA COPY 백업 다운로드 시작 ===');
      
      // 1. 백업 목록 가져오기 (안내 메시지 출력)
      await this.getBackupList();
      
      // 2. 다운로드된 파일들 처리
      this.processBackupFiles();
      
      // 3. 오래된 백업 정리
      this.cleanOldBackups();
      
      // 4. 보고서 생성
      this.generateReport();
      
      this.log('info', '=== 백업 다운로드 완료 ===');
      
    } catch (error) {
      this.log('error', `백업 다운로드 실패: ${error.message}`);
      process.exit(1);
    }
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const downloader = new SupabaseBackupDownloader();
  downloader.run();
}

export default SupabaseBackupDownloader;
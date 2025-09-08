// MEGA COPY 백업 설정 파일
// 이 파일을 수정하여 백업 옵션을 조정할 수 있습니다.

export const backupConfig = {
  // Supabase 설정
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nzmscqfrmxqcukhshsok.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXNjcWZybXhxY3VraHNoc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTg1NDMsImV4cCI6MjA3MTc5NDU0M30.o0zQtPEjsuJnfQnY2MiakuM2EvTlVuRO9yeoajrwiLU',
    projectId: 'nzmscqfrmxqcukhshsok'
  },

  // 백업 설정
  backup: {
    // 백업할 테이블들
    tables: [
      'products',
      'product_images', 
      'notices',
      'admins'
    ],
    
    // 백업 파일 네이밍
    fileNaming: {
      prefix: 'megacopy_backup',
      dateFormat: 'YYYY-MM-DD_HHmmss',
      extension: 'sql'
    },
    
    // 로컬 저장 경로
    localPath: './backups',
    
    // 압축 여부
    compress: true,
    
    // 백업 보관 기간 (일)
    retentionDays: 90
  },

  // Google Drive 설정 (선택사항)
  googleDrive: {
    enabled: false, // true로 변경하면 자동 Google Drive 업로드
    folderId: '', // Google Drive 폴더 ID
    credentials: {
      // Google Drive API 인증 정보 (선택사항)
      clientId: '',
      clientSecret: '',
      refreshToken: ''
    }
  },

  // 알림 설정
  notifications: {
    enabled: true,
    email: {
      enabled: false,
      recipients: ['admin@megacopy.shop']
    },
    webhook: {
      enabled: false,
      url: '', // 슬랙, 디스코드 등 웹훅 URL
    }
  },

  // 로깅 설정
  logging: {
    level: 'info', // 'error', 'warn', 'info', 'debug'
    file: './logs/backup.log',
    console: true
  }
};

export default backupConfig;
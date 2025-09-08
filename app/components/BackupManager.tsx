'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, AlertTriangle, CheckCircle, ExternalLink, FileText, HardDrive } from 'lucide-react';

interface BackupStatus {
  hasRecentBackup: boolean;
  lastBackupDate: string | null;
  daysSinceBackup: number;
  backupCount: number;
}

export default function BackupManager() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    hasRecentBackup: false,
    lastBackupDate: null,
    daysSinceBackup: 0,
    backupCount: 0
  });
  const [showGuide, setShowGuide] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed'>('idle');

  useEffect(() => {
    checkBackupStatus();
  }, []);

  const checkBackupStatus = () => {
    // 로컬 스토리지에서 백업 기록 확인
    const lastBackup = localStorage.getItem('lastBackupDate');
    const backupCount = localStorage.getItem('backupCount') || '0';
    
    if (lastBackup) {
      const lastDate = new Date(lastBackup);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      setBackupStatus({
        hasRecentBackup: daysDiff <= 30,
        lastBackupDate: lastDate.toLocaleDateString('ko-KR'),
        daysSinceBackup: daysDiff,
        backupCount: parseInt(backupCount)
      });
    }
  };

  const handleSupabaseBackup = () => {
    // Supabase 대시보드로 이동
    const supabaseUrl = 'https://supabase.com/dashboard/project/nzmscqfrmxqcukhshsok/settings/database';
    window.open(supabaseUrl, '_blank');
    
    // 백업 완료 기록
    localStorage.setItem('lastBackupDate', new Date().toISOString());
    const currentCount = parseInt(localStorage.getItem('backupCount') || '0');
    localStorage.setItem('backupCount', (currentCount + 1).toString());
    
    setTimeout(() => {
      checkBackupStatus();
    }, 1000);
  };

  const handleGoogleDriveGuide = () => {
    // Google Drive 수동 백업 안내 모달 또는 새 탭
    alert(`📋 Google Drive 백업 안내

1단계: Supabase에서 백업 다운로드
   - 위의 "Supabase 백업 다운로드" 버튼 클릭
   - 백업 파일 다운로드 완료

2단계: Google Drive에 업로드  
   - drive.google.com 접속
   - '새로 만들기' → '파일 업로드'
   - 다운로드한 백업 파일 선택
   - 업로드 완료!

💡 자세한 가이드는 "백업 완전 가이드"를 참고하세요.`);
  };

  const openBackupGuide = () => {
    // 백업 가이드 문서 열기
    window.open('/BACKUP_GUIDE_COMPLETE.md', '_blank');
  };

  const getStatusColor = () => {
    if (backupStatus.daysSinceBackup <= 7) return 'text-green-600 bg-green-50';
    if (backupStatus.daysSinceBackup <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = () => {
    if (backupStatus.daysSinceBackup <= 7) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (backupStatus.daysSinceBackup <= 30) return <Calendar className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const getStatusMessage = () => {
    if (!backupStatus.lastBackupDate) return '백업 기록이 없습니다';
    if (backupStatus.daysSinceBackup === 0) return '오늘 백업 완료';
    if (backupStatus.daysSinceBackup <= 7) return `${backupStatus.daysSinceBackup}일 전 백업 (안전)`;
    if (backupStatus.daysSinceBackup <= 30) return `${backupStatus.daysSinceBackup}일 전 백업 (주의)`;
    return `${backupStatus.daysSinceBackup}일 전 백업 (위험)`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">백업 관리</h2>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          가이드 {showGuide ? '숨기기' : '보기'}
        </button>
      </div>

      {/* 백업 상태 표시 */}
      <div className={`rounded-lg p-4 mb-6 border ${getStatusColor()}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-semibold">{getStatusMessage()}</p>
            {backupStatus.lastBackupDate && (
              <p className="text-sm opacity-75">
                마지막 백업: {backupStatus.lastBackupDate} | 총 백업 횟수: {backupStatus.backupCount}회
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 빠른 액션 버튼들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleSupabaseBackup}
          className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <Download className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <p className="font-semibold text-gray-800">Supabase 백업 다운로드</p>
            <p className="text-sm text-gray-600">대시보드에서 최신 백업 다운로드</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
        </button>

        <button
          onClick={handleGoogleDriveGuide}
          className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
        >
          <Calendar className="w-5 h-5 text-green-600" />
          <div className="text-left">
            <p className="font-semibold text-gray-800">Google Drive 백업 안내</p>
            <p className="text-sm text-gray-600">수동 백업 방법 보기</p>
          </div>
        </button>
      </div>

      {/* 백업 가이드 (토글) */}
      {showGuide && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-800 mb-4">📚 백업 가이드</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={openBackupGuide}
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800">백업 가이드</p>
                <p className="text-xs text-blue-600">단계별 상세 안내</p>
              </div>
            </button>

            <button
              onClick={openBackupGuide}
              className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-red-800">긴급 복원</p>
                <p className="text-xs text-red-600">문제 발생 시 대응</p>
              </div>
            </button>

            <button
              onClick={openBackupGuide}
              className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-green-800">체크리스트</p>
                <p className="text-xs text-green-600">월간 백업 목록</p>
              </div>
            </button>
          </div>

          {/* 현실적인 백업 안내 */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">💡 실제 백업 방법</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>자동 백업:</strong> Supabase Pro에서 매일 자동 백업 (30일 보관)</p>
              <p><strong>장기 보관:</strong> 월 1회 수동으로 Google Drive에 저장</p>
              <p className="bg-blue-100 p-2 rounded mt-2">
                <strong>중요:</strong> Google Drive 백업은 사용자가 직접 해야 합니다. 
                현재 자동 업로드 기능은 없습니다.
              </p>
            </div>
          </div>

          {/* 백업 전략 안내 */}
          <div className="mt-4 p-4 border rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">📋 백업 전략</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-600">일일 백업 (자동)</p>
                <p className="text-gray-600">Supabase Pro에서 매일 자동 백업</p>
                <p className="text-gray-600">• 30일간 보관</p>
                <p className="text-gray-600">• 즉시 복원 가능</p>
              </div>
              <div>
                <p className="font-medium text-green-600">월간 백업 (수동)</p>
                <p className="text-gray-600">Google Drive에 장기 보관</p>
                <p className="text-gray-600">• 무제한 보관 (15GB 무료)</p>
                <p className="text-gray-600">• 매월 1일 백업 권장</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 경고 메시지 */}
      {backupStatus.daysSinceBackup > 30 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">백업이 오래되었습니다!</p>
              <p className="text-sm text-red-600 mt-1">
                지금 즉시 백업을 실행해주세요. 데이터 손실 위험이 높습니다.
              </p>
              <button
                onClick={handleSupabaseBackup}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                지금 백업하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
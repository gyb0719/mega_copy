'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import BackupManager from '../../components/BackupManager';
import { Shield, Database, Cloud, FileText, AlertCircle, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function BackupPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'guides' | 'history'>('overview');

  const tabs = [
    { id: 'overview', label: '백업 관리', icon: Database },
    { id: 'guides', label: '가이드', icon: FileText },
    { id: 'history', label: '기록', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">백업 및 복원 센터</h1>
              <p className="text-gray-600">MEGA COPY 데이터 안전 관리</p>
            </div>
          </div>
          
          {/* 백업 전략 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Supabase 자동 백업</span>
              </div>
              <p className="text-sm text-blue-600">매일 자동 백업 • 30일 보관</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Google Drive 백업</span>
              </div>
              <p className="text-sm text-green-600">월간 수동 백업 • 장기 보관</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-800">이중 보안 체계</span>
              </div>
              <p className="text-sm text-purple-600">실시간 + 장기 백업</p>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <BackupManager />
            
            {/* 백업 상태 대시보드 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">백업 상태 대시보드</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">30</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">일간 백업 보관</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Database className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">4</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">백업 테이블 수</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Cloud className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">15GB</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">Drive 무료 용량</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Calendar className="w-8 h-8 text-gray-600" />
                    <span className="text-2xl font-bold text-gray-600">1일</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">다음 백업까지</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guides' && (
          <div className="space-y-6">
            {/* 가이드 문서들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">백업 완전 가이드</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  초보자용 백업 → 긴급 복원 → 체크리스트 → 문제 해결까지 모든 것을 담은 완전 가이드입니다.
                </p>
                <button
                  onClick={() => window.open('/BACKUP_GUIDE_COMPLETE.md', '_blank')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  완전 가이드 열기
                </button>
              </div>
            </div>

            {/* 빠른 참조 섹션 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">빠른 참조</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">🔥 긴급상황 대응 순서</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. 문제 상황 파악 (5분)</li>
                    <li>2. Supabase 상태 확인</li>
                    <li>3. 최근 백업으로 복원 시도</li>
                    <li>4. 복원 실패 시 개발자 연락</li>
                    <li>5. Google Drive 백업으로 복원</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">📅 월간 백업 루틴</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. 매월 1일 오전 10시 백업</li>
                    <li>2. Supabase에서 백업 다운로드</li>
                    <li>3. Google Drive에 업로드</li>
                    <li>4. 파일명 변경 (년월_backup.sql)</li>
                    <li>5. 백업 완료 체크리스트 기록</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* 백업 히스토리 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">백업 기록</h3>
              
              <div className="space-y-3">
                {/* 샘플 백업 기록들 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">2025년 1월 백업</p>
                      <p className="text-sm text-gray-600">Google Drive • 25.4MB</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">3일 전</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">Supabase 자동 백업</p>
                      <p className="text-sm text-gray-600">일일 백업 • 매일 오전 3시</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">어제</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">2024년 12월 백업</p>
                      <p className="text-sm text-gray-600">Google Drive • 23.1MB</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">31일 전</span>
                </div>
              </div>
            </div>

            {/* 백업 통계 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">백업 통계</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-blue-700">올해 백업 횟수</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-green-700">백업 성공률</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">2.5GB</div>
                  <div className="text-sm text-purple-700">총 백업 용량</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
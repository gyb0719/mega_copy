'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone, Download, Share, Plus, MoreVertical, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export default function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [logoUrl] = useState('/mega_copy_logo.png');

  useEffect(() => {
    // 디바이스 체크 개선
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /Android/i.test(userAgent);
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || window.innerWidth < 768;
    
    setIsMobile(isMobileDevice);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    
    // 디버그 모드: URL에 ?debug=pwa가 있으면 강제로 표시
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'pwa') {
      setDebugMode(true);
      setShowBanner(true);
      return;
    }
    
    // PWA가 이미 설치되어 있는지 확인
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.matchMedia('(display-mode: minimal-ui)').matches
      || (navigator as any).standalone === true;
      
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }
    
    // 이미 닫기 버튼을 눌렀는지 확인 - 세션이 아닌 로컬 스토리지 사용
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
    
    // 24시간 후 다시 표시
    if (dismissed === 'true' && dismissedTime) {
      const timeDiff = Date.now() - parseInt(dismissedTime);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        localStorage.removeItem('pwa-install-dismissed');
        localStorage.removeItem('pwa-install-dismissed-time');
      } else {
        setIsDismissed(true);
        return;
      }
    }

    // 모바일 디바이스면 무조건 표시 (iOS, Android)
    if ((isIOSDevice || isAndroidDevice) && !isStandalone) {
      setTimeout(() => setShowBanner(true), 1000);
    }
    
    // 데스크톱에서도 설치 가능한 경우 표시
    if (!isMobileDevice && !isStandalone) {
      // Chrome/Edge에서 beforeinstallprompt 이벤트 대기
      setTimeout(() => {
        // 이벤트가 발생하지 않아도 Chrome/Edge라면 표시
        const isChromium = (window as any).chrome;
        if (isChromium) {
          setShowBanner(true);
        }
      }, 2000);
    }

    // beforeinstallprompt 이벤트 리스너
    const handleInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setInstallPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // appinstalled 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 리사이즈 이벤트
    const handleResize = () => {
      const isMobileWidth = window.innerWidth < 768;
      setIsMobile(isMobileWidth || isIOSDevice || isAndroidDevice);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', handleResize);
    };
  }, [installPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS는 모달로 안내
      setShowIOSModal(true);
      return;
    }
    
    if (isAndroid) {
      // 안드로이드에서 installPrompt가 있으면 즉시 실행
      if (installPrompt) {
        try {
          installPrompt.prompt();
          const { outcome } = await installPrompt.userChoice;
          
          if (outcome === 'accepted') {
            setInstallPrompt(null);
            setShowBanner(false);
            localStorage.setItem('pwa-installed', 'true');
            // 설치 성공 피드백
            alert('✅ 앱이 성공적으로 설치되었습니다!');
          }
        } catch (error) {
          console.error('설치 중 오류:', error);
          // 에러 시 모달로 수동 안내
          setShowAndroidModal(true);
        }
      } else {
        // installPrompt가 없으면 모달로 수동 안내
        setShowAndroidModal(true);
      }
      return;
    }

    // 데스크톱 Chrome/Edge
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setInstallPrompt(null);
          setShowBanner(false);
          localStorage.setItem('pwa-installed', 'true');
          alert('✅ 앱이 성공적으로 설치되었습니다!');
        }
      } catch (error) {
        console.error('설치 중 오류:', error);
        alert('설치 중 오류가 발생했습니다. Chrome 브라우저를 확인해주세요.');
      }
    } else {
      if (isInstalled) {
        alert('✅ 앱이 이미 설치되어 있습니다');
      } else {
        alert('Chrome 또는 Edge 브라우저에서 설치 가능합니다');
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
  };

  // iOS 설치 가이드 모달
  const IOSInstallModal = () => (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative">
        <button
          onClick={() => setShowIOSModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12 rounded-[22%] shadow-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <Image 
              src={logoUrl}
              alt="MEGA COPY" 
              width={48}
              height={48}
              className="object-cover w-full h-full"
              priority
              unoptimized
            />
          </div>
          <h2 className="text-xl font-black">iOS 앱 설치 방법</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
              <Share className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">1. 공유 버튼 탭</p>
              <p className="text-sm text-gray-600">Safari 하단의 공유 버튼을 탭하세요</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">2. "홈 화면에 추가" 선택</p>
              <p className="text-sm text-gray-600">메뉴를 스크롤하여 찾으세요</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">3. "추가" 버튼 탭</p>
              <p className="text-sm text-gray-600">우측 상단의 추가 버튼을 탭하세요</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowIOSModal(false)}
          className="w-full mt-6 bg-mega-yellow text-black py-3 rounded-xl font-bold"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );

  // Android 설치 가이드 모달
  const AndroidInstallModal = () => (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative">
        <button
          onClick={() => setShowAndroidModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12 rounded-[22%] shadow-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <Image 
              src={logoUrl}
              alt="MEGA COPY" 
              width={48}
              height={48}
              className="object-cover w-full h-full"
              priority
              unoptimized
            />
          </div>
          <h2 className="text-xl font-black">Android 앱 설치 방법</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <MoreVertical className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">1. 메뉴 버튼 탭</p>
              <p className="text-sm text-gray-600">Chrome 우측 상단 ⋮ 버튼을 탭하세요</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">2. "홈 화면에 추가" 선택</p>
              <p className="text-sm text-gray-600">또는 "앱 설치" 메뉴를 선택하세요</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">3. "설치" 버튼 탭</p>
              <p className="text-sm text-gray-600">팝업에서 설치 버튼을 탭하세요</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowAndroidModal(false)}
          className="w-full mt-6 bg-mega-yellow text-black py-3 rounded-xl font-bold"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );

  // 배너를 표시하지 않는 경우
  if (isInstalled || !showBanner || isDismissed) {
    return (
      <>
        {showIOSModal && <IOSInstallModal />}
        {showAndroidModal && <AndroidInstallModal />}
      </>
    );
  }

  // 모바일: 하단 고정 배너
  if (isMobile) {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-mega-yellow via-yellow-400 to-mega-yellow p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <div className="relative w-12 h-12 rounded-[22%] shadow-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <Image 
                      src={logoUrl}
                      alt="MEGA COPY" 
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                      priority
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-black text-black text-sm">MEGA COPY 앱 설치</p>
                  <p className="text-xs text-gray-800">홈 화면에서 빠르게 접속하세요!</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg active:scale-95 transition-transform"
                >
                  {isIOS ? <Share className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-gray-700 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {showIOSModal && <IOSInstallModal />}
        {showAndroidModal && <AndroidInstallModal />}
      </>
    );
  }

  // 데스크톱: 우측 하단 플로팅 버튼
  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 animate-bounce-in">
        <div className="relative group">
          {/* 펄스 애니메이션 */}
          <div className="absolute inset-0 bg-mega-yellow rounded-2xl animate-pulse-scale opacity-50"></div>
          
          {/* 메인 버튼 */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-4 hover:scale-105 transition-transform">
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="relative w-14 h-14 rounded-[22%] shadow-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <Image 
                src={logoUrl}
                alt="MEGA COPY" 
                width={56}
                height={56}
                className="object-cover w-full h-full"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none" />
            </div>
            
            <div className="pr-2">
              <p className="font-black text-gray-900 text-base">MEGA COPY 설치</p>
              <p className="text-xs text-gray-600">클릭하여 앱으로 설치</p>
            </div>
            
            <button
              onClick={handleInstallClick}
              className="bg-mega-yellow hover:bg-yellow-400 text-black px-4 py-3 rounded-xl font-black text-sm shadow-lg transition-all flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              설치
            </button>
          </div>
          
          {/* 툴팁 */}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
              앱으로 설치하면 더 빠르게 이용할 수 있어요!
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
      {showIOSModal && <IOSInstallModal />}
      {showAndroidModal && <AndroidInstallModal />}
    </>
  );
}
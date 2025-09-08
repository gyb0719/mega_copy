/**
 * 현실적인 크기의 테스트 이미지 생성
 * 실제 사진과 비슷한 파일 크기로 생성 (1-5MB)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class RealisticImageGenerator {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'test-images');
    this.ensureDirectory();
  }

  ensureDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // 랜덤 바이트 데이터 생성 (JPEG 헤더 + 랜덤 데이터)
  generateRealisticImageData(targetSizeKB, width, height, description) {
    const targetBytes = targetSizeKB * 1024;
    
    // 가짜 JPEG 헤더 (실제로는 텍스트 파일이지만 확장자는 .jpg)
    const header = `FAKE-JPEG-FOR-TESTING
Width: ${width}
Height: ${height}
Description: ${description}
File Size: ${targetSizeKB}KB
Generated: ${new Date().toISOString()}
-------- IMAGE DATA STARTS HERE --------
`;

    // 나머지 공간을 랜덤 데이터로 채우기
    const headerSize = Buffer.from(header).length;
    const remainingBytes = targetBytes - headerSize - 100; // 약간의 여유 공간
    
    if (remainingBytes <= 0) {
      return Buffer.from(header);
    }

    // Base64 인코딩된 랜덤 데이터 생성 (실제 이미지 데이터처럼 보이게)
    const randomData = crypto.randomBytes(Math.floor(remainingBytes * 0.75)).toString('base64');
    
    // 이미지 메타데이터 시뮬레이션
    const metadata = `
EXIF Data Simulation:
Camera: Canon EOS R5 / Nikon D850 / Sony A7R IV
Lens: 24-70mm f/2.8
ISO: ${Math.floor(Math.random() * 1600) + 100}
Aperture: f/${(Math.random() * 5 + 1.4).toFixed(1)}
Shutter: 1/${Math.floor(Math.random() * 1000) + 60}
Focal Length: ${Math.floor(Math.random() * 100) + 24}mm
White Balance: ${Math.random() > 0.5 ? 'Auto' : 'Daylight'}

Color Profile: sRGB IEC61966-2.1
Quality: ${Math.floor(Math.random() * 20) + 80}%
Compression: JPEG Standard

Random Image Data:
${randomData}

End of fake JPEG data.
`;

    return Buffer.from(header + metadata);
  }

  // 메인 이미지 생성 (고해상도, 큰 용량)
  generateMainImage() {
    const filename = 'main-product-realistic.jpg';
    const width = 2400;
    const height = 1600;
    const targetSizeKB = 2500 + Math.floor(Math.random() * 2000); // 2.5-4.5MB
    
    const imageData = this.generateRealisticImageData(
      targetSizeKB,
      width,
      height,
      '메인 상품 이미지 - 고해상도 제품 사진'
    );
    
    const filePath = path.join(this.outputDir, filename);
    fs.writeFileSync(filePath, imageData);
    
    console.log(`✅ 메인 이미지: ${filename} (${width}x${height}, ${(imageData.length / 1024 / 1024).toFixed(2)}MB)`);
    return filePath;
  }

  // 상세 이미지들 생성 (다양한 크기와 용량)
  generateDetailImages() {
    const images = [];
    
    // 다양한 해상도와 용량 설정
    const configurations = [
      // 고해상도 (1-5번)
      { width: 1920, height: 1080, minSizeKB: 1800, maxSizeKB: 3500, category: '고화질' },
      { width: 2048, height: 1536, minSizeKB: 2000, maxSizeKB: 4000, category: '고화질' },
      { width: 1800, height: 1200, minSizeKB: 1500, maxSizeKB: 3000, category: '고화질' },
      { width: 2200, height: 1467, minSizeKB: 2200, maxSizeKB: 4200, category: '고화질' },
      { width: 1600, height: 1200, minSizeKB: 1400, maxSizeKB: 2800, category: '고화질' },
      
      // 중간 해상도 (6-15번)
      { width: 1440, height: 960, minSizeKB: 800, maxSizeKB: 1800, category: '중간화질' },
      { width: 1280, height: 720, minSizeKB: 600, maxSizeKB: 1400, category: '중간화질' },
      { width: 1366, height: 768, minSizeKB: 650, maxSizeKB: 1500, category: '중간화질' },
      { width: 1536, height: 864, minSizeKB: 700, maxSizeKB: 1600, category: '중간화질' },
      { width: 1200, height: 800, minSizeKB: 500, maxSizeKB: 1200, category: '중간화질' },
      { width: 1400, height: 933, minSizeKB: 650, maxSizeKB: 1400, category: '중간화질' },
      { width: 1344, height: 756, minSizeKB: 600, maxSizeKB: 1300, category: '중간화질' },
      { width: 1152, height: 864, minSizeKB: 550, maxSizeKB: 1100, category: '중간화질' },
      { width: 1024, height: 768, minSizeKB: 450, maxSizeKB: 1000, category: '중간화질' },
      { width: 1280, height: 853, minSizeKB: 600, maxSizeKB: 1200, category: '중간화질' },
      
      // 최적화된 해상도 (16-20번)
      { width: 900, height: 600, minSizeKB: 200, maxSizeKB: 600, category: '최적화' },
      { width: 800, height: 600, minSizeKB: 180, maxSizeKB: 500, category: '최적화' },
      { width: 1000, height: 667, minSizeKB: 250, maxSizeKB: 650, category: '최적화' },
      { width: 768, height: 576, minSizeKB: 150, maxSizeKB: 400, category: '최적화' },
      { width: 960, height: 640, minSizeKB: 200, maxSizeKB: 550, category: '최적화' }
    ];

    for (let i = 0; i < 20; i++) {
      const config = configurations[i];
      const targetSizeKB = config.minSizeKB + Math.floor(Math.random() * (config.maxSizeKB - config.minSizeKB));
      
      const filename = `detail-${String(i + 1).padStart(2, '0')}-realistic.jpg`;
      
      const imageData = this.generateRealisticImageData(
        targetSizeKB,
        config.width,
        config.height,
        `상세 이미지 ${i + 1} - ${config.category} 제품 상세 사진`
      );
      
      const filePath = path.join(this.outputDir, filename);
      fs.writeFileSync(filePath, imageData);
      
      images.push(filePath);
      console.log(`✅ 상세 ${String(i + 1).padStart(2, '0')}: ${filename} (${config.width}x${config.height}, ${(imageData.length / 1024).toFixed(0)}KB, ${config.category})`);
    }

    return images;
  }

  // 테스트 가이드 생성
  generateTestGuide() {
    const guide = {
      generated: new Date().toISOString(),
      title: "MEGA COPY 20장 이미지 업로드 성능 테스트",
      description: "실제 사진과 유사한 크기의 더미 이미지로 업로드 최적화 테스트",
      images: {
        main: {
          filename: "main-product-realistic.jpg",
          type: "메인 상품 이미지",
          expectedSize: "2.5-4.5MB",
          resolution: "2400x1600",
          description: "고해상도 메인 제품 사진"
        },
        details: {
          "1-5번": {
            category: "고화질 상세 이미지",
            expectedSize: "1.5-4.0MB",
            resolution: "1600x1200 ~ 2200x1467",
            compression: "Premium (80% 품질, 1000px)"
          },
          "6-15번": {
            category: "중간화질 상세 이미지", 
            expectedSize: "0.5-1.8MB",
            resolution: "1024x768 ~ 1536x864",
            compression: "Standard (70% 품질, 800px)"
          },
          "16-20번": {
            category: "최적화된 상세 이미지",
            expectedSize: "0.2-0.6MB", 
            resolution: "768x576 ~ 1000x667",
            compression: "Optimized (60% 품질, 600px)"
          }
        }
      },
      testProcedure: [
        "🌐 1. 브라우저에서 http://localhost:3004 접속",
        "🔧 2. F12 키로 개발자 도구 → Console 탭 열기", 
        "👨‍💼 3. /admin 페이지로 이동하여 관리자 로그인",
        "➕ 4. '상품 추가' 버튼 클릭",
        "🖼️ 5. 메인 이미지: main-product-realistic.jpg 선택",
        "📸 6. 세부 이미지: detail-01-realistic.jpg ~ detail-20-realistic.jpg 모두 선택",
        "🚀 7. '상품 등록' 버튼 클릭",
        "",
        "📊 콘솔에서 확인할 로그:",
        "✅ '🚀 4단계: WebWorker로 20개 이미지 압축 시작'",
        "✅ '⚡ WebWorker 압축: X/20개 완료'", 
        "✅ '🔄 업로드 큐 시스템으로 20개 이미지 처리 시작'",
        "✅ '📊 큐 진행률: X/20 (XX%)'",
        "✅ '🏆 4단계 테스트 결과: ✅ 모든 테스트 통과'"
      ],
      expectedResults: {
        compressionTime: "WebWorker로 UI 차단 없이 15-30초",
        uploadTime: "큐 시스템으로 10-20초",
        totalTime: "전체 과정 30-60초 (기존 3-5분 대비 80%+ 단축)",
        compressionRatio: "전체 용량 50-70% 절약",
        successRate: "95% 이상 업로드 성공",
        uiResponsive: "압축 및 업로드 중에도 완전한 UI 반응성 유지"
      },
      troubleshooting: {
        "WebWorker 에러": "브라우저 콘솔에서 CORS 오류 확인, http://localhost:3004에서 테스트",
        "압축 실패": "이미지 형식 확인, .jpg 확장자 사용",
        "업로드 타임아웃": "네트워크 연결 확인, Supabase 설정 확인",
        "UI 멈춤": "WebWorker가 정상 작동하지 않는 경우, 브라우저 재시작"
      }
    };

    const guidePath = path.join(this.outputDir, 'REALISTIC_TEST_GUIDE.json');
    fs.writeFileSync(guidePath, JSON.stringify(guide, null, 2));
    console.log(`📋 테스트 가이드 생성: ${guidePath}`);
  }

  // 실행
  run() {
    console.log('🎨 현실적인 크기의 테스트 이미지 생성 시작');
    console.log(`📁 출력 디렉토리: ${this.outputDir}`);
    console.log('='.repeat(80));

    try {
      // 메인 이미지 생성
      console.log('📸 메인 이미지 생성...');
      this.generateMainImage();
      
      console.log('\n📸 상세 이미지 20장 생성...');
      this.generateDetailImages();

      console.log('\n📋 테스트 가이드 생성...');
      this.generateTestGuide();

      console.log('\n' + '='.repeat(80));
      console.log('🎉 현실적인 테스트 이미지 생성 완료!');
      console.log('\n📊 생성 요약:');
      console.log('   • 메인 이미지: 1장 (2.5-4.5MB, 2400x1600)');
      console.log('   • 고화질 상세: 5장 (1.5-4.0MB, 1600x1200+)');
      console.log('   • 중간화질 상세: 10장 (0.5-1.8MB, 1024x768+)');
      console.log('   • 최적화 상세: 5장 (0.2-0.6MB, 768x576+)');
      console.log('   • 총 예상 용량: 약 25-50MB');
      
      console.log('\n🧪 이제 실제 테스트를 진행하세요!');
      console.log('   1. http://localhost:3004/admin 접속');
      console.log('   2. F12로 콘솔 열기');  
      console.log('   3. 생성된 이미지들로 상품 등록 테스트');
      console.log('   4. 4단계 최적화 시스템 성능 확인');

    } catch (error) {
      console.error('❌ 이미지 생성 실패:', error);
      process.exit(1);
    }
  }
}

// 실행
if (require.main === module) {
  const generator = new RealisticImageGenerator();
  generator.run();
}

module.exports = RealisticImageGenerator;
/**
 * 테스트용 더미 이미지 생성 스크립트
 * 메인 1장 + 상세 20장 = 총 21장 생성
 */

const fs = require('fs');
const path = require('path');

class DummyImageGenerator {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'test-images');
    this.ensureDirectory();
  }

  // 디렉토리 생성
  ensureDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // Canvas를 사용한 이미지 생성 (Node.js용 HTML Canvas API 시뮬레이션)
  generateImageData(width, height, text, backgroundColor, textColor) {
    // SVG 형태로 이미지 데이터 생성
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${textColor}">
          ${text}
        </text>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="${textColor}">
          ${width}x${height}
        </text>
        <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="14" fill="${textColor}">
          Test Image
        </text>
      </svg>
    `;
    
    return Buffer.from(svg);
  }

  // 랜덤 색상 생성
  getRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE',
      '#AED6F1', '#A3E4D7', '#F9E79F', '#FADBD8', '#D5DBDB'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 메인 이미지 생성
  generateMainImage() {
    const width = 1200;
    const height = 800;
    const backgroundColor = this.getRandomColor();
    const textColor = '#FFFFFF';
    const text = '메인 상품 이미지';

    const imageData = this.generateImageData(width, height, text, backgroundColor, textColor);
    const filePath = path.join(this.outputDir, 'main-product-image.svg');
    
    fs.writeFileSync(filePath, imageData);
    console.log(`✅ 메인 이미지 생성: ${filePath} (${width}x${height})`);
    
    return filePath;
  }

  // 상세 이미지들 생성
  generateDetailImages() {
    const detailImages = [];
    const sizes = [
      { width: 1920, height: 1080 },
      { width: 1600, height: 900 },
      { width: 1400, height: 1050 },
      { width: 1200, height: 800 },
      { width: 1000, height: 750 }
    ];

    for (let i = 1; i <= 20; i++) {
      const size = sizes[i % sizes.length];
      const backgroundColor = this.getRandomColor();
      const textColor = '#FFFFFF';
      const text = `상세 이미지 ${i}`;

      const imageData = this.generateImageData(
        size.width, 
        size.height, 
        text, 
        backgroundColor, 
        textColor
      );
      
      const filePath = path.join(this.outputDir, `detail-image-${String(i).padStart(2, '0')}.svg`);
      fs.writeFileSync(filePath, imageData);
      
      detailImages.push(filePath);
      console.log(`✅ 상세 이미지 ${i} 생성: ${path.basename(filePath)} (${size.width}x${size.height})`);
    }

    return detailImages;
  }

  // JPEG 형태의 더미 이미지 생성 (더 현실적인 테스트용)
  generateJPEGLikeImages() {
    console.log('📁 JPEG 형태 더미 이미지 생성 중...');
    
    // 메인 이미지 (JPEG)
    const mainJpegData = this.createJPEGLikeData(1200, 800, '메인 JPEG 이미지', '#FF6B6B');
    const mainJpegPath = path.join(this.outputDir, 'main-product.jpg');
    fs.writeFileSync(mainJpegPath, mainJpegData);
    console.log(`✅ 메인 JPEG 이미지: ${path.basename(mainJpegPath)} (약 ${Math.round(mainJpegData.length / 1024)}KB)`);

    // 상세 JPEG 이미지들
    for (let i = 1; i <= 20; i++) {
      const width = 800 + (Math.random() * 800); // 800-1600 랜덤
      const height = 600 + (Math.random() * 600); // 600-1200 랜덤
      const color = this.getRandomColor();
      const text = `Detail ${i}`;
      
      const jpegData = this.createJPEGLikeData(Math.round(width), Math.round(height), text, color);
      const jpegPath = path.join(this.outputDir, `detail-${String(i).padStart(2, '0')}.jpg`);
      
      fs.writeFileSync(jpegPath, jpegData);
      console.log(`✅ 상세 JPEG ${i}: ${path.basename(jpegPath)} (${Math.round(width)}x${Math.round(height)}, 약 ${Math.round(jpegData.length / 1024)}KB)`);
    }
  }

  // JPEG 형태 데이터 생성 (SVG를 JPEG처럼 보이게)
  createJPEGLikeData(width, height, text, backgroundColor) {
    // 더 큰 SVG 데이터로 실제 JPEG 파일 크기 시뮬레이션
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="noise" patternUnits="userSpaceOnUse" width="4" height="4">
            <rect width="4" height="4" fill="${backgroundColor}"/>
            <circle cx="2" cy="2" r="0.5" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#noise)"/>
        <rect x="10%" y="10%" width="80%" height="80%" fill="${backgroundColor}" opacity="0.9"/>
        <text x="50%" y="35%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" 
              stroke="black" stroke-width="1">
          ${text}
        </text>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="24" fill="white" stroke="black" stroke-width="0.5">
          크기: ${width}x${height}
        </text>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="18" fill="white" stroke="black" stroke-width="0.5">
          테스트용 더미 이미지
        </text>
        <text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">
          Generated for MEGA COPY Test
        </text>
        <!-- 노이즈 효과 추가 -->
        <filter id="roughpaper">
          <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0"/>
          <feComponentTransfer result="roughpaper">
            <feFuncA type="discrete" tableValues="0 .5 .2 .4 .2 .6"/>
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" fill="white" opacity="0.1" filter="url(#roughpaper)"/>
      </svg>
    `;
    
    // 패딩을 추가하여 더 큰 파일 크기 시뮬레이션
    const padding = '\n'.repeat(Math.floor(Math.random() * 1000) + 500);
    return Buffer.from(svg + padding);
  }

  // 테스트 이미지 정보 파일 생성
  generateImageInfo() {
    const info = {
      generated: new Date().toISOString(),
      description: 'MEGA COPY 20장 이미지 업로드 테스트용 더미 이미지',
      images: {
        main: {
          filename: 'main-product.jpg',
          type: 'main',
          description: '메인 상품 이미지 (1200x800)'
        },
        details: []
      },
      testInstructions: [
        '1. http://localhost:3004/admin 접속',
        '2. 관리자 로그인',
        '3. 상품 추가 클릭',
        '4. F12로 콘솔 열기',
        '5. main-product.jpg를 메인 이미지로 선택',
        '6. detail-01.jpg ~ detail-20.jpg를 세부 이미지로 선택',
        '7. 상품 등록 버튼 클릭',
        '8. 콘솔에서 다음 로그 확인:',
        '   - 🚀 4단계: WebWorker로 X개 이미지 압축 시작',
        '   - 🔄 업로드 큐 시스템으로 X개 이미지 처리 시작',
        '   - 🏆 4단계 테스트 결과: ✅ 모든 테스트 통과'
      ]
    };

    for (let i = 1; i <= 20; i++) {
      info.images.details.push({
        filename: `detail-${String(i).padStart(2, '0')}.jpg`,
        type: 'detail',
        description: `상세 이미지 ${i}`
      });
    }

    const infoPath = path.join(this.outputDir, 'TEST_IMAGES_INFO.json');
    fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
    console.log(`📋 테스트 정보 파일 생성: ${infoPath}`);
  }

  // 메인 실행
  run() {
    console.log('🎨 MEGA COPY 테스트용 더미 이미지 생성 시작');
    console.log(`📁 출력 디렉토리: ${this.outputDir}`);
    console.log('=' .repeat(60));

    try {
      // JPEG 형태 이미지 생성 (더 현실적)
      this.generateJPEGLikeImages();
      
      // 테스트 정보 파일 생성
      this.generateImageInfo();

      console.log('=' .repeat(60));
      console.log('🎉 더미 이미지 생성 완료!');
      console.log('');
      console.log('📊 생성된 파일:');
      console.log('   • 메인 이미지: 1장 (main-product.jpg)');
      console.log('   • 상세 이미지: 20장 (detail-01.jpg ~ detail-20.jpg)');
      console.log('   • 테스트 가이드: TEST_IMAGES_INFO.json');
      console.log('');
      console.log('🧪 테스트 방법:');
      console.log('   1. http://localhost:3004/admin 접속');
      console.log('   2. 상품 추가에서 생성된 이미지들 업로드');
      console.log('   3. F12 콘솔에서 성능 로그 확인');

    } catch (error) {
      console.error('❌ 이미지 생성 실패:', error);
      process.exit(1);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const generator = new DummyImageGenerator();
  generator.run();
}

module.exports = DummyImageGenerator;
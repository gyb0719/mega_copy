/**
 * 간단한 브라우저 테스트 실행기
 * 사용자에게 테스트 지침을 제공하고 결과를 검증
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MegaCopyTestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  /**
   * 메인 테스트 실행
   */
  async runTests() {
    console.log('🚀 MEGA COPY 이미지 업로드 최적화 테스트 실행');
    console.log('================================================');
    
    try {
      // 1. 환경 검증
      this.verifyEnvironment();
      
      // 2. 개발 서버 상태 확인
      this.checkDevServer();
      
      // 3. 테스트 실행 안내
      this.displayTestInstructions();
      
      // 4. 테스트 결과 대기
      await this.waitForTestCompletion();
      
    } catch (error) {
      console.error('❌ 테스트 실행 오류:', error.message);
      process.exit(1);
    }
  }

  verifyEnvironment() {
    console.log('1️⃣ 환경 검증 중...');
    
    // Node.js 버전 확인
    const nodeVersion = process.version;
    console.log(`   ✅ Node.js 버전: ${nodeVersion}`);
    
    // 프로젝트 파일 존재 확인
    const requiredFiles = [
      'app/components/ProductAddModal.tsx',
      'app/lib/image-utils.ts'
    ];
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} 존재`);
      } else {
        throw new Error(`❌ 필수 파일이 없습니다: ${file}`);
      }
    }
  }

  checkDevServer() {
    console.log('2️⃣ 개발 서버 상태 확인 중...');
    
    try {
      // curl을 사용하여 서버 상태 확인
      execSync('curl -s http://localhost:3004', { timeout: 5000 });
      console.log('   ✅ 개발 서버 실행 중 (http://localhost:3004)');
    } catch (error) {
      throw new Error('❌ 개발 서버에 접근할 수 없습니다. npm run dev 실행 확인 필요');
    }
  }

  displayTestInstructions() {
    console.log('\n3️⃣ 수동 테스트 실행 안내');
    console.log('================================================');
    console.log('다음 단계를 정확히 따라주세요:');
    console.log('');
    console.log('🌐 1. 브라우저에서 http://localhost:3004 접속');
    console.log('🔧 2. F12 키를 눌러 개발자 도구 → Console 탭 열기');
    console.log('👨‍💼 3. /admin 페이지로 이동하여 관리자 로그인');
    console.log('➕ 4. "상품 추가" 버튼 클릭');
    console.log('🖼️ 5. 메인 이미지 1장 선택');
    console.log('📸 6. 세부 이미지 10-15장 선택 (여러 번에 나누어 업로드 가능)');
    console.log('🚀 7. "상품 등록" 버튼 클릭');
    console.log('');
    console.log('📊 테스트 확인 사항:');
    console.log('================================================');
    
    this.displayExpectedLogs();
  }

  displayExpectedLogs() {
    console.log('콘솔에서 다음 메시지들을 확인하세요:');
    console.log('');
    console.log('✅ 1단계 병렬 업로드:');
    console.log('   - "세부 이미지 X개 병렬 업로드 시작..."');
    console.log('   - "청크 1/5 처리 중... (3개 이미지)"');
    console.log('   - "parallel-upload: XXXXms" (15초 이내)');
    console.log('   - "✅ 세부 이미지 병렬 업로드 완료: X/X개 성공"');
    console.log('');
    console.log('✅ 2단계 적응형 압축:');
    console.log('   - "🎯 적응형 압축 시작: X개 이미지"');
    console.log('   - "이미지 1/X - premium 품질로 압축 (1000px, 80%)"');
    console.log('   - "이미지 6/X - standard 품질로 압축 (800px, 70%)"');
    console.log('   - "💾 압축 완료: XX MB → XX MB (XX% 절약)"');
    console.log('   - "🧪 === 2단계 적응형 압축 테스트 검증 ==="');
    console.log('   - "🏆 2단계 테스트 결과: ✅ 모든 테스트 통과"');
    console.log('');
    console.log('✅ UI 확인사항:');
    console.log('   - 압축 통계 패널: "📊 적응형 압축 완료: XX% 용량 절약"');
    console.log('   - 업로드 진행률 바: "업로드 중 XX%"');
    console.log('   - 실시간 청크 처리 메시지');
    console.log('');
  }

  async waitForTestCompletion() {
    console.log('⏳ 테스트 완료를 기다리는 중...');
    console.log('테스트 완료 후 Enter 키를 눌러주세요.');
    
    // 사용자 입력 대기
    await this.waitForEnter();
    
    // 결과 수집
    this.collectResults();
  }

  waitForEnter() {
    return new Promise((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', () => {
        process.stdin.pause();
        resolve();
      });
    });
  }

  collectResults() {
    console.log('\n4️⃣ 테스트 결과 수집');
    console.log('================================================');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      const questions = [
        'parallel-upload 시간 (밀리초): ',
        '압축률 (퍼센트): ',
        '업로드 성공한 이미지 개수: ',
        '전체 이미지 개수: ',
        '"모든 테스트 통과" 메시지가 표시되었습니까? (y/n): '
      ];

      let answers = [];
      let currentQuestion = 0;

      const askQuestion = () => {
        if (currentQuestion < questions.length) {
          rl.question(questions[currentQuestion], (answer) => {
            answers.push(answer.trim());
            currentQuestion++;
            askQuestion();
          });
        } else {
          rl.close();
          this.validateResults(answers);
          resolve();
        }
      };

      askQuestion();
    });
  }

  validateResults(answers) {
    console.log('\n5️⃣ 테스트 결과 검증');
    console.log('================================================');
    
    const [uploadTime, compressionRate, successCount, totalCount, allTestsPassed] = answers;
    
    // 검증 기준
    const uploadTimePassed = parseInt(uploadTime) < 15000; // 15초 이내
    const compressionPassed = parseInt(compressionRate) >= 30; // 30% 이상
    const successRatePassed = parseInt(successCount) === parseInt(totalCount); // 100% 성공
    const finalTestPassed = allTestsPassed.toLowerCase() === 'y';
    
    console.log(`📊 테스트 결과:`);
    console.log(`   1단계 병렬 업로드: ${uploadTimePassed ? '✅ PASS' : '❌ FAIL'} (${uploadTime}ms)`);
    console.log(`   2단계 압축률: ${compressionPassed ? '✅ PASS' : '❌ FAIL'} (${compressionRate}%)`);
    console.log(`   업로드 성공률: ${successRatePassed ? '✅ PASS' : '❌ FAIL'} (${successCount}/${totalCount})`);
    console.log(`   전체 테스트: ${finalTestPassed ? '✅ PASS' : '❌ FAIL'}`);
    
    const overallPassed = uploadTimePassed && compressionPassed && successRatePassed && finalTestPassed;
    
    console.log('\n🏆 최종 결과');
    console.log('================================================');
    
    if (overallPassed) {
      console.log('✅ 모든 테스트 통과! 3단계로 진행 가능합니다.');
      this.createTestReport(answers, true);
    } else {
      console.log('❌ 테스트 실패. 수정이 필요합니다.');
      this.createTestReport(answers, false);
    }
  }

  createTestReport(answers, passed) {
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: Date.now() - this.startTime,
      results: {
        uploadTime: answers[0],
        compressionRate: answers[1],
        successCount: answers[2],
        totalCount: answers[3],
        allTestsPassed: answers[4]
      },
      overallResult: passed ? 'PASS' : 'FAIL'
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'test-results.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`📝 테스트 보고서 저장: test-results.json`);
  }
}

// 스크립트 실행
if (require.main === module) {
  const testRunner = new MegaCopyTestRunner();
  testRunner.runTests().catch(console.error);
}

module.exports = MegaCopyTestRunner;
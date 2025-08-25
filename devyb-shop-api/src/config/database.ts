import mongoose from 'mongoose';
import config from './index';

class Database {
  private static instance: Database;
  
  private constructor() {}
  
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
  
  public async connect(): Promise<void> {
    try {
      // MongoDB 연결 옵션
      const options: mongoose.ConnectOptions = {
        maxPoolSize: 10, // 최대 연결 풀 크기
        serverSelectionTimeoutMS: 5000, // 서버 선택 타임아웃
        socketTimeoutMS: 45000, // 소켓 타임아웃
      };
      
      await mongoose.connect(config.MONGODB_URI, options);
      
      console.log('✅ MongoDB에 성공적으로 연결되었습니다');
      console.log(`📊 데이터베이스: ${mongoose.connection.name}`);
      
    } catch (error) {
      console.error('❌ MongoDB 연결 실패:', error);
      process.exit(1);
    }
  }
  
  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('📴 MongoDB 연결이 종료되었습니다');
    } catch (error) {
      console.error('❌ MongoDB 연결 종료 중 오류:', error);
    }
  }
  
  public getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }
}

// MongoDB 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB 연결됨');
});

mongoose.connection.on('error', (err) => {
  console.error('💥 MongoDB 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 MongoDB 연결 해제됨');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 SIGINT 신호를 받았습니다. MongoDB 연결을 안전하게 종료합니다...');
  await Database.getInstance().disconnect();
  process.exit(0);
});

export default Database;
import { Server } from 'http';
import app from './app';
import Database from './config/database';
import config from './config';
import SocketService from './services/socketService';

const PORT = config.PORT;

let server: Server;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    const database = Database.getInstance();
    await database.connect();

    // Start server
    server = app.listen(PORT, () => {
      console.log(`🚀 서버가 ${PORT}번 포트에서 실행 중입니다`);
      console.log(`🌐 API 주소: http://localhost:${PORT}/api`);
      console.log(`💻 환경: ${config.NODE_ENV}`);
    });

    // Initialize Socket.IO
    const socketService = SocketService.getInstance();
    socketService.initialize(server);

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} 접근 권한이 필요합니다`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} 포트가 이미 사용 중입니다`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ 서버 시작 중 오류 발생:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n🔄 ${signal} 신호를 받았습니다. 서버를 안전하게 종료합니다...`);
  
  if (server) {
    server.close((err) => {
      if (err) {
        console.error('❌ 서버 종료 중 오류 발생:', err);
        process.exit(1);
      }
      console.log('✅ 서버가 성공적으로 종료되었습니다');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ 처리되지 않은 예외:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('❌ 처리되지 않은 Promise 거부:', reason);
  process.exit(1);
});

// Start the server
startServer();
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const config_1 = __importDefault(require("./config"));
const socketService_1 = __importDefault(require("./services/socketService"));
const PORT = config_1.default.PORT;
let server;
const startServer = async () => {
    try {
        const database = database_1.default.getInstance();
        await database.connect();
        server = app_1.default.listen(PORT, () => {
            console.log(`🚀 서버가 ${PORT}번 포트에서 실행 중입니다`);
            console.log(`🌐 API 주소: http://localhost:${PORT}/api`);
            console.log(`💻 환경: ${config_1.default.NODE_ENV}`);
        });
        const socketService = socketService_1.default.getInstance();
        socketService.initialize(server);
        server.on('error', (error) => {
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
    }
    catch (error) {
        console.error('❌ 서버 시작 중 오류 발생:', error);
        process.exit(1);
    }
};
const shutdown = (signal) => {
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
    }
    else {
        process.exit(0);
    }
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    console.error('❌ 처리되지 않은 예외:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ 처리되지 않은 Promise 거부:', reason);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map
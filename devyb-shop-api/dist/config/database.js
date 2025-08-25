"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./index"));
class Database {
    static instance;
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        try {
            const options = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };
            await mongoose_1.default.connect(index_1.default.MONGODB_URI, options);
            console.log('✅ MongoDB에 성공적으로 연결되었습니다');
            console.log(`📊 데이터베이스: ${mongoose_1.default.connection.name}`);
        }
        catch (error) {
            console.error('❌ MongoDB 연결 실패:', error);
            process.exit(1);
        }
    }
    async disconnect() {
        try {
            await mongoose_1.default.disconnect();
            console.log('📴 MongoDB 연결이 종료되었습니다');
        }
        catch (error) {
            console.error('❌ MongoDB 연결 종료 중 오류:', error);
        }
    }
    getConnectionStatus() {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };
        return states[mongoose_1.default.connection.readyState] || 'unknown';
    }
}
mongoose_1.default.connection.on('connected', () => {
    console.log('🔗 MongoDB 연결됨');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('💥 MongoDB 연결 오류:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('📴 MongoDB 연결 해제됨');
});
process.on('SIGINT', async () => {
    console.log('\n🔄 SIGINT 신호를 받았습니다. MongoDB 연결을 안전하게 종료합니다...');
    await Database.getInstance().disconnect();
    process.exit(0);
});
exports.default = Database;
//# sourceMappingURL=database.js.map
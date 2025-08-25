"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_FILE_TYPES = exports.MAX_FILE_SIZE = exports.RATE_LIMIT_MAX_REQUESTS = exports.RATE_LIMIT_WINDOW_MS = exports.EMAIL_PASS = exports.EMAIL_USER = exports.EMAIL_PORT = exports.EMAIL_HOST = exports.EMAIL_FROM = exports.STRIPE_WEBHOOK_SECRET = exports.STRIPE_SECRET_KEY = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_CLOUD_NAME = exports.FRONTEND_URL = exports.JWT_REFRESH_EXPIRES_IN = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.MONGODB_URI = exports.NODE_ENV = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/devyb-shop',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@devyb-shop.com',
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp']
};
const validateConfig = () => {
    const requiredFields = ['MONGODB_URI', 'JWT_SECRET'];
    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`환경 변수 ${field}가 설정되지 않았습니다.`);
        }
    }
    if (config.NODE_ENV === 'production') {
        const productionRequiredFields = ['STRIPE_SECRET_KEY', 'EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
        for (const field of productionRequiredFields) {
            if (!config[field]) {
                console.warn(`⚠️  Production 환경에서 ${field} 환경 변수가 설정되지 않았습니다.`);
            }
        }
        if (config.JWT_SECRET.length < 32) {
            throw new Error('Production 환경에서 JWT_SECRET은 최소 32자 이상이어야 합니다.');
        }
    }
};
validateConfig();
exports.default = config;
exports.PORT = config.PORT, exports.NODE_ENV = config.NODE_ENV, exports.MONGODB_URI = config.MONGODB_URI, exports.JWT_SECRET = config.JWT_SECRET, exports.JWT_EXPIRES_IN = config.JWT_EXPIRES_IN, exports.JWT_REFRESH_EXPIRES_IN = config.JWT_REFRESH_EXPIRES_IN, exports.FRONTEND_URL = config.FRONTEND_URL, exports.CLOUDINARY_CLOUD_NAME = config.CLOUDINARY_CLOUD_NAME, exports.CLOUDINARY_API_KEY = config.CLOUDINARY_API_KEY, exports.CLOUDINARY_API_SECRET = config.CLOUDINARY_API_SECRET, exports.STRIPE_SECRET_KEY = config.STRIPE_SECRET_KEY, exports.STRIPE_WEBHOOK_SECRET = config.STRIPE_WEBHOOK_SECRET, exports.EMAIL_FROM = config.EMAIL_FROM, exports.EMAIL_HOST = config.EMAIL_HOST, exports.EMAIL_PORT = config.EMAIL_PORT, exports.EMAIL_USER = config.EMAIL_USER, exports.EMAIL_PASS = config.EMAIL_PASS, exports.RATE_LIMIT_WINDOW_MS = config.RATE_LIMIT_WINDOW_MS, exports.RATE_LIMIT_MAX_REQUESTS = config.RATE_LIMIT_MAX_REQUESTS, exports.MAX_FILE_SIZE = config.MAX_FILE_SIZE, exports.ALLOWED_FILE_TYPES = config.ALLOWED_FILE_TYPES;
//# sourceMappingURL=index.js.map
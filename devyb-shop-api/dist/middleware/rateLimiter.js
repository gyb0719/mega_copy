"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = exports.createIPRateLimiter = exports.createUserRateLimiter = exports.apiRateLimiters = exports.lenientRateLimiter = exports.strictRateLimiter = exports.rateLimiter = exports.createRateLimiter = void 0;
const config_1 = __importDefault(require("../config"));
class MemoryStore {
    store = new Map();
    cleanupInterval;
    constructor() {
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }
    cleanup() {
        const now = Date.now();
        for (const [key, info] of this.store.entries()) {
            if (now > info.resetTime) {
                this.store.delete(key);
            }
        }
    }
    get(key) {
        const info = this.store.get(key);
        if (info && Date.now() > info.resetTime) {
            this.store.delete(key);
            return undefined;
        }
        return info;
    }
    increment(key, windowMs) {
        const now = Date.now();
        const existing = this.get(key);
        if (existing) {
            existing.count += 1;
            this.store.set(key, existing);
            return existing;
        }
        else {
            const newInfo = {
                count: 1,
                resetTime: now + windowMs,
                firstRequest: now
            };
            this.store.set(key, newInfo);
            return newInfo;
        }
    }
    reset(key) {
        this.store.delete(key);
    }
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.store.clear();
    }
}
const defaultStore = new MemoryStore();
const createRateLimiter = (options) => {
    const { windowMs, maxRequests, message = `요청 한도를 초과했습니다. ${Math.ceil(windowMs / 1000)}초 후에 다시 시도해주세요.`, skipSuccessfulRequests = false, skipFailedRequests = false, keyGenerator = (req) => req.ip || 'anonymous' } = options;
    return (req, res, next) => {
        const key = keyGenerator(req);
        const info = defaultStore.increment(key, windowMs);
        res.set({
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - info.count).toString(),
            'X-RateLimit-Reset': Math.ceil(info.resetTime / 1000).toString()
        });
        if (info.count > maxRequests) {
            const retryAfter = Math.ceil((info.resetTime - Date.now()) / 1000);
            res.set('Retry-After', retryAfter.toString());
            res.status(429).json({
                success: false,
                error: {
                    status: 429,
                    message,
                    retryAfter
                }
            });
            return;
        }
        if (skipSuccessfulRequests || skipFailedRequests) {
            res.on('finish', () => {
                if (skipSuccessfulRequests && res.statusCode < 400) {
                    const currentInfo = defaultStore.get(key);
                    if (currentInfo) {
                        currentInfo.count = Math.max(0, currentInfo.count - 1);
                        defaultStore.increment(key, 0);
                    }
                }
                else if (skipFailedRequests && res.statusCode >= 400) {
                    const currentInfo = defaultStore.get(key);
                    if (currentInfo) {
                        currentInfo.count = Math.max(0, currentInfo.count - 1);
                        defaultStore.increment(key, 0);
                    }
                }
            });
        }
        next();
    };
};
exports.createRateLimiter = createRateLimiter;
exports.rateLimiter = (0, exports.createRateLimiter)({
    windowMs: config_1.default.RATE_LIMIT_WINDOW_MS,
    maxRequests: config_1.default.RATE_LIMIT_MAX_REQUESTS,
    message: `요청이 너무 많습니다. ${Math.ceil(config_1.default.RATE_LIMIT_WINDOW_MS / 1000)}초 후에 다시 시도해주세요.`
});
exports.strictRateLimiter = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: '인증 시도가 너무 많습니다. 15분 후에 다시 시도해주세요.',
    skipSuccessfulRequests: true,
    keyGenerator: (req) => `auth:${req.ip || 'anonymous'}`
});
exports.lenientRateLimiter = (0, exports.createRateLimiter)({
    windowMs: 1 * 60 * 1000,
    maxRequests: 200,
    message: '요청이 너무 많습니다. 1분 후에 다시 시도해주세요.'
});
exports.apiRateLimiters = {
    register: (0, exports.createRateLimiter)({
        windowMs: 60 * 60 * 1000,
        maxRequests: 3,
        message: '회원가입 시도가 너무 많습니다. 1시간 후에 다시 시도해주세요.',
        keyGenerator: (req) => `register:${req.ip || 'anonymous'}`
    }),
    login: (0, exports.createRateLimiter)({
        windowMs: 15 * 60 * 1000,
        maxRequests: 10,
        message: '로그인 시도가 너무 많습니다. 15분 후에 다시 시도해주세요.',
        keyGenerator: (req) => `login:${req.body?.email || req.ip || 'anonymous'}`,
        skipSuccessfulRequests: true
    }),
    forgotPassword: (0, exports.createRateLimiter)({
        windowMs: 60 * 60 * 1000,
        maxRequests: 3,
        message: '비밀번호 재설정 요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.',
        keyGenerator: (req) => `forgot:${req.body?.email || req.ip || 'anonymous'}`
    }),
    resendVerification: (0, exports.createRateLimiter)({
        windowMs: 5 * 60 * 1000,
        maxRequests: 3,
        message: '인증 이메일 재발송 요청이 너무 많습니다. 5분 후에 다시 시도해주세요.',
        keyGenerator: (req) => `verify:${req.body?.email || req.ip || 'anonymous'}`
    }),
    createReview: (0, exports.createRateLimiter)({
        windowMs: 5 * 60 * 1000,
        maxRequests: 5,
        message: '리뷰 작성이 너무 많습니다. 5분 후에 다시 시도해주세요.',
        keyGenerator: (req) => `review:${req.user?.id || req.ip || 'anonymous'}`
    }),
    fileUpload: (0, exports.createRateLimiter)({
        windowMs: 15 * 60 * 1000,
        maxRequests: 20,
        message: '파일 업로드가 너무 많습니다. 15분 후에 다시 시도해주세요.',
        keyGenerator: (req) => `upload:${req.user?.id || req.ip || 'anonymous'}`
    }),
    createOrder: (0, exports.createRateLimiter)({
        windowMs: 1 * 60 * 1000,
        maxRequests: 3,
        message: '주문 요청이 너무 많습니다. 1분 후에 다시 시도해주세요.',
        keyGenerator: (req) => `order:${req.user?.id || req.ip || 'anonymous'}`
    }),
    search: (0, exports.createRateLimiter)({
        windowMs: 1 * 60 * 1000,
        maxRequests: 50,
        message: '검색 요청이 너무 많습니다. 1분 후에 다시 시도해주세요.'
    })
};
const createUserRateLimiter = (maxRequests, windowMs = 15 * 60 * 1000) => {
    return (0, exports.createRateLimiter)({
        windowMs,
        maxRequests,
        keyGenerator: (req) => `user:${req.user?.id || req.ip || 'anonymous'}`,
        message: `사용자별 요청 한도를 초과했습니다. ${Math.ceil(windowMs / 1000)}초 후에 다시 시도해주세요.`
    });
};
exports.createUserRateLimiter = createUserRateLimiter;
const createIPRateLimiter = (maxRequests, windowMs = 15 * 60 * 1000) => {
    return (0, exports.createRateLimiter)({
        windowMs,
        maxRequests,
        keyGenerator: (req) => `ip:${req.ip || 'anonymous'}`,
        message: `IP별 요청 한도를 초과했습니다. ${Math.ceil(windowMs / 1000)}초 후에 다시 시도해주세요.`
    });
};
exports.createIPRateLimiter = createIPRateLimiter;
const cleanup = () => {
    defaultStore.destroy();
};
exports.cleanup = cleanup;
process.on('exit', exports.cleanup);
process.on('SIGINT', exports.cleanup);
process.on('SIGTERM', exports.cleanup);
exports.default = exports.rateLimiter;
//# sourceMappingURL=rateLimiter.js.map
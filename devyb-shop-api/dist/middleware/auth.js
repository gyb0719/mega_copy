"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateApiKey = exports.requireEmailVerified = exports.requireOwnerOrAdmin = exports.requireCustomerOrAdmin = exports.requireAdmin = exports.authorize = exports.optionalAuth = exports.authenticate = exports.generateTokens = exports.extractUserFromToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const config_1 = __importDefault(require("../config"));
const extractUserFromToken = async (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        const user = await User_1.default.findById(decoded.userId).select('+isVerified');
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        if (!user.isVerified) {
            throw new Error('이메일 인증이 완료되지 않은 사용자입니다.');
        }
        return user;
    }
    catch (error) {
        return null;
    }
};
exports.extractUserFromToken = extractUserFromToken;
const generateTokens = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, config_1.default.JWT_SECRET, { expiresIn: config_1.default.JWT_EXPIRES_IN });
    const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.default.JWT_SECRET, { expiresIn: config_1.default.JWT_REFRESH_EXPIRES_IN });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const authenticate = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                error: {
                    status: 401,
                    message: '접근 권한이 없습니다. 로그인이 필요합니다.'
                }
            });
            return;
        }
        const user = await (0, exports.extractUserFromToken)(token);
        if (!user) {
            res.status(401).json({
                success: false,
                error: {
                    status: 401,
                    message: '유효하지 않은 토큰입니다. 다시 로그인해주세요.'
                }
            });
            return;
        }
        req.user = user;
        req.userId = user._id;
        next();
    }
    catch (error) {
        console.error('인증 미들웨어 오류:', error);
        res.status(401).json({
            success: false,
            error: {
                status: 401,
                message: '토큰 검증 중 오류가 발생했습니다.'
            }
        });
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }
        if (token) {
            const user = await (0, exports.extractUserFromToken)(token);
            if (user) {
                req.user = user;
                req.userId = user._id;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    status: 401,
                    message: '인증이 필요합니다.'
                }
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: {
                    status: 403,
                    message: '접근 권한이 없습니다.'
                }
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
exports.requireAdmin = (0, exports.authorize)('admin');
exports.requireCustomerOrAdmin = (0, exports.authorize)('customer', 'admin');
const requireOwnerOrAdmin = (userIdField = 'user') => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    status: 401,
                    message: '인증이 필요합니다.'
                }
            });
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        const resourceUserId = req.params[userIdField] || req.body[userIdField];
        if (req.user._id.toString() !== resourceUserId) {
            res.status(403).json({
                success: false,
                error: {
                    status: 403,
                    message: '자신의 리소스만 접근할 수 있습니다.'
                }
            });
            return;
        }
        next();
    };
};
exports.requireOwnerOrAdmin = requireOwnerOrAdmin;
const requireEmailVerified = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: {
                status: 401,
                message: '인증이 필요합니다.'
            }
        });
        return;
    }
    if (!req.user.isVerified) {
        res.status(403).json({
            success: false,
            error: {
                status: 403,
                message: '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.'
            }
        });
        return;
    }
    next();
};
exports.requireEmailVerified = requireEmailVerified;
const authenticateApiKey = (req, _res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        _res.status(401).json({
            success: false,
            error: {
                status: 401,
                message: 'API 키가 필요합니다.'
            }
        });
        return;
    }
    const validApiKey = process.env.API_KEY;
    if (apiKey !== validApiKey) {
        _res.status(401).json({
            success: false,
            error: {
                status: 401,
                message: '유효하지 않은 API 키입니다.'
            }
        });
        return;
    }
    next();
};
exports.authenticateApiKey = authenticateApiKey;
//# sourceMappingURL=auth.js.map
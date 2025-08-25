"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.responseFormatter = exports.catchAsync = exports.notFoundHandler = exports.errorHandler = exports.ApiError = void 0;
const config_1 = __importDefault(require("../config"));
class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
const handleCastErrorDB = (err) => {
    const message = `유효하지 않은 ${err.path}: ${err.value}`;
    return new ApiError(400, message);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue ? Object.values(err.keyValue)[0] : '';
    const message = `중복된 값: ${value}. 다른 값을 사용해주세요.`;
    return new ApiError(400, message);
};
const handleValidationErrorDB = (err) => {
    const errors = err.errors ? Object.values(err.errors).map((el) => el.message) : [];
    const message = `입력 데이터가 올바르지 않습니다: ${errors.join('. ')}`;
    return new ApiError(400, message);
};
const handleJWTError = () => new ApiError(401, '유효하지 않은 토큰입니다. 다시 로그인해주세요.');
const handleJWTExpiredError = () => new ApiError(401, '토큰이 만료되었습니다. 다시 로그인해주세요.');
const handleMulterError = (err) => {
    let message = '파일 업로드 중 오류가 발생했습니다.';
    if (err.code === 'LIMIT_FILE_SIZE') {
        message = '파일 크기가 너무 큽니다.';
    }
    else if (err.code === 'LIMIT_FILE_COUNT') {
        message = '파일 개수가 제한을 초과했습니다.';
    }
    else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = '예상하지 못한 파일 필드입니다.';
    }
    return new ApiError(400, message);
};
const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode || err.status || 500).json({
            success: false,
            error: {
                status: err.statusCode || err.status || 500,
                message: err.message,
                error: err,
                stack: err.stack,
                timestamp: new Date().toISOString(),
                url: req.originalUrl,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }
        });
    }
    else {
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message
        });
    }
};
const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational || err.isOperational) {
            res.status(err.statusCode || err.status || 500).json({
                success: false,
                error: {
                    status: err.statusCode || err.status || 500,
                    message: err.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
        else {
            console.error('💥 프로그래밍 오류:', err);
            res.status(500).json({
                success: false,
                error: {
                    status: 500,
                    message: '서버 내부 오류가 발생했습니다.',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    else {
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
};
const errorHandler = (err, req, res, _next) => {
    err.statusCode = err.statusCode || err.status || 500;
    if (err.statusCode >= 500) {
        console.error('💥 서버 오류:', {
            error: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });
    }
    else {
        console.warn('⚠️  클라이언트 오류:', {
            error: err.message,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
    }
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError')
        error = handleCastErrorDB(err);
    if (err.code === 11000)
        error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError')
        error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError')
        error = handleJWTError();
    if (err.name === 'TokenExpiredError')
        error = handleJWTExpiredError();
    if (err.code && typeof err.code === 'string' && err.code.startsWith('LIMIT_'))
        error = handleMulterError(err);
    if (config_1.default.NODE_ENV === 'development') {
        sendErrorDev(error, req, res);
    }
    else {
        sendErrorProd(error, req, res);
    }
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, _res, next) => {
    const err = new ApiError(404, `요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`);
    next(err);
};
exports.notFoundHandler = notFoundHandler;
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
const responseFormatter = (req, res, next) => {
    const _originalSend = res.send;
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object' && (data.hasOwnProperty('success') || data.hasOwnProperty('error'))) {
            return originalJson.call(this, data);
        }
        const standardResponse = {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            ...(config_1.default.NODE_ENV === 'development' && {
                requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
                method: req.method,
                url: req.originalUrl
            })
        };
        return originalJson.call(this, standardResponse);
    };
    next();
};
exports.responseFormatter = responseFormatter;
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    console.log(`📥 ${req.method} ${req.originalUrl} - ${req.ip} - ${new Date().toISOString()}`);
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
        console.log(`📤 ${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
    });
    next();
};
exports.requestLogger = requestLogger;
exports.default = exports.errorHandler;
//# sourceMappingURL=errorHandler.js.map
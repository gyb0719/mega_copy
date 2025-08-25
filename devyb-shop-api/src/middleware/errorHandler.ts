import { Request, Response, NextFunction } from 'express';
import config from '../config';

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
  code?: string | number;
  keyValue?: { [key: string]: any };
  errors?: { [key: string]: any };
  isOperational?: boolean;
  path?: string;
  value?: any;
}

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 에러 타입별 처리
 */
const handleCastErrorDB = (err: CustomError): ApiError => {
  const message = `유효하지 않은 ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

const handleDuplicateFieldsDB = (err: CustomError): ApiError => {
  const value = err.keyValue ? Object.values(err.keyValue)[0] : '';
  const message = `중복된 값: ${value}. 다른 값을 사용해주세요.`;
  return new ApiError(400, message);
};

const handleValidationErrorDB = (err: CustomError): ApiError => {
  const errors = err.errors ? Object.values(err.errors).map((el: any) => el.message) : [];
  const message = `입력 데이터가 올바르지 않습니다: ${errors.join('. ')}`;
  return new ApiError(400, message);
};

const handleJWTError = (): ApiError => 
  new ApiError(401, '유효하지 않은 토큰입니다. 다시 로그인해주세요.');

const handleJWTExpiredError = (): ApiError =>
  new ApiError(401, '토큰이 만료되었습니다. 다시 로그인해주세요.');

const handleMulterError = (err: CustomError): ApiError => {
  let message = '파일 업로드 중 오류가 발생했습니다.';
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = '파일 크기가 너무 큽니다.';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    message = '파일 개수가 제한을 초과했습니다.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = '예상하지 못한 파일 필드입니다.';
  }
  
  return new ApiError(400, message);
};

/**
 * 개발 환경 에러 응답
 */
const sendErrorDev = (err: CustomError, req: Request, res: Response): void => {
  // API 오류
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
  } else {
    // 웹사이트 오류 (현재는 API만 사용)
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * 프로덕션 환경 에러 응답
 */
const sendErrorProd = (err: CustomError, req: Request, res: Response): void => {
  // API 오류
  if (req.originalUrl.startsWith('/api')) {
    // 운영상 오류 (사용자에게 안전하게 보여줄 수 있는 오류)
    if (err.isOperational || (err as ApiError).isOperational) {
      res.status(err.statusCode || err.status || 500).json({
        success: false,
        error: {
          status: err.statusCode || err.status || 500,
          message: err.message,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // 프로그래밍 오류 (로그만 기록하고 일반적인 메시지 반환)
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
  } else {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 전역 에러 핸들러
 */
export const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction): void => {
  err.statusCode = err.statusCode || err.status || 500;

  // 로그 기록
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
  } else {
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

  // Mongoose 에러 처리
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  
  // JWT 에러 처리
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  
  // Multer 에러 처리
  if (err.code && typeof err.code === 'string' && err.code.startsWith('LIMIT_')) error = handleMulterError(err);

  // 환경에 따른 에러 응답
  if (config.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * 처리되지 않은 라우트 핸들러
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const err = new ApiError(404, `요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`);
  next(err);
};

/**
 * 비동기 함수 래퍼
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

/**
 * API 응답 표준화 미들웨어
 */
export const responseFormatter = (req: Request, res: Response, next: NextFunction): void => {
  const _originalSend = res.send;
  const originalJson = res.json;

  // JSON 응답 래핑
  res.json = function(data: any) {
    // 이미 표준화된 응답인 경우 그대로 반환
    if (data && typeof data === 'object' && (data.hasOwnProperty('success') || data.hasOwnProperty('error'))) {
      return originalJson.call(this, data);
    }

    // 성공 응답 표준화
    const standardResponse = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      ...(config.NODE_ENV === 'development' && {
        requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
        method: req.method,
        url: req.originalUrl
      })
    };

    return originalJson.call(this, standardResponse);
  };

  next();
};

/**
 * 요청 로깅 미들웨어
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // 요청 시작 로그
  console.log(`📥 ${req.method} ${req.originalUrl} - ${req.ip} - ${new Date().toISOString()}`);
  
  // 응답 완료 시 로그
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    
    console.log(
      `📤 ${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`
    );
  });
  
  next();
};

export default errorHandler;
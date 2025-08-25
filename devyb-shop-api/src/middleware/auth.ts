import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import config from '../config';

// Request 인터페이스 확장
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * JWT 토큰에서 사용자 정보 추출
 */
export const extractUserFromToken = async (token: string): Promise<IUser | null> => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId).select('+isVerified');
    
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    
    if (!user.isVerified) {
      throw new Error('이메일 인증이 완료되지 않은 사용자입니다.');
    }
    
    return user;
  } catch (error) {
    return null;
  }
};

/**
 * JWT 토큰 생성
 */
export const generateTokens = (user: IUser) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };
  
  const accessToken = jwt.sign(
    payload, 
    config.JWT_SECRET, 
    { expiresIn: config.JWT_EXPIRES_IN } as SignOptions
  );
  
  const refreshToken = jwt.sign(
    payload, 
    config.JWT_SECRET, 
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as SignOptions
  );
  
  return { accessToken, refreshToken };
};

/**
 * 인증 미들웨어
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    
    // Authorization 헤더에서 토큰 추출
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // 쿠키에서 토큰 추출 (대안)
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
    
    // 토큰 검증 및 사용자 정보 추출
    const user = await extractUserFromToken(token);
    
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
    
    // Request 객체에 사용자 정보 추가
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
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

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    
    if (token) {
      const user = await extractUserFromToken(token);
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    // 선택적 인증에서는 오류가 발생해도 다음 미들웨어로 진행
    next();
  }
};

/**
 * 권한 체크 미들웨어
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

/**
 * 관리자 권한 체크
 */
export const requireAdmin = authorize('admin');

/**
 * 고객 또는 관리자 권한 체크
 */
export const requireCustomerOrAdmin = authorize('customer', 'admin');

/**
 * 본인 또는 관리자 권한 체크
 */
export const requireOwnerOrAdmin = (userIdField: string = 'user') => {
  return (req: Request, res: Response, next: NextFunction): void => {
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
    
    // 관리자면 통과
    if (req.user.role === 'admin') {
      next();
      return;
    }
    
    // 본인 리소스인지 확인
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

/**
 * 이메일 인증 체크 미들웨어
 */
export const requireEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

/**
 * API 키 기반 인증 (제3자 서비스용)
 */
export const authenticateApiKey = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
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
  
  // TODO: API 키 데이터베이스와 비교 로직 구현
  // 현재는 환경 변수와 비교
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
import { Request, Response, NextFunction } from 'express';
import config from '../config';

interface RateLimitOptions {
  windowMs: number; // 시간 창 (밀리초)
  maxRequests: number; // 최대 요청 수
  message?: string; // 제한 시 메시지
  skipSuccessfulRequests?: boolean; // 성공한 요청은 카운트에서 제외
  skipFailedRequests?: boolean; // 실패한 요청은 카운트에서 제외
  keyGenerator?: (req: Request) => string; // 키 생성 함수
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// 메모리 기반 스토어 (프로덕션에서는 Redis 사용 권장)
class MemoryStore {
  private store = new Map<string, RateLimitInfo>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 5분마다 만료된 항목 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, info] of this.store.entries()) {
      if (now > info.resetTime) {
        this.store.delete(key);
      }
    }
  }

  get(key: string): RateLimitInfo | undefined {
    const info = this.store.get(key);
    if (info && Date.now() > info.resetTime) {
      this.store.delete(key);
      return undefined;
    }
    return info;
  }

  increment(key: string, windowMs: number): RateLimitInfo {
    const now = Date.now();
    const existing = this.get(key);

    if (existing) {
      existing.count += 1;
      this.store.set(key, existing);
      return existing;
    } else {
      const newInfo: RateLimitInfo = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      };
      this.store.set(key, newInfo);
      return newInfo;
    }
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

const defaultStore = new MemoryStore();

/**
 * Rate limiting 미들웨어 생성
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = `요청 한도를 초과했습니다. ${Math.ceil(windowMs / 1000)}초 후에 다시 시도해주세요.`,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip || 'anonymous'
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const info = defaultStore.increment(key, windowMs);

    // 응답 헤더 설정
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - info.count).toString(),
      'X-RateLimit-Reset': Math.ceil(info.resetTime / 1000).toString()
    });

    // 제한 초과 체크
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

    // 응답 완료 후 처리
    if (skipSuccessfulRequests || skipFailedRequests) {
      res.on('finish', () => {
        if (skipSuccessfulRequests && res.statusCode < 400) {
          // 성공한 요청은 카운트에서 제외
          const currentInfo = defaultStore.get(key);
          if (currentInfo) {
            currentInfo.count = Math.max(0, currentInfo.count - 1);
            defaultStore.increment(key, 0); // 업데이트
          }
        } else if (skipFailedRequests && res.statusCode >= 400) {
          // 실패한 요청은 카운트에서 제외
          const currentInfo = defaultStore.get(key);
          if (currentInfo) {
            currentInfo.count = Math.max(0, currentInfo.count - 1);
            defaultStore.increment(key, 0); // 업데이트
          }
        }
      });
    }

    next();
  };
};

/**
 * 기본 Rate Limiter (일반적인 API 요청)
 */
export const rateLimiter = createRateLimiter({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  message: `요청이 너무 많습니다. ${Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)}초 후에 다시 시도해주세요.`
});

/**
 * 엄격한 Rate Limiter (인증 요청용)
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15분
  maxRequests: 5,
  message: '인증 시도가 너무 많습니다. 15분 후에 다시 시도해주세요.',
  skipSuccessfulRequests: true, // 성공한 인증은 카운트에서 제외
  keyGenerator: (req) => `auth:${req.ip || 'anonymous'}`
});

/**
 * 완화된 Rate Limiter (읽기 전용 요청)
 */
export const lenientRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1분
  maxRequests: 200,
  message: '요청이 너무 많습니다. 1분 후에 다시 시도해주세요.'
});

/**
 * API별 Rate Limiter
 */
export const apiRateLimiters = {
  // 회원가입
  register: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1시간
    maxRequests: 3,
    message: '회원가입 시도가 너무 많습니다. 1시간 후에 다시 시도해주세요.',
    keyGenerator: (req) => `register:${req.ip || 'anonymous'}`
  }),

  // 로그인
  login: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15분
    maxRequests: 10,
    message: '로그인 시도가 너무 많습니다. 15분 후에 다시 시도해주세요.',
    keyGenerator: (req) => `login:${req.body?.email || req.ip || 'anonymous'}`,
    skipSuccessfulRequests: true
  }),

  // 비밀번호 재설정
  forgotPassword: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1시간
    maxRequests: 3,
    message: '비밀번호 재설정 요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.',
    keyGenerator: (req) => `forgot:${req.body?.email || req.ip || 'anonymous'}`
  }),

  // 이메일 인증 재발송
  resendVerification: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5분
    maxRequests: 3,
    message: '인증 이메일 재발송 요청이 너무 많습니다. 5분 후에 다시 시도해주세요.',
    keyGenerator: (req) => `verify:${req.body?.email || req.ip || 'anonymous'}`
  }),

  // 리뷰 작성
  createReview: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5분
    maxRequests: 5,
    message: '리뷰 작성이 너무 많습니다. 5분 후에 다시 시도해주세요.',
    keyGenerator: (req) => `review:${req.user?.id || req.ip || 'anonymous'}`
  }),

  // 파일 업로드
  fileUpload: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15분
    maxRequests: 20,
    message: '파일 업로드가 너무 많습니다. 15분 후에 다시 시도해주세요.',
    keyGenerator: (req) => `upload:${req.user?.id || req.ip || 'anonymous'}`
  }),

  // 주문 생성
  createOrder: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1분
    maxRequests: 3,
    message: '주문 요청이 너무 많습니다. 1분 후에 다시 시도해주세요.',
    keyGenerator: (req) => `order:${req.user?.id || req.ip || 'anonymous'}`
  }),

  // 검색
  search: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1분
    maxRequests: 50,
    message: '검색 요청이 너무 많습니다. 1분 후에 다시 시도해주세요.'
  })
};

/**
 * 사용자별 Rate Limiter
 */
export const createUserRateLimiter = (maxRequests: number, windowMs: number = 15 * 60 * 1000) => {
  return createRateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req) => `user:${req.user?.id || req.ip || 'anonymous'}`,
    message: `사용자별 요청 한도를 초과했습니다. ${Math.ceil(windowMs / 1000)}초 후에 다시 시도해주세요.`
  });
};

/**
 * IP별 Rate Limiter
 */
export const createIPRateLimiter = (maxRequests: number, windowMs: number = 15 * 60 * 1000) => {
  return createRateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req) => `ip:${req.ip || 'anonymous'}`,
    message: `IP별 요청 한도를 초과했습니다. ${Math.ceil(windowMs / 1000)}초 후에 다시 시도해주세요.`
  });
};

// 정리 함수 (앱 종료 시 호출)
export const cleanup = (): void => {
  defaultStore.destroy();
};

// Process exit 시 정리
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

export default rateLimiter;
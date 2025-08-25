import { Request, Response, NextFunction } from 'express';
interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: Request) => string;
}
export declare const createRateLimiter: (options: RateLimitOptions) => (req: Request, res: Response, next: NextFunction) => void;
export declare const rateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const strictRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const lenientRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const apiRateLimiters: {
    register: (req: Request, res: Response, next: NextFunction) => void;
    login: (req: Request, res: Response, next: NextFunction) => void;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
    resendVerification: (req: Request, res: Response, next: NextFunction) => void;
    createReview: (req: Request, res: Response, next: NextFunction) => void;
    fileUpload: (req: Request, res: Response, next: NextFunction) => void;
    createOrder: (req: Request, res: Response, next: NextFunction) => void;
    search: (req: Request, res: Response, next: NextFunction) => void;
};
export declare const createUserRateLimiter: (maxRequests: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const createIPRateLimiter: (maxRequests: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const cleanup: () => void;
export default rateLimiter;
//# sourceMappingURL=rateLimiter.d.ts.map
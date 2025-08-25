import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
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
export declare const extractUserFromToken: (token: string) => Promise<IUser | null>;
export declare const generateTokens: (user: IUser) => {
    accessToken: string;
    refreshToken: string;
};
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireCustomerOrAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireOwnerOrAdmin: (userIdField?: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireEmailVerified: (req: Request, res: Response, next: NextFunction) => void;
export declare const authenticateApiKey: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map
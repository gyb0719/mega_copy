import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    status?: number;
    statusCode?: number;
    code?: string | number;
    keyValue?: {
        [key: string]: any;
    };
    errors?: {
        [key: string]: any;
    };
    isOperational?: boolean;
    path?: string;
    value?: any;
}
export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean, stack?: string);
}
export declare const errorHandler: (err: CustomError, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, _res: Response, next: NextFunction) => void;
export declare const catchAsync: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const responseFormatter: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map
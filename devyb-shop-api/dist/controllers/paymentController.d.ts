import { Request, Response, NextFunction } from 'express';
export declare const createPaymentIntent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPaymentStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const refundPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const handleWebhook: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export declare const savePaymentMethod: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPaymentMethods: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPaymentStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrderPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=paymentController.d.ts.map
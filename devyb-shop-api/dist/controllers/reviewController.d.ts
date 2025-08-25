import { Request, Response, NextFunction } from 'express';
import 'multer';
export declare const createReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReviews: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductReviewStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const voteReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const replyToReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const moderateReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPendingReviews: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReviewableProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const uploadReviewImages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserReviews: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=reviewController.d.ts.map
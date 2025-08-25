import { Request, Response, NextFunction } from 'express';
import 'multer';
export declare const getProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPopularProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getNewProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getDiscountedProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSearchSuggestions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const uploadProductImages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCategoryStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map
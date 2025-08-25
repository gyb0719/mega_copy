import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new ApiError(404, `요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`);
  next(error);
};

export default notFound;
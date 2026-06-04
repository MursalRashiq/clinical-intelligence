import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { sendError } from '../utils/responseHandler.util';
import { HttpStatus } from '../constants/constants';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  console.error('Unhandled error:', err);
  return sendError(
    res,
    'Internal Server Error',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};

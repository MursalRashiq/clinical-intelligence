import { Request, Response, NextFunction } from 'express';
export interface IUserController {
  getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  getDoctors(req: Request, res: Response, next: NextFunction): Promise<void>;
  getDoctorDetailsById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}

import { Request, Response, NextFunction } from 'express';

export interface IAdminController {
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllPatients: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPatientById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    blockPatient: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    unblockPatient: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
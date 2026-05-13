import { Request, Response, NextFunction } from "express";

export interface IDoctorController {
    submitVerification(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDoctorProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllDoctors(req: Request, res: Response, next: NextFunction): Promise<void>;
    resubmitVerification(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDocumentUrl(req: Request, res: Response, next: NextFunction): Promise<void>;
}

import { Request, Response, NextFunction } from 'express';
import { IAdminService } from '../services/interface/IAdminService';
import { IAdminController } from './interface/IAdmin.controller';
import { AppError } from '../errors/AppError';
import { HttpStatus, MESSAGES, COOKIE_OPTIONS } from '../constants/constants';
import { sendSuccess } from '../utils/responseHandler.util';
import { env } from '../config/env';

export class AdminController implements IAdminController {

    constructor(private _adminService: IAdminService) {

    }

    private setRefreshTokenCookie(res: Response, token: string) {
        const isProduction = env.NODE_ENV === COOKIE_OPTIONS.ENV_PRODUCTION;
        res.cookie(COOKIE_OPTIONS.REFRESH_TOKEN, token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? COOKIE_OPTIONS.SAME_SITE_NONE : COOKIE_OPTIONS.SAME_SITE_LAX,
            maxAge: COOKIE_OPTIONS.MAX_AGE,
            path: '/'
        });
    }

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dto = req.body;
            if (!dto.email || !dto.password) {
                throw new AppError(MESSAGES.EMAIL_PASSWORD_REQUIRED, HttpStatus.BAD_REQUEST)
            }
            const result = await this._adminService.loginAdmin(dto);

            if (result.refreshToken) {
                this.setRefreshTokenCookie(res, result.refreshToken);
            }

            sendSuccess(res, { 
                user: result.user,
                token: result.token
            }, "Admin logged in successfully");
        } catch (error) {
            next(error);
        }
    }

    getAllPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filters = req.query as any;
            const result = await this._adminService.getAllPatients(filters);
            sendSuccess(res, result, "Patients fetched successfully");
        } catch (error) {
            next(error);
        }
    }

    getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const patientId = req.params.patientId as string;
            const patient = await this._adminService.getPatientById(patientId)

            if(!patient){
                throw new AppError(MESSAGES.PATIENT_NOT_FOUND, HttpStatus.NOT_FOUND)
            }

            sendSuccess(res, patient);
        }catch (err: unknown){
            next(err)
        }
    }

    blockPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params.patientId as string;
            await this._adminService.blockUser(userId);
            sendSuccess(res, undefined, MESSAGES.PATIENT_BLOCKED_SUCCESS);
        } catch (error) {
            next(error);
        }
    }

    unblockPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.params.patientId as string;
            await this._adminService.unblockUser(userId);
            sendSuccess(res, undefined, MESSAGES.PATIENT_UNBLOCKED_SUCCESS);
        } catch (error) {
            next(error);
        }
    }
}
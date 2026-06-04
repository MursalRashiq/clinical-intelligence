import { Request, Response, NextFunction } from 'express';
import { IAdminService } from '../services/interface/IAdminService';
import { IAdminController } from './interface/IAdmin.controller';
import { AppError } from '../errors/AppError';
import { HttpStatus, MESSAGES, COOKIE_OPTIONS } from '../constants/constants';
import { sendSuccess } from '../utils/responseHandler.util';
import { env } from '../config/env';

export class AdminController implements IAdminController {
  constructor(private _adminService: IAdminService) {}

  private setRefreshTokenCookie(res: Response, token: string) {
    const isProduction = env.NODE_ENV === COOKIE_OPTIONS.ENV_PRODUCTION;
    res.cookie(COOKIE_OPTIONS.REFRESH_TOKEN, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction
        ? COOKIE_OPTIONS.SAME_SITE_NONE
        : COOKIE_OPTIONS.SAME_SITE_LAX,
      maxAge: COOKIE_OPTIONS.MAX_AGE,
      path: '/',
    });
  }

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = req.body;
      if (!dto.email || !dto.password) {
        throw new AppError(
          MESSAGES.EMAIL_PASSWORD_REQUIRED,
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this._adminService.loginAdmin(dto);

      if (result.refreshToken) {
        console.log('[AdminController] Setting refresh token cookie');
        this.setRefreshTokenCookie(res, result.refreshToken);
      } else {
        console.warn(
          '[AdminController] No refresh token returned from service',
        );
      }

      sendSuccess(
        res,
        {
          user: result.user,
          token: result.token,
        },
        'Admin logged in successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  getAllPatients = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filters = req.query as any;
      const result = await this._adminService.getAllPatients(filters);
      sendSuccess(res, result, 'Patients fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getPatientById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const patientId = req.params.patientId as string;
      const patient = await this._adminService.getPatientById(patientId);

      if (!patient) {
        throw new AppError(MESSAGES.PATIENT_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      sendSuccess(res, patient);
    } catch (err: unknown) {
      next(err);
    }
  };

  blockPatient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.params.patientId as string;
      await this._adminService.blockUser(userId);
      sendSuccess(res, undefined, MESSAGES.PATIENT_BLOCKED_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  unblockPatient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.params.patientId as string;
      await this._adminService.unblockUser(userId);
      sendSuccess(res, undefined, MESSAGES.PATIENT_UNBLOCKED_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  getDoctorRequests = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this._adminService.getDoctorRequests();
      sendSuccess(res, result, 'Doctor requests fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getDoctorRequestDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = req.params.doctorId as string;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const result = await this._adminService.getDoctorRequestDetails(
        doctorId,
        baseUrl,
      );
      sendSuccess(res, result, 'Doctor request details fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  approveDoctorRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = req.params.doctorId as string;
      await this._adminService.approveDoctorRequest(doctorId);
      sendSuccess(res, undefined, 'Doctor request approved successfully');
    } catch (error) {
      next(error);
    }
  };

  rejectDoctorRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = req.params.doctorId as string;
      const { rejectionReason } = req.body;
      await this._adminService.rejectDoctorRequest(doctorId, rejectionReason);
      sendSuccess(res, undefined, 'Doctor request rejected successfully');
    } catch (error) {
      next(error);
    }
  };

  getAllDoctors = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filters = req.query as any;
      const result = await this._adminService.getAllDoctors(filters);
      sendSuccess(res, result, 'Doctors fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}

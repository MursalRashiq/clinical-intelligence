import { Request, Response, NextFunction } from 'express';
import { IUserController } from './interface/IUser.controller';
import { IUserService } from '../services/interface/IUser.service';
import { sendSuccess } from '../utils/responseHandler.util';
import { HttpStatus, MESSAGES } from '../constants/constants';
import { AppError } from '../errors/AppError';
import { UnifiedUpdateProfileDTO } from '../dtos/user.dtos/user.dto';

export class UserController implements IUserController {
  private _userService: IUserService;
  constructor(userService: IUserService) {
    this._userService = userService;
  }

  private getUserIdFromReq(req: Request): string | undefined {
    return req.user?.userId;
  }

  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
      }
      const profile = await this._userService.getUserProfile(userId);
      sendSuccess(res, profile, MESSAGES.SUCCESS, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.getUserIdFromReq(req);
      if (!userId) {
        throw new AppError(MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
      }

      const dto: UnifiedUpdateProfileDTO = {
        information: {
          name: req.body.name,
          phone: req.body.phone,
          gender: req.body.gender,
          dob: req.body.dob,
          email: req.body.email,
          bloodGroup: req.body.bloodGroup,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          pincode: req.body.pincode,
        },
      };

      if (typeof req.body.additionalInformation === 'string') {
        try {
          dto.additionalInfo = JSON.parse(req.body.additionalInformation);
        } catch (e) {}
      }

      const file = req.file;

      const result = await this._userService.updateUserProfile(
        userId,
        dto,
        file,
      );
      sendSuccess(res, result, MESSAGES.SUCCESS, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  getDoctors = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;

      const limit = Number(req.query.limit) || 10;

      const doctors = await this._userService.getDoctors({
        page,
        limit,
        hasSlots: req.query.hasSlots === 'true',
        search: req.query.search as string,
        specialty: req.query.specialty as string,
        minRating: Number(req.query.minRating),
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });

      res.status(200).json({
        success: true,
        message: 'Doctors fetched successfully',
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  };

  getDoctorDetailsById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = req.params.id || req.params.doctorId;
      if (!doctorId || typeof doctorId !== 'string') {
        throw new AppError(MESSAGES.BAD_REQUEST, HttpStatus.BAD_REQUEST);
      }
      const doctor = await this._userService.getDoctorProfileById(doctorId);
      console.log('Doctor details fetched for ID:', doctorId);
      sendSuccess(res, doctor, MESSAGES.SUCCESS, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

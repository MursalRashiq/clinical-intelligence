import { Request, Response, NextFunction } from "express";
import { IUserController } from "./interface/IUser.controller";
import { IUserService } from "../services/interface/IUser.service";
import { sendSuccess } from "../utils/responseHandler.util";
import { HttpStatus, MESSAGES } from "../constants/constants";
import { AppError } from "../errors/AppError";
import { UnifiedUpdateProfileDTO } from "../dtos/user.dtos/user.dto";

export class UserController implements IUserController {
    private _userService: IUserService;
    constructor(userService: IUserService) {
        this._userService = userService;
    }

    private getUserIdFromReq(req: Request): string | undefined {
        return req.user?.userId;
    }

    getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = this.getUserIdFromReq(req);
            if (!userId) {
                throw new AppError(MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
            }
            const profile = await this._userService.getUserProfile(userId);
            sendSuccess(res, profile, MESSAGES.SUCCESS, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = this.getUserIdFromReq(req);
            if (!userId) {
                throw new AppError(MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
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
                    pincode: req.body.pincode
                }
            };

            if (typeof req.body.additionalInformation === 'string') {
                try {
                    dto.additionalInfo = JSON.parse(req.body.additionalInformation);
                } catch (e) {
                    // Ignore parse error
                }
            }

            const file = req.file;

            const result = await this._userService.updateUserProfile(userId, dto, file);
            sendSuccess(res, result, MESSAGES.SUCCESS, HttpStatus.OK);
        } catch (error) {
            next(error);
        }
    };
}

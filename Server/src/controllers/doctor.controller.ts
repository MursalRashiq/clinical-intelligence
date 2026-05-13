import { Request, Response, NextFunction } from "express";
import { IDoctorController } from "./interface/IDoctor.controller";
import { IDoctorService } from "../services/interface/IDoctor.service";
import { ILoggerService } from "../services/interface/ILogger.service";
import { sendSuccess } from "../utils/responseHandler.util";
import { HttpStatus } from "../constants/constants";

export class DoctorController implements IDoctorController {
    constructor(
        private _doctorService: IDoctorService,
        private _logger: ILoggerService
    ) {}

    submitVerification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as { userId?: string; id?: string; _id?: string };
            const userId = user?.userId || user?.id || user?._id;

            if (!userId) {
                return next(new Error("Unauthorized: User not found in request"));
            }

            const data = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const result = await this._doctorService.submitVerification(userId.toString(), data, files);

            sendSuccess(res, result, "Doctor verification submitted successfully", HttpStatus.OK);
        } catch (err: unknown) {
            this._logger.error("Error submitting doctor verification", err);
            next(err);
        }
    }

    getDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as { userId?: string; id?: string; _id?: string };
            const userId = user?.userId || user?.id || user?._id;

            if (!userId) {
                return next(new Error("Unauthorized: User not found in request"));
            }

            const result = await this._doctorService.getDoctorProfile(userId.toString());
            sendSuccess(res, result, "Doctor profile fetched successfully", HttpStatus.OK);
        } catch (err: unknown) {
            this._logger.error("Error fetching doctor profile", err);
            next(err);
        }
    }

    getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { specialty, search, hasSlots } = req.query;
            const filter: any = {};
            if (specialty) filter.specialty = specialty;
            if (search) filter.search = search;
            if (hasSlots === 'true') filter.hasSlots = true;

            const result = await this._doctorService.getAllApprovedDoctors(filter);
            sendSuccess(res, result, "Doctors fetched successfully", HttpStatus.OK);
        } catch (err: unknown) {
            this._logger.error("Error fetching doctors", err);
            next(err);
        }
    }

    resubmitVerification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as { userId?: string; id?: string; _id?: string };
            const userId = user?.userId || user?.id || user?._id;

            if (!userId) {
                return next(new Error("Unauthorized: User not found in request"));
            }

            const result = await this._doctorService.resubmitVerification(userId.toString());
            sendSuccess(res, result, "Doctor verification resubmitted successfully", HttpStatus.OK);
        } catch (err: unknown) {
            this._logger.error("Error resubmitting doctor verification", err);
            next(err);
        }
    }

    updateDocuments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as { userId?: string; id?: string; _id?: string };
            const userId = user?.userId || user?.id || user?._id;

            if (!userId) {
                return next(new Error("Unauthorized: User not found in request"));
            }

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const result = await this._doctorService.updateDoctorDocuments(userId.toString(), files);
            sendSuccess(res, result, "Doctor documents updated successfully", HttpStatus.OK);
        } catch (err: unknown) {
            this._logger.error("Error updating doctor documents", err);
            next(err);
        }
    }

    getDocumentUrl = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as { userId?: string; id?: string; _id?: string };
            const userId = user?.userId || user?.id || user?._id;

            if (!userId) {
                return next(new Error("Unauthorized: User not found in request"));
            }

            const index = parseInt(req.params.index);
            const result = await this._doctorService.getDocumentSignedUrl(userId.toString(), index);
            sendSuccess(res, { url: result }, "Document URL generated successfully", HttpStatus.OK);
        } catch (err: unknown) {
            this._logger.error("Error generating document URL", err);
            next(err);
        }
    }
}

import { IDoctorService } from "./interface/IDoctor.service";
import { IDoctorRepository } from "../repositories/interface/IDoctor.repository";
import { ILoggerService } from "./interface/ILogger.service";
import { IDoctorDocument } from "../types/doctor.type";
import { uploadToS3, getPresignedUrl } from "../utils/uploadToS3";
import { BadRequestError, NotFoundError } from "../errors/AppError";
import { VerificationStatus } from "../dtos/doctor.dto/doctor.dto";

export class DoctorService implements IDoctorService {
    constructor(
        private _doctorRepository: IDoctorRepository,
        private _logger: ILoggerService
    ) {}

    async submitVerification(
        userId: string,
        data: any,
        files: { [fieldname: string]: Express.Multer.File[] }
    ): Promise<IDoctorDocument> {
        this._logger.info(`Submitting verification for doctor with userId: ${userId}`);

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError("Doctor profile not found. Please complete step 1 first.");
        }

        let medicalLicenseUrl: string = "";
        let degreeCertificateUrl: string = "";

        if (files.medicalLicense && files.medicalLicense.length > 0) {
            const file = files.medicalLicense[0];
            if (file) {
                medicalLicenseUrl = await uploadToS3(file);
            }
        } else {
            throw new BadRequestError("Medical License document is required.");
        }

        if (files.degreeCertificate && files.degreeCertificate.length > 0) {
            const file = files.degreeCertificate[0];
            if (file) {
                degreeCertificateUrl = await uploadToS3(file);
            }
        } else {
            throw new BadRequestError("Degree Certificate document is required.");
        }

        const verificationDocuments: string[] = [medicalLicenseUrl, degreeCertificateUrl].filter(url => url !== "");
        
        const specialty = data.primarySpecialty === "other" ? data.customSpecialty : data.primarySpecialty;

        const updateData: Partial<IDoctorDocument> = {
            qualifications: [data.degree].filter(Boolean),
            specialty,
            experienceYears: this.parseExperience(data.yearsOfPractice),
            VideoFees: data.videoEnabled === 'true' ? Number(data.videoFee) : null,
            ChatFees: data.chatEnabled === 'true' ? Number(data.chatFee) : null,
            verificationDocuments,
            licenseNumber: data.licenseNumber || null,
            about: data.about || null,
            verificationStatus: VerificationStatus.Pending,
        };

        const updatedDoctor = await this._doctorRepository.updateById(doctor._id.toString(), updateData);
        
        if (!updatedDoctor) {
             throw new Error("Failed to update doctor profile");
        }

        return updatedDoctor;
    }

    async getDoctorProfile(userId: string): Promise<IDoctorDocument | null> {
        this._logger.info(`Fetching doctor profile for userId: ${userId}`);
        return await this._doctorRepository.findByUserId(userId);
    }
    
    async getAllApprovedDoctors(filter?: any): Promise<{ doctors: IDoctorDocument[]; total: number }> {
        this._logger.info("Fetching all approved doctors");
        const defaultFilter = { verificationStatus: VerificationStatus.Approved, isActive: true };
        const mergedFilter = { ...defaultFilter, ...filter };
        return await this._doctorRepository.getAllDoctors(0, 100, mergedFilter);
    }

    async resubmitVerification(userId: string): Promise<IDoctorDocument> {
        this._logger.info(`Resubmitting verification for doctor with userId: ${userId}`);

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError("Doctor profile not found.");
        }

        if (doctor.verificationStatus !== VerificationStatus.Reject) {
            throw new BadRequestError("Application is not in rejected status.");
        }

        if (doctor.rejectionCount >= 3) {
            throw new BadRequestError("Maximum resubmission attempts (3) reached. Please contact support.");
        }

        const updateData: Partial<IDoctorDocument> = {
            verificationStatus: VerificationStatus.Pending,
            rejectionReason: null,
            rejectionCount: (doctor.rejectionCount || 0) + 1,
        };

        const updatedDoctor = await this._doctorRepository.updateById(doctor._id.toString(), updateData);
        
        if (!updatedDoctor) {
             throw new Error("Failed to resubmit doctor profile");
        }

        return updatedDoctor;
    }

    async updateDoctorDocuments(userId: string, files: { [fieldname: string]: Express.Multer.File[] }): Promise<IDoctorDocument> {
        this._logger.info(`Updating documents for doctor with userId: ${userId}`);

        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw new NotFoundError("Doctor profile not found.");
        }

        const currentDocuments = [...(doctor.verificationDocuments || [])];
        
        // Ensure slots exist for 0=license, 1=degree
        while (currentDocuments.length < 2) currentDocuments.push("");

        if (files.medicalLicense && files.medicalLicense.length > 0) {
            const file = files.medicalLicense[0];
            currentDocuments[0] = await uploadToS3(file);
        }

        if (files.degreeCertificate && files.degreeCertificate.length > 0) {
            const file = files.degreeCertificate[0];
            currentDocuments[1] = await uploadToS3(file);
        }

        const updatedDoctor = await this._doctorRepository.updateById(doctor._id.toString(), {
            verificationDocuments: currentDocuments.filter(url => !!url)
        });

        if (!updatedDoctor) {
            throw new Error("Failed to update doctor documents");
        }

        return updatedDoctor;
    }

    async getDocumentSignedUrl(userId: string, index: number): Promise<string> {
        this._logger.info(`Generating signed URL for document ${index} for doctor ${userId}`);
        const doctor = await this._doctorRepository.findByUserId(userId);
        if (!doctor || !doctor.verificationDocuments || !doctor.verificationDocuments[index]) {
            throw new NotFoundError("Document not found");
        }
        return await getPresignedUrl(doctor.verificationDocuments[index]);
    }

    private parseExperience(yearsStr: string): number | null {
        if (!yearsStr) return null;
        if (yearsStr.includes("Less than 1 year")) return 0;
        if (yearsStr.includes("1-5")) return 3;
        if (yearsStr.includes("5-10")) return 7;
        if (yearsStr.includes("10-20")) return 15;
        if (yearsStr.includes("20+")) return 20;
        return null;
    }
}

import DoctorModel from "../models/doctor.model";
import { IDoctorDocument, IDoctor, DoctorRequestItem, DoctorRequestDetail } from "../types/doctor.type";
import { Types } from 'mongoose';
import { IDoctorRepository } from "./interface/IDoctor.repository";
import { IUserDocument } from "../types/user.type";
import { VerificationStatus } from "../dtos/doctor.dto/doctor.dto";
import { BaseRepository } from "./base.repository";

export class DoctorRepository extends BaseRepository<IDoctorDocument> implements IDoctorRepository {
    constructor() {
        super(DoctorModel);
    }

    async create(data: Partial<IDoctorDocument>): Promise<IDoctorDocument> {
        const payload: any = { ...data };
        if (payload.userId && typeof payload.userId === 'string') {
            payload.userId = new Types.ObjectId(payload.userId);
        }
        return await DoctorModel.create(payload);
    }

    async findByUserId(userId: string): Promise<IDoctorDocument | null> {
        if (!userId || typeof userId !== 'string') {
            return null;
        }
        try {
            const userIdObjectId = new Types.ObjectId(userId);
            return await this.model.findOne({ userId: userIdObjectId }).populate('userId').exec();
        } catch {
            return null;
        }
    }

    async findPendingVerifications(): Promise<IDoctorDocument[]> {
        return this.model.find({ verificationStatus: VerificationStatus.Pending }).exec();
    }

    async getAllDoctors(skip: number, limit: number, filter?: { specialty?: string | undefined; search?: string | undefined; verificationStatus?: string | undefined; isActive?: boolean | undefined; sort?: Record<string, 1 | -1> | undefined; minExperience?: number | undefined; minRating?: number | undefined }): Promise<{ doctors: IDoctorDocument[]; total: number }> {
        const query: Record<string, unknown> = {};
        if (filter) {
            if (filter.verificationStatus) {
                query.verificationStatus = filter.verificationStatus;
            }

            if (typeof filter.isActive === 'boolean') {
                query.isActive = filter.isActive;
            }

            if (filter.specialty) {
                query.specialty = { $regex: new RegExp(filter.specialty, "i") };
            }

            if (filter.minExperience !== undefined) {
                query.experienceYears = { $gte: filter.minExperience };
            }

            if (filter.minRating !== undefined) {
                query.ratingAvg = { $gte: filter.minRating };
            }

            if (filter.search) {
                const searchRegex = new RegExp(filter.search, "i");
                const matchingUsers = await this.model.db.model('User').find({
                    name: searchRegex
                }).select('_id');
                const userIds = matchingUsers.map(u => u._id);
                query.userId = { $in: userIds };
            }

            if ((filter as any).hasSlots) {
                const schedules = await this.model.db.model('DoctorSchedule').find({
                    isActive: true,
                    weeklySchedule: {
                        $elemMatch: {
                            enabled: true,
                            "slots.0": { $exists: true },
                            "slots": { $elemMatch: { enabled: true } }
                        }
                    }
                }).select('doctorId').lean();
                
                const doctorIds = schedules.map(s => s.doctorId);
                query._id = { $in: doctorIds };
            }
        } else {
            query.verificationStatus = VerificationStatus.Approved;
        }

        const doctors = await this.model
            .find(query)
            .populate("userId")
            .skip(skip)
            .limit(limit)
            .sort(filter?.sort || { createdAt: -1 })
            .exec();

        const total = await this.model.countDocuments(query);

        return { doctors, total };
    }

    async getPendingDoctorRequests(): Promise<DoctorRequestItem[]> {
        const docs = await this.model
            .find({ verificationStatus: VerificationStatus.Pending })
            .populate("userId")
            .lean() as unknown as PopulatedDoctorRequest[];

        return docs.map(doc => this._mapDoctorRequestItem(doc));
    }

    async getAllDoctorRequests(): Promise<DoctorRequestItem[]> {
        const docs = await this.model
            .find()
            .populate("userId")
            .sort({ createdAt: -1 })
            .lean() as unknown as PopulatedDoctorRequest[];

        return docs.map(doc => this._mapDoctorRequestItem(doc));
    }

    async getDoctorRequestDetailsById(doctorId: string): Promise<DoctorRequestDetail | null> {
        const doc = await this.model
            .findById(doctorId)
            .populate("userId")
            .lean();
        
        if (!doc) return null;

        const user = doc.userId as unknown as IUserDocument;

        return {
            _id: doc._id,
            userId: user._id,
            customId: user.customId,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            specialty: doc.specialty ?? null,
            experienceYears: doc.experienceYears ?? null,
            verificationStatus: doc.verificationStatus,
            rejectionReason: doc.rejectionReason ?? null,
            createdAt: doc.createdAt,
            profileImage: user.profileImage ?? null,
            qualifications: doc.qualifications || [],
            VideoFees: doc.VideoFees ?? null,
            ChatFees: doc.ChatFees ?? null,
            languages: doc.languages || [],
            verificationDocuments: doc.verificationDocuments || [],
            isActive: doc.isActive,
            updatedAt: doc.updatedAt,
            gender: user.gender ?? null,
            dob: user.dob ?? null,
        }
    }

    private _mapDoctorRequestItem(doc: PopulatedDoctorRequest): DoctorRequestItem {
        const user = doc.userId;
        return {
            _id: doc._id,
            userId: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            specialty: doc.specialty ?? null,
            experienceYears: doc.experienceYears ?? null,
            degreeCertificate: doc.degreeCertificate ?? null,
            medicalCertificate: doc.medicalCertificate ?? null,
            verificationStatus: doc.verificationStatus,
            rejectionReason: doc.rejectionReason ?? null,
            createdAt: doc.createdAt,
            profileImage: user.profileImage ?? null,
            VideoFees: doc.VideoFees ?? null,
            updatedAt: doc.updatedAt
        }
    }

    async countApprovedDoctors(): Promise<number> {
        return await this.model.countDocuments({ verificationStatus: VerificationStatus.Approved });
    }

    async searchDoctors(criteria: Record<string, unknown>): Promise<IDoctorDocument[]> {
        return await this.model.find(criteria).populate("userId").exec();
    }
}

type PopulatedDoctorRequest = IDoctor & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    userId: IUserDocument;
    verificationStatus: VerificationStatus;
    medicalCertificate: string | null;
    degreeCertificate: string | null;
}
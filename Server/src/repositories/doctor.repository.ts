import DoctorModel from "../models/doctor.model";
import { IDoctorDocument } from "../types/doctor.type";
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
            return await this.model.findOne({ userId: userIdObjectId }).exec();
        } catch {
            return null;
        }
    }
}
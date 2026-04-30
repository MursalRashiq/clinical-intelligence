import { Types } from 'mongoose';
import { IBaseRepository } from './IBase.repository';
import { IDoctorDocument } from '../../types/doctor.type';

export interface IDoctorRepository extends IBaseRepository<IDoctorDocument> {

    create(data: Partial<IDoctorDocument> & { userId: string | Types.ObjectId}): Promise<IDoctorDocument>;

    findByUserId(userId: string): Promise<IDoctorDocument | null>;
}
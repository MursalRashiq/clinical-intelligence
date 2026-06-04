import { Types } from 'mongoose';
import { IBaseRepository } from './IBase.repository';
import {
  IDoctorDocument,
  DoctorRequestItem,
  DoctorRequestDetail,
} from '../../types/doctor.type';

export interface IDoctorRepository extends IBaseRepository<IDoctorDocument> {
  create(
    data: Partial<IDoctorDocument> & { userId: string | Types.ObjectId },
  ): Promise<IDoctorDocument>;

  findByUserId(userId: string): Promise<IDoctorDocument | null>;

  getPendingDoctorRequests(): Promise<DoctorRequestItem[]>;

  getAllDoctorRequests(): Promise<DoctorRequestItem[]>;

  getDoctorRequestDetailsById(
    doctorId: string,
  ): Promise<DoctorRequestDetail | null>;

  getAllDoctors(
    skip: number,
    limit: number,
    filter?: {
      specialty?: string | undefined;
      search?: string | undefined;
      verificationStatus?: string | undefined;
      isActive?: boolean | undefined;
      sort?: Record<string, 1 | -1> | undefined;
      minExperience?: number | undefined;
      minRating?: number | undefined;
    },
  ): Promise<{ doctors: IDoctorDocument[]; total: number }>;

  countApprovedDoctors(): Promise<number>;

  searchDoctors(criteria: Record<string, unknown>): Promise<IDoctorDocument[]>;
}

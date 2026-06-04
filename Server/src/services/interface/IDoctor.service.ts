import { IDoctorDocument } from '../../types/doctor.type';

export interface IDoctorService {
  submitVerification(
    userId: string,
    data: any,
    files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<IDoctorDocument>;
  getDoctorProfile(userId: string): Promise<IDoctorDocument | null>;
  getAllApprovedDoctors(
    filter?: any,
  ): Promise<{ doctors: IDoctorDocument[]; total: number }>;
  resubmitVerification(userId: string): Promise<IDoctorDocument>;
  updateDoctorDocuments(
    userId: string,
    files: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<IDoctorDocument>;
  getDocumentSignedUrl(userId: string, index: number): Promise<string>;
}

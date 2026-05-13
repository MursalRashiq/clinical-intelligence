import { Types, Document } from 'mongoose';
import { VerificationStatus } from '../dtos/doctor.dto/doctor.dto'
import { IUserDocument } from './user.type';

export interface IDoctor {
  userId: Types.ObjectId;
  licenseNumber?: string | null;
  qualifications: string[];
  specialty?: string | null;
  experienceYears?: number | null;
  VideoFees?: number | null;
  ChatFees?: number | null;
  about?: string;
  languages: string[];
  verificationStatus: VerificationStatus;
  verificationDocuments: string[];
  rejectionReason?: string | null;
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;
  signature?: string | null;
  rejectionCount: number;
}

export type IDoctorDocument = IDoctor & Document & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  customId: string
}

export interface IDoctorPopulated extends Omit<IDoctor, "userId"> {
  _id: Types.ObjectId;
  userId: IUserDocument;
  createdAt: Date;
  updatedAt: Date;
  customId: string;
}

export interface DoctorRegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  licenseNumber?: string;
  dob?: string | Date;
}

export interface DoctorRequestItem {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string | null;
  specialty?: string | null;
  degreeCertificate?: string | null;
  medicalCertificate?: string | null;
  experienceYears?: number | null;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  createdAt: Date;
  profileImage?: string | null;
  VideoFees?: number | null;
  updatedAt: Date;
}

export interface DoctorRequestDetail extends DoctorRequestItem {
  customId?: string;
  qualifications: string[];
  VideoFees?: number | null;
  ChatFees?: number | null;
  languages: string[];
  verificationDocuments: string[];
  isActive: boolean;
  updatedAt: Date;
  gender?: "male" | "female" | "other" | null;
  dob?: Date | null;
}
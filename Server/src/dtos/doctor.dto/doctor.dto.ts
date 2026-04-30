import { BaseUserResponseDTO, AuthResponseDTO, LoginDTO, RegisterDTO, VerifyOtpDTO, ResendOtpDTO, ForgotPasswordDTO, ResetPasswordDTO } from "../common.dto";

export type { LoginDTO as LoginDoctorDTO, VerifyOtpDTO, ResendOtpDTO, ForgotPasswordDTO, RegisterDTO }

export type RegisterDoctorDTO = RegisterDTO;

export enum VerificationStatus {
    Pending = "pending",
    Approved= "approved",
    Reject = "rejected"
}

export interface SubmitVerificationDTO {
  degree: string;
  experience: number;
  speciality: string;
  videoFees: number;
  chatFees: number;
  licenseNumber?: string;
  languages?: string[];
}

export interface DoctorResponseDTO extends BaseUserResponseDTO {
  gender?: string | null;
  dob?: string | null;
  verificationStatus: VerificationStatus
  rejectionReason?: string | null;
  licenseNumber?: string | null;
  qualifications: string[];
  specialty?: string | null;
  experienceYears?: number | null;
  VideoFees?: number | null;
  ChatFees?: number | null;
  languages: string[];
  ratingAvg: number;
  ratingCount: number;
}

export type DoctorAuthResponseDTO = AuthResponseDTO<DoctorResponseDTO>;

export interface VerificationResponseDTO {
  message: string;
  verificationStatus: VerificationStatus;
  verificationDocuments?: string[];
}

export interface VerificationFormDataDTO {
  degree: string;
  experience: number;
  speciality: string;
  videoFees: number;
  chatFees: number;
  licenseNumber?: string | null;
  languages: string[];
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  verificationDocuments: string[];
  canResubmit: boolean;
}
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
  rejectionReason?: string | null | undefined;
  licenseNumber?: string | null | undefined;
  qualifications: string[];
  specialty?: string | null;
  experienceYears?: number | null | undefined;
  VideoFees?: number | null | undefined;
  ChatFees?: number | null | undefined;
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
  licenseNumber?: string | null | undefined;
  languages: string[];
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null | undefined;
  verificationDocuments: string[];
  canResubmit: boolean;
}
import { isAbsolute } from "node:path";
import {  BaseUserResponseDTO, AuthResponseDTO, LoginDTO, RegisterDTO, VerifyOtpDTO, ResendOtpDTO,  } from "../common.dto";
export type { LoginDTO as LoginUserDTO, VerifyOtpDTO, ResendOtpDTO }

export type RegisterUserDTO = RegisterDTO;

export interface UserResponseDTO extends BaseUserResponseDTO {
    gender?: "male" | "female" | "other" | null;
    dob?: Date | string | null;
    customId: string;
    bloodGroup?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    pincode?: string | null;
}

export type UserAuthResponseDTO = AuthResponseDTO<UserResponseDTO>;

export interface UpdateUserProfileDTO {
    name?: string;
    email?: string;
    phone?: string;
    gender?: "male" | "female" | "other" | null;
    dob?: Date | string | null;
    profileImage?: string;
    bloodGroup?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    pincode?: string | null;
}

export interface UnifiedUpdateProfileDTO {
    information: UpdateUserProfileDTO;
    additionalInfo?: DoctorAdditionalInfoDTO;
}

export interface DoctorAdditionalInfoDTO {
    specialty: string | null | undefined;
    qualifications: string[] | null | undefined;
    experienceYears: number | null | undefined;
    VideoFees?: number | null | undefined;
    ChatFees?: number | null | undefined;
    languages?: string[] | null | undefined;
    licenseNumber?: string | null | undefined;
    about?: string | null | undefined;
}

export interface UnifiedUserProfileDTO {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
    phone?: string | null;
    customId: string;
    dob?: string | null;
    gender?: string | null;
}

export interface UnifiedUserProfileResponseDTO extends UserResponseDTO {
    doctorProfileId?: string | undefined;
    verificationStatus?: string | undefined;
    specialty?: string | null | undefined;
    qualifications?: string[] | null | undefined;
    experienceYears?: number | null | undefined;
    VideoFees?: number | null | undefined;
    ChatFees?: number | null | undefined;
    languages?: string[] | null | undefined;
    licenseNumber?: string | null | undefined;
    about?: string | null | undefined;
}
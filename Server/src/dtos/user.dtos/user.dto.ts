import { isAbsolute } from "node:path";
import {  BaseUserResponseDTO, AuthResponseDTO, LoginDTO, RegisterDTO, VerifyOtpDTO, ResendOtpDTO,  } from "../common.dto";
export type { LoginDTO as LoginUserDTO, VerifyOtpDTO, ResendOtpDTO }

export type RegisterUserDTO = RegisterDTO;

export interface UserResponseDTO extends BaseUserResponseDTO {
    gender?: "male" | "female" | "other" | null;
    dob?: Date | string | null;
    customId: string;
}

export type UserAuthResponseDTO = AuthResponseDTO<UserResponseDTO>;

export interface UpdateUserProfileDTO {
    name?: string;
    phone?: string;
    gender?: "male" | "female" | "other" | null;
    dob?: Date | string | null;
    profileImage?: string;
}

export interface DoctorAdditionalInfoDTO {
    specialty: string;
    qualifications: string[];
    experienceYears: number | null;
    VideoFee?: number | null;
    ChatFee?: number | null;
    languages?: string[];
    licensesNumbers?: string[] | null;
}

export type UnifiedUserDTO = UserResponseDTO & Partial<DoctorAdditionalInfoDTO> & {
    doctorProfileId?: string;
    verificationStatus?: string;
}
import { VerificationStatus } from '../doctor.dto/doctor.dto';

export interface LoginAdminDTO {
  email: string;
  password: string;
}

export interface AdminResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface AuthResponseDTO {
  user: AdminResponseDTO;
  token: string;
  refreshToken?: string;
}

export interface UserFilterDTO {
  search?: string;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
}

export interface DoctorRequestDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  profileImage: string | null;
  createdAt: Date;
  experienceYears: number;
  status: VerificationStatus;
  rejectionReason: string;
  VideoFees: number | null;
}

export interface DoctorRequestDetailsDTO {
  id: string;
  customId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  profileImage: string | null;
  gender: 'male' | 'female' | 'other' | null;
  dob: string | null;
  qualifications: string[];
  experienceYears: number;
  specialties: string[];
  biography: string;
  VideoFees: number | null;
  ChatFees: number | null;
  documents: string[];
  status: VerificationStatus;
  rejectionReason: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorFilterDTO {
  search?: string;
  specialty?: string;
  verificationStatus?: VerificationStatus;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
}

export interface AppointmentFilterDTO {
  status?: string | undefined;
  search?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  doctorId?: string | undefined;
  patientId?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

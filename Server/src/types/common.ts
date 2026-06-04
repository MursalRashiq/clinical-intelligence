import { Types } from 'mongoose';

export interface JsonTransformReturnType {
  id: string;
  [key: string]: unknown;
}

export interface PatientListItem {
  id: string;
  customId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dob?: Date | null;
  profileImage?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'patient' | 'doctor' | 'admin';
  profileImage?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DoctorListItem {
  id: string;
  customId?: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string | null;
  experienceYears?: number | null;
  VideoFees?: number | null;
  ChatFees?: number | null;
  profileImage?: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentListItem {
  id: string;
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  appointmentDate: Date;
  status: string;
  type?: string;
  createdAt: Date;
  updatedAt: Date;
}

import {
  AppointmentType,
  AppointmentStatus,
} from '../../types/appointment.type';

// ==================== REQUEST DTOs ====================

export interface CreateAppointmentDTO {
  doctorId: string;
  appointmentDate: Date | string;
  appointmentTime: string;
  slotId?: string;
  appointmentType: AppointmentType;
  reason?: string;
}

export interface CancelAppointmentDTO {
  cancellationReason: string;
}

export interface RejectAppointmentDTO {
  rejectionReason: string;
}

export interface CompleteAppointmentDTO {
  doctorNotes?: string;
  prescriptionUrl?: string;
}

export interface RescheduleAppointmentDTO {
  appointmentDate: Date | string;
  appointmentTime: string;
  slotId?: string;
}

export interface AppointmentResponseDTO {
  _id: string;
  id: string;
  customId?: string | undefined;
  patientId: {
    _id: string;
    id: string;
    customId?: string | undefined;
    name: string;
    email: string;
    phone?: string | undefined;
    profileImage?: string | undefined;
    gender?: string | undefined;
    dob?: Date | undefined;
  };
  doctorId: {
    _id: string;
    id: string;
    customId?: string | undefined;
    name: string;
    email: string;
    phone?: string | undefined;
    profileImage?: string | undefined;
    specialty?: string | undefined;
    experienceYears?: number | undefined;
  };
  appointmentType: AppointmentType;
  appointmentDate: Date;
  appointmentTime: string;
  status: AppointmentStatus;
  consultationFees: number;
  reason?: string | undefined;
  cancelledBy?: string | undefined;
  cancellationReason?: string | undefined;
  cancelledAt?: Date | undefined;
  rejectionReason?: string | undefined;
  paymentStatus: string;
  paymentId?: string | undefined;
  paymentMethod?: string | undefined;
  sessionStartTime?: Date | undefined;
  sessionEndTime?: Date | undefined;
  sessionDuration?: number | undefined;
  doctorNotes?: string | undefined;
  prescriptionUrl?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentListResponseDTO {
  appointments: AppointmentResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentQueryDTO {
  status?: AppointmentStatus;
  page?: number;
  limit?: number;
}

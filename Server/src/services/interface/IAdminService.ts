import type {
  LoginAdminDTO,
  AuthResponseDTO as AdminAuthResponseDTO,
  UserFilterDTO,
} from '../../dtos/admin.dto/admin.dto';
import type { PatientListItem, UserListItem } from '../../types/common';

export interface IAdminService {
  loginAdmin(data: LoginAdminDTO): Promise<AdminAuthResponseDTO>;
  getAllUsers(filter?: UserFilterDTO): Promise<UserListItem[]>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  getAllPatients(
    filters: UserFilterDTO,
  ): Promise<{
    patients: PatientListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  getPatientById(patientId: string): Promise<PatientListItem | null>;
  getDoctorRequests(): Promise<any[]>;
  getDoctorRequestDetails(
    doctorId: string,
    baseUrl: string,
  ): Promise<any | null>;
  approveDoctorRequest(doctorId: string): Promise<void>;
  rejectDoctorRequest(doctorId: string, rejectionReason: string): Promise<void>;
  getAllDoctors(filters: any): Promise<any>;
}

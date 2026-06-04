import { generateToken, generateRefreshToken } from '../utils/jwt.utils';
import { comparePassword } from '../utils/password.utils';
import { UserMapper } from '../mappers/user.mapper';
import { AdminMapper } from '../mappers/admin.mapper';
import { UserRepository } from '../repositories/user.repository';
import { toggleEntityStatus } from '../utils/status-toggle.util';
import { ILoggerService } from './interface/ILogger.service';
import { IAdminService } from './interface/IAdminService';
import { IAdminRepository } from '../repositories/interface/IAdmin.repositor';
import { IUserRepository } from '../repositories/interface/IUser.repository';
import { AuthResponseDTO } from '../dtos/common.dto';
import {
  LoginAdminDTO,
  UserFilterDTO,
  DoctorRequestDTO,
  DoctorRequestDetailsDTO,
  DoctorFilterDTO,
} from '../dtos/admin.dto/admin.dto';
import { UnauthorizedError } from '../errors/AppError';
import { DoctorListItem, PatientListItem, UserListItem } from '../types/common';
import {
  calculatePagination,
  buildPaginatedResponse,
} from '../utils/pagination.utils';
import { ROLES } from '../constants/constants';
import { IDoctorRepository } from '../repositories/interface/IDoctor.repository';
import { DoctorMapper } from '../mappers/doctor.mapper';
import { VerificationStatus } from '../dtos/doctor.dto/doctor.dto';
import { IDoctorDocument } from '../types/doctor.type';
import { IUserDocument } from '../types/user.type';
import { getPresignedUrl } from '../utils/uploadToS3';

export class AdminService implements IAdminService {
  constructor(
    private _adminRepository: IAdminRepository,
    private _userRepository: IUserRepository,
    private _doctorRepository: IDoctorRepository,
    private _logger: ILoggerService,
  ) {}

  async loginAdmin(data: LoginAdminDTO): Promise<AuthResponseDTO> {
    const user = await this._adminRepository.findByEmail(data.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or Password');
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user: AdminMapper.toResponseDTO(user),
      token,
      refreshToken,
    };
  }

  async getAllUsers(filter?: UserFilterDTO): Promise<UserListItem[]> {
    return [];
  }

  async blockUser(userId: string): Promise<void> {
    await toggleEntityStatus(
      this._userRepository,
      userId,
      false,
      'Patient',
      this._logger,
    );
  }

  async unblockUser(userId: string): Promise<void> {
    await toggleEntityStatus(
      this._userRepository,
      userId,
      true,
      'Patient',
      this._logger,
    );
  }

  async getAllPatients(filters: UserFilterDTO): Promise<{
    patients: PatientListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const { skip } = calculatePagination(page, limit);

    const repoFilter: { search?: string; isActive?: boolean } = {};
    if (filters.search) repoFilter.search = filters.search;
    if (filters.isActive !== undefined) {
      repoFilter.isActive =
        typeof filters.isActive === 'string'
          ? filters.isActive === 'true'
          : !!filters.isActive;
    }

    const { patients, total } = await this._userRepository.getAllPatients(
      skip,
      limit,
      repoFilter,
    );

    const mappedPatients = patients.map(UserMapper.toPatientListItem);
    const paginatedResult = buildPaginatedResponse(
      mappedPatients,
      total,
      page,
      limit,
    );

    return {
      patients: paginatedResult.items,
      total: paginatedResult.total,
      page: paginatedResult.page,
      limit: paginatedResult.limit,
      totalPages: paginatedResult.totalPages,
    };
  }

  async getPatientById(patientId: string): Promise<PatientListItem | null> {
    const patient = await this._userRepository.findById(patientId);

    if (!patient || patient.role !== ROLES.PATIENT) {
      return null;
    }

    return UserMapper.toPatientListItem(patient);
  }
  async getAllDoctors(
    filters: DoctorFilterDTO,
  ): Promise<{
    doctors: DoctorListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const { skip } = calculatePagination(page, limit);

    const repoFilter = {
      specialty: filters.specialty,
      search: filters.search,
      verificationStatus: filters.verificationStatus,
      isActive:
        typeof filters.isActive === 'string'
          ? filters.isActive === 'true'
          : (filters.isActive as boolean | undefined),
    };

    const { doctors, total } = await this._doctorRepository.getAllDoctors(
      skip,
      limit,
      repoFilter,
    );
    const mappedDoctors = doctors
      .map((doc: IDoctorDocument): DoctorListItem | null => {
        const user = doc.userId as unknown as IUserDocument;
        if (!user) return null;

        return DoctorMapper.toDoctorListItem(doc, user);
      })
      .filter((doc): doc is DoctorListItem => doc !== null);

    const paginatedResult = buildPaginatedResponse(
      mappedDoctors,
      total,
      page,
      limit,
    );

    return {
      doctors: paginatedResult.items,
      total: paginatedResult.total,
      page: paginatedResult.page,
      limit: paginatedResult.limit,
      totalPages: paginatedResult.totalPages,
    };
  }

  async getDoctorRequests(): Promise<DoctorRequestDTO[]> {
    const doctors = await this._doctorRepository.getAllDoctorRequests();
    return doctors
      .map(DoctorMapper.toDoctorRequestDTO)
      .filter((doc): doc is DoctorRequestDTO => doc !== null);
  }

  async getDoctorRequestDetails(
    doctorId: string,
    baseUrl?: string,
  ): Promise<DoctorRequestDetailsDTO | null> {
    const doc =
      await this._doctorRepository.getDoctorRequestDetailsById(doctorId);
    if (!doc || !doc.userId) {
      return null;
    }
    const dto = DoctorMapper.toDoctorRequestDetailsDTO(doc);

    if (dto.documents && dto.documents.length > 0) {
      dto.documents = await Promise.all(
        dto.documents.map(async (path) => {
          if (path.includes('amazonaws.com/')) {
            return await getPresignedUrl(path);
          }
          if (baseUrl && !path.startsWith('http')) {
            return baseUrl + path;
          }
          return path;
        }),
      );
    }

    return dto;
  }

  async approveDoctorRequest(doctorId: string): Promise<void> {
    await this._doctorRepository.updateById(doctorId, {
      verificationStatus: VerificationStatus.Approved,
      isActive: true,
    });
  }

  async rejectDoctorRequest(
    doctorId: string,
    rejectionReason: string,
  ): Promise<void> {
    await this._doctorRepository.updateById(doctorId, {
      verificationStatus: VerificationStatus.Reject,
      rejectionReason: rejectionReason,
    });
  }

  async banDoctor(doctorId: string): Promise<void> {
    await toggleEntityStatus(
      this._doctorRepository,
      doctorId,
      false,
      'Doctor',
      this._logger,
    );
  }

  async unbanDoctor(doctorId: string): Promise<void> {
    await toggleEntityStatus(
      this._doctorRepository,
      doctorId,
      true,
      'Doctor',
      this._logger,
    );
  }
}

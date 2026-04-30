import { generateToken, generateRefreshToken } from "../utils/jwt.utils";
import { comparePassword } from "../utils/password.utils";
import { UserMapper } from "../mappers/user.mapper";
import { AdminMapper } from "../mappers/admin.mapper";
import { UserRepository } from "../repositories/user.repository";
import { toggleEntityStatus } from "../utils/status-toggle.util";
import { ILoggerService } from "./interface/ILogger.service";
import { IAdminService } from "./interface/IAdminService";
import { IAdminRepository } from "../repositories/interface/IAdmin.repositor";
import { IUserRepository } from "../repositories/interface/IUser.repository";
import { AuthResponseDTO } from "../dtos/common.dto";
import { LoginAdminDTO, UserFilterDTO } from "../dtos/admin.dto/admin.dto";
import { UnauthorizedError } from "../errors/AppError";
import { PatientListItem, UserListItem } from "../types/common";
import { calculatePagination, buildPaginatedResponse } from '../utils/pagination.utils';
import { ROLES } from "../constants/constants";

export class AdminService implements IAdminService {
  constructor(
    private _adminRepository: IAdminRepository,
    private _userRepository: IUserRepository,
    private _logger: ILoggerService
  ) { }

  async loginAdmin(data: LoginAdminDTO): Promise<AuthResponseDTO> {
    const user = await this._adminRepository.findByEmail(data.email);


    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or Password");
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user: AdminMapper.toResponseDTO(user),
      token,
      refreshToken
    };
  }

  async getAllUsers(filter?: UserFilterDTO): Promise<UserListItem[]> {
    return []
  }

  async blockUser(userId: string): Promise<void> {
    await toggleEntityStatus(this._userRepository, userId, false, "Patient", this._logger);
  }

  async unblockUser(userId: string): Promise<void> {
    await toggleEntityStatus(this._userRepository, userId, true, "Patient", this._logger);
  }

  async getAllPatients(
    filters: UserFilterDTO
  ): Promise<{
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
      repoFilter.isActive = typeof filters.isActive === 'string'
        ? filters.isActive === 'true'
        : !!filters.isActive;
    }

    const { patients, total } = await this._userRepository.getAllPatients(skip, limit, repoFilter);

    const mappedPatients = patients.map(UserMapper.toPatientListItem);
    const paginatedResult = buildPaginatedResponse(mappedPatients, total, page, limit);

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

}
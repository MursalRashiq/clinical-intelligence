import { BaseUserResponseDTO } from '../../dtos/common.dto';
import { PaginationResult } from '../../types/pagination.type';
import { DoctorListResponseDTO } from '../../dtos/doctor.dto/doctor.dto';
import {
  UnifiedUpdateProfileDTO,
  UnifiedUserProfileResponseDTO,
  GetDoctorsQueryDTO,
} from '../../dtos/user.dtos/user.dto';

export interface IUserService {
  getUserProfile(userId: string): Promise<UnifiedUserProfileResponseDTO>;
  updateUserProfile(
    userId: string,
    data: UnifiedUpdateProfileDTO,
    imageFile?: Express.Multer.File,
  ): Promise<UnifiedUserProfileResponseDTO>;
  deleteUserAccount(userId: string): Promise<void>;
  getDoctors(
    query: GetDoctorsQueryDTO,
  ): Promise<PaginationResult<DoctorListResponseDTO>>;
  getDoctorProfileById(
    doctorId: string,
  ): Promise<UnifiedUserProfileResponseDTO>;
}

import { IUserService } from "./interface/IUser.service";
import { IUserRepository } from "../repositories/interface/IUser.repository";
import { IDoctorRepository } from "../repositories/interface/IDoctor.repository";
import { ILoggerService } from "./interface/ILogger.service";
import { BaseUserResponseDTO } from "../dtos/common.dto";
import { UserMapper } from "../mappers/user.mapper";
import { NotFoundError } from "../errors/AppError";
import { MESSAGES, ROLES } from "../constants/constants";
import { UnifiedUpdateProfileDTO, UnifiedUserProfileResponseDTO } from "../dtos/user.dtos/user.dto";
import { uploadToS3, getPresignedUrl } from "../utils/uploadToS3";
import { IUserDocument } from "../types/user.type";
import { IDoctorDocument } from "../types/doctor.type";

export class UserService implements IUserService {
    constructor(
        private _userRepository: IUserRepository,
        private _doctorRepository: IDoctorRepository,
        private _logger: ILoggerService
    ) { }

    async getUserProfile(userId: string): Promise<UnifiedUserProfileResponseDTO> {
        this._logger.info(`Fetching user profile for ID: ${userId}`);
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
        }
        
        let doctor = null;
        if (user.role === ROLES.DOCTOR) {
            doctor = await this._doctorRepository.findByUserId(userId);
        }
        
        const dto = UserMapper.toUnifiedDTO(user, doctor);
        // Generate presigned URL for profile image (private S3 bucket)
        if (dto.profileImage) {
            dto.profileImage = await getPresignedUrl(dto.profileImage);
        }
        return dto;
    }

    async updateUserProfile(userId: string, data: UnifiedUpdateProfileDTO, imageFile?: Express.Multer.File): Promise<UnifiedUserProfileResponseDTO> {
        this._logger.info(`Updating user profile for ID: ${userId}`);

        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
        }

        const info = data.information;
        
        if (info.phone && info.phone.length < 10){
            throw new Error(MESSAGES.INVALID_PHONE_NUMBER);
        }
        
        if (info.name && info.name.trim().length < 2){
            throw new Error(MESSAGES.INVALID_NAME);
        }

        const updateData: Partial<IUserDocument> & { dob?: Date } = {};
        if (info.name) updateData.name = info.name;
        if (info.phone) updateData.phone = info.phone;
        if (info.gender) updateData.gender = info.gender;
        if (info.dob) updateData.dob = typeof info.dob === 'string' ? new Date(info.dob) : info.dob;
        
        if (info.bloodGroup) updateData.bloodGroup = info.bloodGroup;
        if (info.address) updateData.address = info.address;
        if (info.city) updateData.city = info.city;
        if (info.state) updateData.state = info.state;
        if (info.country) updateData.country = info.country;
        if (info.pincode) updateData.pincode = info.pincode;
        
        if (imageFile) {
            const imageUrl = await uploadToS3(imageFile);
            updateData.profileImage = imageUrl;
        }

        const updatedUser = await this._userRepository.updateById(userId, updateData);
        if (!updatedUser) {
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
        }

        let updatedDoctor = null;
        if (user.role === ROLES.DOCTOR && data.additionalInfo) {
            const doctor = await this._doctorRepository.findByUserId(userId);
            if (doctor) {
                updatedDoctor = await this._doctorRepository.updateById(doctor._id.toString(), data.additionalInfo);
            }
        } else if (user.role === ROLES.DOCTOR) {
            updatedDoctor = await this._doctorRepository.findByUserId(userId);
        }

        const dto = UserMapper.toUnifiedDTO(updatedUser, updatedDoctor);
        // Generate presigned URL for profile image so the frontend can display it immediately
        if (dto.profileImage) {
            dto.profileImage = await getPresignedUrl(dto.profileImage);
        }
        return dto;
    }

    async deleteUserAccount(userId: string): Promise<void> {
        this._logger.info(`Deleting user account for ID: ${userId}`);
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
        }
        await this._userRepository.updateById(userId, { isActive: false });
        
        if (user.role === ROLES.DOCTOR) {
            const doctor = await this._doctorRepository.findByUserId(userId);
            if (doctor) {
                await this._doctorRepository.updateById(doctor._id.toString(), { isActive: false });
            }
        }
    }
}

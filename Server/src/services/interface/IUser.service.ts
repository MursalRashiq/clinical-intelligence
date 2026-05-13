import { BaseUserResponseDTO } from "../../dtos/common.dto";
import { UnifiedUpdateProfileDTO, UnifiedUserProfileResponseDTO } from "../../dtos/user.dtos/user.dto";

export interface IUserService {
    getUserProfile(userId: string): Promise<UnifiedUserProfileResponseDTO>;
    updateUserProfile(userId: string, data: UnifiedUpdateProfileDTO, imageFile?: Express.Multer.File): Promise<UnifiedUserProfileResponseDTO>;
    deleteUserAccount(userId: string): Promise<void>;
}

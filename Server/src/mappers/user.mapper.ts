import { IUser, IUserDocument } from "../types/user.type";
import { BaseUserResponseDTO } from "../dtos/common.dto";
import { UserResponseDTO, UnifiedUserDTO } from "../dtos/user.dtos/user.dto";
import { PatientListItem } from "../types/common";

export class UserMapper {
    static toDTO(user: IUserDocument): BaseUserResponseDTO {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone ?? null,
            profileImage: user.profileImage ?? null,
            customId: user.customId
        };
    }

    static toPatientListItem(user: IUserDocument): PatientListItem {
        return {
            id: user._id.toString(),
            customId: user.customId,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            profileImage: user.profileImage ?? null,
            gender: user.gender ?? null,
            dob: user.dob ?? null,
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date(),
            isActive: user.isActive
        };

    }
}

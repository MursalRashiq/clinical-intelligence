import { IUser, IUserDocument } from "../types/user.type";
import { BaseUserResponseDTO } from "../dtos/common.dto";
import { UserResponseDTO, UnifiedUserDTO } from "../dtos/user.dtos/user.dto";

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

    static toPatientListItem(user: IUserDocument): {
        id: string;
        customerId: string;
        name: string;
        email: string;
        phone?: string | null;
        profileImage: string | null;
        gender?: string | null;
        dob?: Date | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    } {
        return {
            id: user._id.toString(),
            customerId: user.customId,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            profileImage: user.profileImage ?? null,
            ...(user.gender !== undefined && { gender: user.gender }),
            dob: user.dob ?? null,
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date(),
            isActive: user.isActive
        };

    }
}

import { IUserDocument } from "../types/user.type";
import { AdminResponseDTO } from "../dtos/admin.dto/admin.dto";

export class AdminMapper {
    static toResponseDTO(user: IUserDocument): AdminResponseDTO {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        }
    }
}
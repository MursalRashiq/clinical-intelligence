export interface LoginAdminDTO {
    email: string;
    password: string;
}

export interface AdminResponseDTO {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface AuthResponseDTO {
    user: AdminResponseDTO;
    token: string;
    refreshToken?: string;
}

export interface UserFilterDTO {
    search?: string;
    isActive?: boolean | string;
    page?: number;
    limit?: number;
}



export interface JsonTransformReturnType {
    id: string;
    [key: string]: unknown;
}

export interface PatientListItem {
    id: string;
    customId?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    gender?: string | null;
    dob?: Date | null;
    profileImage?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date
}

export interface UserListItem {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "patient" | "doctor" | "admin";
    profileImage?: string | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date; 
}
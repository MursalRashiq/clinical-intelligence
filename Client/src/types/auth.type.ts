
export interface AuthUser {
    _id: string
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    profileImage?: string;
    isActive?: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
    role: string;
}

export interface LoginResponse {
    user: AuthUser;
    token: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    gender?: 'male' | 'female' | 'other';
    dob?: string;
    role?: "patient" | "doctor"
}

export interface OtpRequest {
    email: string;
    otp: string;
    role?: "patient" | "doctor" | "admin";
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
}

export interface ResetPasswordRequest {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface GoogleAuthResponse {
    user: AuthUser;
    token: string;
}
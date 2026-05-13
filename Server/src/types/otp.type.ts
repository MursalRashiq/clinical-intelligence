export interface IOtp {
    email: string;
    otp: string | null;
    userData: {
        name: string;
        email: string;
        phone?: string | null | undefined;
        passwordHash: string;
        role: string;
        gender?: "male" | "female" | "other" | null;
        dob?: Date | null;
    };
    expiresAt: Date;
    createdAt?: Date;
}

export interface OTPUserData {
    name: string;
    email: string;
    phone?: string | null | undefined;
    passwordHash: string;
    role: string;
    gender?: "male" | "female" | "other" | null;
    dob?: Date | null;
}

export interface OTPData {
    email: string;
    otp: string | null;
    userData: OTPUserData;
    expiresAt: Date;
    createdAt?: Date;
}
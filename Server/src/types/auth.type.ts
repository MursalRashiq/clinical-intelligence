import { Request } from 'express';


export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    name?: string;
    profileImage?: string;
    doctorId?: string;
    verificationStatus?: string;
    isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}
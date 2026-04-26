import jwt from "jsonwebtoken";
import { IUserDocument } from "../types/user.type";
import { JWTPayload } from "../types/auth.type";
import { env } from "../config/env";
import { JWT_CONFIG } from "../config/jwt";
import { AppError, UnauthorizedError } from "../errors/AppError";
import { HttpStatus, MESSAGES } from "../constants/constants";


const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKENT_SECRET = env.REFRESH_TOKEN_SECRET;

export const generateToken = (user: IUserDocument, doctorId?: string): string => {
    if(!ACCESS_TOKEN_SECRET) {
        throw new AppError(MESSAGES.JWT_SECRET_NOT_PROVIDED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const payload: JWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        ...(user.profileImage && { profileImage: user.profileImage }),
        ...(doctorId && {doctorId})  
    }

    return jwt.sign(payload, REFRESH_TOKENT_SECRET as jwt.Secret, {
         expiresIn: JWT_CONFIG.refreshExpireIn, 
        } as jwt.SignOptions);
 };

 export const generateRefreshToken = (user: IUserDocument, doctorId?: string): string => {
    if(!REFRESH_TOKENT_SECRET) {
        throw new AppError(MESSAGES.JWT_SECRET_NOT_PROVIDED, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const payload: JWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        ...(user.profileImage && { profileImage: user.profileImage }),
        ...(doctorId && {doctorId})  
    }

    return jwt.sign(payload, REFRESH_TOKENT_SECRET as jwt.Secret, {
         expiresIn: JWT_CONFIG.refreshExpireIn, 
        } as jwt.SignOptions);
 };

 export const verifyAccessToken = (token: string): JWTPayload => {
    if(!ACCESS_TOKEN_SECRET) {
        throw new AppError(MESSAGES.JWT_SECRET_NOT_PROVIDED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
    } catch (err) {
        throw new UnauthorizedError(MESSAGES.INVALID_ACCESS_TOKEN);
    }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
    if(!REFRESH_TOKENT_SECRET) {
        throw new AppError(MESSAGES.JWT_SECRET_NOT_PROVIDED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    try {
        return jwt.verify(token, REFRESH_TOKENT_SECRET) as JWTPayload;
    } catch (err) {
        throw new UnauthorizedError(MESSAGES.INVALID_REFRESH_TOKEN);
    }
};

export const decodeToken = (token: string): JWTPayload => {
    try {
        return jwt.decode(token) as JWTPayload;
    } catch (err) {
        throw new AppError(MESSAGES.INVALID_TOKEN, HttpStatus.BAD_REQUEST);
    };
}
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env';


export const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    PATIENT: 'patient'
} as const;

export const GENDER = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other'
} as const;

export const COOKIE_OPTIONS = {
    REFRESH_TOKEN: 'refreshToken',
    MAX_AGE: env.REFRESH_TOKEN_MAX_AGE,
    SAME_SITE_STRICT: "strict",
    SAME_SITE_LAX: "lax",
    SAME_SITE_NONE: "none",
    ENV_PRODUCTION: "production"
} as const;

export const CONFIG = {
    SESSION_MAX_AGE: env.SESSION_MAX_AGE,
    OTP_EXPIRY_TIME: 1,
    OTP_RESEND_DELAY_SECONDS: 30
} as const;
    



export enum HttpStatus {
    OK = StatusCodes.OK,
    CREATED = StatusCodes.CREATED,
    BAD_REQUEST = StatusCodes.BAD_REQUEST,
    UNAUTHORIZED = StatusCodes.UNAUTHORIZED,
    FORBIDDEN = StatusCodes.FORBIDDEN,
    NOT_FOUND = StatusCodes.NOT_FOUND,
    CONFLICT = StatusCodes.CONFLICT,
    INTERNAL_SERVER_ERROR = StatusCodes.INTERNAL_SERVER_ERROR,
    GONE = StatusCodes.GONE,
    UNPROCESSABLE_ENTITY = StatusCodes.UNPROCESSABLE_ENTITY,
    TOO_MANY_REQUESTS = StatusCodes.TOO_MANY_REQUESTS,
    SERVICE_UNAVAILABLE = StatusCodes.SERVICE_UNAVAILABLE,
    NOT_IMPLEMENTED = StatusCodes.NOT_IMPLEMENTED,
    BAD_GATEWAY = StatusCodes.BAD_GATEWAY,
    REQUEST_TIMEOUT = StatusCodes.REQUEST_TIMEOUT
}

export const MESSAGES = {
    SERVER_ERROR: "Server error",
    MONGODB_URI_MISSING: "MONGODB_URI missing in .env",
    MISSING_FIELDS: "All required fields must be provided",
    INVALID_ROLE: "Invalid role provided",
    UNAUTHORIZED: "Unauthorized",
    NOT_FOUND: "Not found",
    INVALID_ID_FORMAT: "Invalid ID format",
    OTP_SENT: "OTP sent to email",
    OTP_RESENT: "OTP resent to email",
    JWT_SECRET_NOT_PROVIDED: "JWT secret not provided in .env",

    PASSWORDS_NOT_MATCH: "Passwords do not match",
    PASSWORD_TOO_WEAK: "Password must be at least 6 characters and include one uppercase letter and one number",
    INVALID_EMAIL_FORMAT: "Invalid email format",
    INVALID_CREDENTIALS: "invalid credentilas",
    INVALID_PHONE_NUMBER: "Invalid phone number",
    INVALID_NAME: "Name must be at least 2 characters",
    INVALID_GENDER: "Gender must be male, female, or other",
    INVALID_ACCESS_TOKEN: "Invalid access token",
    INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
    INVALID_TOKEN: "Invalid token",
    WEAK_PASSWORD: "Password must be at least 8 characters and include one uppercase letter and one number",
    PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
    USER_EXIST_EMAIL: "User with this email already exists",
    USER_EXIST_PHONE: "User with this phone already exists",
    EMAIL_CREDENTIALS_NOT_CONFIGURED: "mail credentials are not configured. Please set up SMTP settings to send emails.",
    EMAIL_SEND_FAILED: "Unable to send email at the moment. Please try again later",
    OTP_INVALID_OR_EXPIRED: "Invalid or expired OTP",
    OTP_SESSION_EXPIRED: "OTP session has expired.",
    RESET_TOKEN_INVALID: "Invalid reset token.",
    EMAIL_ALREADY_REGISTERED: "Email is already registered",
    OTP_VERIFIED: "Otp verified successfully",

    USER_BLOCKED: "Your account has been blocked",
    GOOGLE_SIGNIN_REQUIRED: "Please sign in using Google.",
    REGISTRATION_COMPLETE: "Registration was completed successfully",
    ACCESS_TOKEN_MISSING: "Access token is missing. Please login to continue",
    REFRESH_TOKEN_MISSING: "Refresh token is missing from the request.",    
    LOGIN_SUCCESS: "Login successfully",
    INVALID_REFRESH_TOKEN_MISSING: "Refresh token is missing",
    TOKEN_REFRESHED: "Token refreshed successfully",
    PASSWORD_RESET_OTP: "Password reset OTP sent successfully",
    PASSWORD_RESET_SUCCESS: "Password has been reset successfully",
    LOGOUT_FAILED: "Logout failed. Please try again.",
    LOGOUT_SUCCESS: "Logged out successfully",
    NO_ACCOUNT_FOUND: "No account found with this email address.",
    USER_NOT_ACTIVE: "Your account is not active. Please contact support.",
    USER_NOT_FOUND: "User not found.",
};  
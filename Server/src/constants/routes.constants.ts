export const BASE_ROUTES = {
    AUTH: "/auth",
    ADMIN: "/admin",
    DOCTORS: "/doctors",
    USERS: "/users",
    PATIENTS: "/patients",
} as const;

export const USER_ROUTES = {
    PROFILE: "/profile",
    UPDATE_PROFILE: "/update-profile",
    DELETE_PROFILE: "/delete-profile",
}


export const AUTH_ROUTES = {
    GOOGLE: "/google",
    GOOGLE_CALLBACK: "/google/callback",
    GOOGLE_DOCTOR: "/google/doctor",
    REGISTER: "/register",
    VERIFY_OTP: "/verify-otp",
    RESEND_OTP: "/resend-otp",
    LOGIN: "/login",
    LOGOUT: "/logout",


    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_VERIFY_OTP: "/forgot-password-verify-otp",
    RESET_PASSWORD: "/reset-password",


    CHANGE_PASSWORD: "/change-password",
    REFRESH_TOKEN: "/refresh-token",
} as const;

export const ADMIN_ROUTES = {
    LOGIN: "/login",

    ALL_PATIENTS: "/patients",
    PATIENT_BY_ID: "/patients/:patientId",
    PATIENT_BLOCK: "/patients/:patientId/block",
    PATIENT_UNBLOCK: "/patients/:patientId/unblock",

    DOCTOR_REQUESTS: "/doctor-requests",
    DOCTOR_REQUEST_DETAILS: "/doctor-requests/:doctorId",
    APPROVE_DOCTOR: "/doctor-requests/:doctorId/approve",
    REJECT_DOCTOR: "/doctor-requests/:doctorId/reject",
    ALL_DOCTORS: "/doctors",
} as const;
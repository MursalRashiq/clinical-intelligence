export const BASE_ROUTES = {
    AUTH: "/auth",
    ADMIN: "/admin",
    DOCTORS: "/doctors",
    USERS: "/users",
} as const;


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